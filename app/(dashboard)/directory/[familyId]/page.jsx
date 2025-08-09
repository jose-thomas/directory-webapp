"use client";

import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  Typography,
  message,
  Spin,
  Modal,
  App,
  DatePicker, // Import DatePicker
} from "antd";
import { useParams, useRouter } from "next/navigation";
import Unit from "@/enums/Unit";
import BloodGroup from "@/enums/BloodGroup";
import FamilyMemberForm from "@/components/FamilyMemberForm";
import FamilyPhotoUpload from "@/components/FamilyPhotoUpload";
import { 
  getFamilyById, 
  updateFamily, 
  addFamilyMembers, 
  uploadFamilyPhoto, 
  deleteFamilyPhoto,
  deleteFamily
} from "@/lib/services/familyService";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

export default function FamilyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const familyId = params.familyId;
  const { modal, message } = App.useApp(); // Destructure message as well
  
  const [form] = Form.useForm();
  const [familyHeadIndex, setFamilyHeadIndex] = useState(0);
  const [memberForms, setMemberForms] = useState([]);
  const [couples, setCouples] = useState([]);
  const [familyMembersToRemove, setFamilyMembersToRemove] = useState([]);
  const [couplesToBeRemoved, setCouplesToBeRemoved] = useState([]);
  const [originalAnniversaryDates, setOriginalAnniversaryDates] = useState(new Map()); // Map<Short, Date>
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [familyData, setFamilyData] = useState(null);
  const [originalPhotoUrl, setOriginalPhotoUrl] = useState(null);
  const [photoFileList, setPhotoFileList] = useState([]);

  // Load family data on component mount
  useEffect(() => {
    const loadFamilyData = async () => {
      try {
        setInitialLoading(true);
        const family = await getFamilyById(familyId);
        console.log("Loaded family data:", family);
        console.log("Family photo URL:", family.photoUrl);
        setFamilyData(family);
        
        // Prepare photo file object
        const photoList = family.photoUrl ? [{ 
          uid: '-1', 
          name: 'family-photo', 
          status: 'done',
          url: family.photoUrl 
        }] : [];
        
        console.log("Photo file list for form:", photoList);
        
        // Set photo file list state
        setPhotoFileList(photoList);
        
        // Set form values (without upload field for now)
        const formValues = {
          address: family.address,
          prayerUnit: Unit[family.unit] || family.unit,
          houseName: family.houseName,
        };
        
        console.log("Setting form values:", formValues);
        form.setFieldsValue(formValues);
        
        // Set original photo URL
        setOriginalPhotoUrl(family.photoUrl);
        
        // Set member forms and form values
        if (family.familyMembers && family.familyMembers.length > 0) {
          const memberKeys = family.familyMembers.map((_, index) => index);
          setMemberForms(memberKeys);
          
          // Find family head
          const headIndex = family.familyMembers.findIndex(member => member.isFamilyHead);
          setFamilyHeadIndex(headIndex >= 0 ? headIndex : 0);
          
          // Set member form values
          const memberValues = {};
          family.familyMembers.forEach((member, index) => {
            memberValues[`member_${index}_fullName`] = member.name;
            memberValues[`member_${index}_email`] = member.emailId;
            memberValues[`member_${index}_phoneNumber`] = member.phoneNumber;
            
            // Parse date in dd-MM-yy format from API
            if (member.dob) {
              try {
                memberValues[`member_${index}_birthDate`] = dayjs(member.dob, 'DD-MM-YYYY');
              } catch (error) {
                console.error("Error parsing birth date:", member.dob, error);
                memberValues[`member_${index}_birthDate`] = null;
              }
            } else {
              memberValues[`member_${index}_birthDate`] = null;
            }
            
            memberValues[`member_${index}_bloodGroup`] = member.bloodGroup ? BloodGroup[member.bloodGroup] : null;
            memberValues[`member_${index}_coupleNo`] = member.coupleNo || null; // Set coupleNo
          });
          
          form.setFieldsValue(memberValues);

          // Populate couples state from family.couples list
          const loadedCouples = [];
          const originalAnniversaryDatesMap = new Map(); // To track original dates for updates

          if (family.couples && family.couples.length > 0) {
            family.couples.forEach(couple => {
              // Find member indices for spouse1Id and spouse2Id
              const spouse1Index = family.familyMembers.findIndex(m => m.id === couple.spouse1Id);
              const spouse2Index = family.familyMembers.findIndex(m => m.id === couple.spouse2Id);
              
              const memberKeysForCouple = [];
              if (spouse1Index !== -1) memberKeysForCouple.push(spouse1Index);
              if (spouse2Index !== -1) memberKeysForCouple.push(spouse2Index);

              const coupleId = Date.now() + Math.random(); // Unique ID for frontend state
              const anniversaryDate = couple.anniversaryDate ? dayjs(couple.anniversaryDate) : null;
              
              loadedCouples.push({
                id: coupleId,
                coupleNo: couple.coupleNo, // Store original coupleNo
                members: memberKeysForCouple,
                anniversaryDate: anniversaryDate,
              });
              
              // Track original anniversary date for updates
              originalAnniversaryDatesMap.set(couple.coupleNo, anniversaryDate ? anniversaryDate.format('YYYY-MM-DD') : null);
            });
          }
          setCouples(loadedCouples);
          setOriginalAnniversaryDates(originalAnniversaryDatesMap); // Set original map

          // Set anniversary dates and selected members in form fields
          loadedCouples.forEach((couple) => {
            if (couple.anniversaryDate) {
              form.setFieldValue(`couple_${couple.id}_anniversaryDate`, couple.anniversaryDate);
            }
            form.setFieldValue(`couple_${couple.id}_members`, couple.members);
          });
        } else {
          setMemberForms([0]);
        }
      } catch (error) {
        console.error("Failed to load family data:", error);
        message.error("Failed to load family details. Please try again.");
      } finally {
        setInitialLoading(false);
      }
    };

    if (familyId) {
      loadFamilyData();
    }
  }, [familyId, form]);

  const handleDeleteFamily = () => {
    modal.confirm({ // Use modal.confirm from App.useApp()
      title: 'Are you sure you want to delete this family?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No, Cancel',
      onOk: async () => {
        try {
          setLoading(true);
          await deleteFamily(familyId);
          message.success("Family deleted successfully!"); // Use message from App.useApp()
          router.push("/directory"); // Redirect to directory page after deletion
        } catch (error) {
          console.error("Failed to delete family:", error);
          message.error("Failed to delete family. Please try again.");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const addNewMember = () => {
    setMemberForms((prev) => [...prev, Date.now()]);
  };

  const removeMember = (indexToRemove) => {
    const memberKeyToRemove = memberForms[indexToRemove];
    const isMemberInCouple = couples.some(couple => couple.members.includes(memberKeyToRemove));

    if (isMemberInCouple) {
      message.error("Cannot remove a family member who is part of a couple. Please remove them from the couple first.");
      return;
    }

    // Update family head index if removing the current head
    if (indexToRemove === familyHeadIndex) {
      setFamilyHeadIndex(0);
    } else if (indexToRemove < familyHeadIndex) {
      // Adjust family head index if removing member before the head
      setFamilyHeadIndex(familyHeadIndex - 1);
    }
    // If the removed member is an existing one, add their ID to familyMembersToRemove
    if (indexToRemove < familyData.familyMembers.length) {
      setFamilyMembersToRemove((prev) => [...prev, familyData.familyMembers[indexToRemove].id]);
    }
    setMemberForms((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const addNewCouple = () => {
    setCouples((prev) => [...prev, { id: Date.now(), members: [], anniversaryDate: null }]);
  };

  const removeCouple = (idToRemove) => {
    setCouples((prev) => {
      const removedCouple = prev.find((couple) => couple.id === idToRemove);
      if (removedCouple && removedCouple.coupleNo) { // Check if it's an existing couple with a coupleNo
        setCouplesToBeRemoved((prevRemoved) => [
          ...prevRemoved,
          {
            coupleNo: removedCouple.coupleNo,
            anniversaryDate: removedCouple.anniversaryDate ? dayjs(removedCouple.anniversaryDate).format('YYYY-MM-DD') : null,
          },
        ]);
      }
      return prev.filter((couple) => couple.id !== idToRemove);
    });
  };

  const handleSaveFamily = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      console.log("Form values on submit:", values);
      console.log("Address value:", values.address);
      console.log("Prayer unit value:", values.prayerUnit);
      console.log("House name value:", values.houseName);
      
      // Find the enum key for the selected unit display value
      const unitKey = Object.keys(Unit).find(key => Unit[key] === values.prayerUnit);
      
      // Prepare anniversaryDates map and couples for update/removal
      const currentAnniversaryDates = {};
      const couplesThatNeedUpdate = [];

      couples.forEach((couple) => {
        const coupleNo = couple.coupleNo || null; // Use existing coupleNo or null for new couples
        const anniversaryDate = values[`couple_${couple.id}_anniversaryDate`]
          ? dayjs(values[`couple_${couple.id}_anniversaryDate`]).format('YYYY-MM-DD')
          : null;

        if (coupleNo) {
          // Existing couple: check for anniversary date changes
          const originalDate = originalAnniversaryDates.get(coupleNo);
          if (originalDate !== anniversaryDate) {
            couplesThatNeedUpdate.push({
              coupleNo: coupleNo,
              anniversaryDate: anniversaryDate,
            });
          }
          currentAnniversaryDates[coupleNo] = anniversaryDate;
        } else {
          // New couple: these will be handled when new members are added
          // The backend will assign coupleNo and add to anniversaryDates
        }
      });

      // Separate new members from existing ones
      const newMembers = [];
      const existingMembers = [];
      
      memberForms.forEach((memberKey, index) => {
        const memberData = {
          name: values[`member_${index}_fullName`],
          dob: values[`member_${index}_birthDate`] ? dayjs(values[`member_${index}_birthDate`]).format('YYYY-MM-DD') : null,
          phoneNumber: values[`member_${index}_phoneNumber`] || null,
          emailId: values[`member_${index}_email`] || null,
          bloodGroup: values[`member_${index}_bloodGroup`] 
            ? Object.keys(BloodGroup).find(key => BloodGroup[key] === values[`member_${index}_bloodGroup`])
            : null,
          isFamilyHead: familyHeadIndex === index,
          coupleNo: null, // Default to null, will be updated below
        };
        
        // Determine coupleNo for both existing and new members
        const associatedCouple = couples.find(couple => 
          couple.members.includes(memberKey)
        );
        if (associatedCouple) {
          memberData.coupleNo = associatedCouple.coupleNo; // Assign coupleNo if associated with any couple
        }

        console.log(`Member ${index} data:`, memberData);
        console.log(`Member ${index} birth date value:`, values[`member_${index}_birthDate`]);
        console.log(`Member ${index} formatted dob:`, memberData.dob);
        
        // Check if this is a new member (no corresponding member in original data)
        if (index < familyData.familyMembers.length) {
          // Existing member - add ID for update
          existingMembers.push({
            ...memberData,
            id: familyData.familyMembers[index].id
          });
        } else {
          // New member - include anniversaryDate and partnerId if part of a couple
          console.log(`Processing new member with key: ${memberKey}, index: ${index}`);
          console.log(`All couples:`, couples);
          console.log(`Member forms:`, memberForms);
          
          // Check if this new member is part of any couple (existing or new)
          const memberCouple = couples.find(couple => 
            couple.members.includes(memberKey)
          );
          
          console.log(`Found couple for new member:`, memberCouple);
          
          if (memberCouple) {
            // Find the memberKey of the partner in this couple
            const partnerMemberKey = memberCouple.members.find(mk => mk !== memberKey);
            
            let resolvedPartnerId = null;
            // Find the partner's index in memberForms to determine if they are an existing member
            const partnerIndexInMemberForms = memberForms.findIndex(key => key === partnerMemberKey);
            
            // If the partner's index is within the range of existing members, get their ID
            if (partnerIndexInMemberForms !== -1 && partnerIndexInMemberForms < familyData.familyMembers.length) {
                resolvedPartnerId = familyData.familyMembers[partnerIndexInMemberForms]?.id;
            }
            
            // Get anniversary date from form values for this couple
            const coupleAnniversaryDate = values[`couple_${memberCouple.id}_anniversaryDate`]
              ? dayjs(values[`couple_${memberCouple.id}_anniversaryDate`]).format('YYYY-MM-DD')
              : null;
            
            // Log for debugging
            console.log(`New member (key: ${memberKey}) partner key: ${partnerMemberKey}, partner index: ${partnerIndexInMemberForms}, partnerId: ${resolvedPartnerId}, anniversaryDate: ${coupleAnniversaryDate}`);

            newMembers.push({
              ...memberData,
              anniversaryDate: coupleAnniversaryDate,
              partnerId: resolvedPartnerId, // Use the resolved partnerId (existing member's ID)
            });
          } else {
            console.log(`No couple found for new member with key: ${memberKey}`);
            newMembers.push(memberData);
          }
        }
      });
      
      // Prepare family update data
      const familyUpdateData = {
        address: values.address,
        unit: unitKey,
        houseName: values.houseName,
        familyMembers: existingMembers,
        familyMembersToRemove: familyMembersToRemove, // Add removed members
        couplesToBeRemoved: couplesToBeRemoved, // Add removed couples
        couplesThatNeedUpdate: couplesThatNeedUpdate, // Add updated couples
        anniversaryDates: currentAnniversaryDates, // Ensure this is the final map of all active anniversaries
        familyMembersToAdd: newMembers, // Add new members directly to the update request
      };
      
      console.log("Family update data being sent to API:", familyUpdateData);
      console.log("Address in update data:", familyUpdateData.address);
      console.log("Unit in update data:", familyUpdateData.unit);
      console.log("House name in update data:", familyUpdateData.houseName);
      
      // Update existing family
      await updateFamily(familyId, familyUpdateData);
      
      // Handle photo changes using state instead of form values
      const hasNewPhoto = photoFileList && photoFileList.length > 0 && photoFileList[0].originFileObj;
      const hasRemovedPhoto = originalPhotoUrl && (!photoFileList || photoFileList.length === 0);
      
      if (hasRemovedPhoto) {
        // Photo was removed
        try {
          await deleteFamilyPhoto(familyId);
        } catch (photoError) {
          console.error("Failed to delete photo:", photoError);
        }
      }
      
      if (hasNewPhoto) {
        // New photo was uploaded
        try {
          const file = photoFileList[0].originFileObj;
          await uploadFamilyPhoto(familyId, file);
        } catch (photoError) {
          console.error("Failed to upload photo:", photoError);
        }
      }
      
      message.success("🎉 Family details updated successfully!");
      
      // Reload family data to reflect changes
      const updatedFamily = await getFamilyById(familyId);
      setFamilyData(updatedFamily);
      setOriginalPhotoUrl(updatedFamily.photoUrl);
      
    } catch (error) {
      console.error("Failed to update family details:", error);
      message.error("Failed to update family details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <Spin size="large" tip="Loading family details..." />
      </div>
    );
  }

  if (!familyData) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <Typography.Text>Family not found</Typography.Text>
      </div>
    );
  }

  return (
    <App>
      <div 
        className="family-form-container" 
        style={{ 
          maxHeight: "calc(100vh - 120px)",
          overflowY: "auto",
          padding: "24px",
          position: "relative",
          background: "#fff"
        }}
      >
        <Spin spinning={loading} tip="Updating...">
          <Form layout="vertical" form={form} className="family-form">
            {/* Header with Back button and Save button */}
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
              <Col>
                <Button onClick={() => router.back()}>
                  ← Back to Directory
                </Button>
              </Col>
              <Col>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleSaveFamily}
                  loading={loading}
                  style={{ minWidth: "150px", marginRight: "10px" }}
                >
                  Update Family
                </Button>
                <Button
                  danger
                  size="large"
                  onClick={handleDeleteFamily}
                  loading={loading}
                  style={{ minWidth: "150px" }}
                >
                  Delete Family
                </Button>
              </Col>
            </Row>

            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Upload Family Photo"
                  name="upload"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => {
                    if (Array.isArray(e)) {
                      return e;
                    }
                    return e?.fileList;
                  }}
                >
                  <FamilyPhotoUpload 
                    value={photoFileList}
                    onChange={(newFileList) => {
                      console.log("Photo onChange called with:", newFileList);
                      setPhotoFileList(newFileList);
                      form.setFieldValue('upload', newFileList);
                    }}
                  />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item 
                  label="Prayer Unit" 
                  name="prayerUnit" 
                  rules={[{ required: true, message: "Please select a prayer unit!" }]}
                >
                  <Select placeholder="Select Prayer Unit">
                    {Object.entries(Unit).map(([key, value]) => (
                      <Option key={key} value={value}>
                        {value}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item 
                  label="Address" 
                  name="address" 
                  rules={[{ required: true, message: "Please enter the address!" }]}
                >
                  <Input.TextArea placeholder="Enter Address" rows={3} />
                </Form.Item>

                <Form.Item 
                  label="House Name" 
                  name="houseName"
                >
                  <Input placeholder="Enter House Name" />
                </Form.Item>
              </Col>
            </Row>

            <div style={{ margin: "20px 0" }}>
              <Title level={4}>Family Members</Title>
            </div>

            {memberForms.map((key, index) => (
              <div key={key} style={{ marginBottom: "24px", border: "1px solid #f0f0f0", padding: "16px", borderRadius: "8px" }}>
                <Row justify="space-between" align="middle" style={{ marginBottom: "16px" }}>
                  <Col>
                    <Title level={5}>
                      Member {index + 1}
                      {index < familyData.familyMembers.length && (
                        <span style={{ color: '#666', fontSize: '14px', fontWeight: 'normal' }}>
                          {' '}(Existing)
                        </span>
                      )}
                      {index >= familyData.familyMembers.length && (
                        <span style={{ color: '#52c41a', fontSize: '14px', fontWeight: 'normal' }}>
                          {' '}(New)
                        </span>
                      )}
                    </Title>
                  </Col>
                  {index > 0 && (
                    <Col>
                      <Button
                        danger
                        onClick={() => removeMember(index)}
                      >
                        Remove
                      </Button>
                    </Col>
                  )}
                </Row>
                <FamilyMemberForm
                  namePrefix={`member_${index}_`}
                  isFamilyHead={familyHeadIndex === index}
                  onSelectFamilyHead={() => setFamilyHeadIndex(index)}
                  memberKey={key} // Pass the unique key for member selection in couples
                />
                {/* Show Add button only after the last member form */}
                {index === memberForms.length - 1 && (
                  <Button type="dashed" onClick={addNewMember} block style={{ marginTop: "16px" }}>
                    + Add Family Member
                  </Button>
                )}
              </div>
            ))}

            <div style={{ margin: "20px 0" }}>
              <Title level={4}>Couples & Anniversaries</Title>
              <Button type="dashed" onClick={addNewCouple} block style={{ marginTop: "16px", marginBottom: "24px" }}>
                + Add Couple
              </Button>
            </div>

            {couples.map((couple, index) => (
              <div key={couple.id} style={{ marginBottom: "24px", border: "1px solid #f0f0f0", padding: "16px", borderRadius: "8px" }}>
                <Row justify="space-between" align="middle" style={{ marginBottom: "16px" }}>
                  <Col>
                    <Title level={5}>Couple {index + 1}</Title>
                  </Col>
                  <Col>
                    <Button
                      danger
                      onClick={() => removeCouple(couple.id)}
                    >
                      Remove Couple
                    </Button>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Select Members"
                      name={`couple_${couple.id}_members`}
                      rules={[{ required: true, message: "Please select two members for the couple!" }]}
                    >
                      <Select
                        mode="multiple"
                        placeholder="Select two members"
                        maxCount={2}
                        onChange={(selectedMemberKeys) => {
                          setCouples(prev => prev.map(c =>
                            c.id === couple.id ? { ...c, members: selectedMemberKeys } : c
                          ));
                        }}
                      >
                        {memberForms.map((memberKey, memberIndex) => {
                          const isMemberSelectedInOtherCouple = couples.some(
                            (c) => c.id !== couple.id && c.members.includes(memberKey)
                          );
                          const memberName = form.getFieldValue(`member_${memberIndex}_fullName`) || `Member ${memberIndex + 1}`;
                          return (
                            <Option 
                              key={memberKey} 
                              value={memberKey} 
                              disabled={isMemberSelectedInOtherCouple}
                            >
                              {memberName} {isMemberSelectedInOtherCouple && "(Already in a couple)"}
                            </Option>
                          );
                        })}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Anniversary Date"
                      name={`couple_${couple.id}_anniversaryDate`}
                    >
                      <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            ))}
            
            <div style={{ height: "20px" }}></div>
          </Form>
        </Spin>
      </div>
    </App>
  );
}
