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
                memberValues[`member_${index}_birthDate`] = dayjs(member.dob, 'DD-MM-YY');
              } catch (error) {
                console.error("Error parsing birth date:", member.dob, error);
                memberValues[`member_${index}_birthDate`] = null;
              }
            } else {
              memberValues[`member_${index}_birthDate`] = null;
            }
            
            memberValues[`member_${index}_bloodGroup`] = member.bloodGroup ? BloodGroup[member.bloodGroup] : null;
            memberValues[`member_${index}_isMarried`] = member.isMarried || false;
            
            // Parse wedding date if exists
            if (member.weddingDate) {
              try {
                memberValues[`member_${index}_weddingDate`] = dayjs(member.weddingDate, 'DD-MM-YY');
              } catch (error) {
                console.error("Error parsing wedding date:", member.weddingDate, error);
                memberValues[`member_${index}_weddingDate`] = null;
              }
            }
          });
          
          form.setFieldsValue(memberValues);
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
    // Update family head index if removing the current head
    if (indexToRemove === familyHeadIndex) {
      setFamilyHeadIndex(0);
    } else if (indexToRemove < familyHeadIndex) {
      // Adjust family head index if removing member before the head
      setFamilyHeadIndex(familyHeadIndex - 1);
    }
    setMemberForms((prev) => prev.filter((_, index) => index !== indexToRemove));
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
      
      // Separate new members from existing ones
      const newMembers = [];
      const existingMembers = [];
      
      memberForms.forEach((_, index) => {
        const memberData = {
          name: values[`member_${index}_fullName`],
          dob: values[`member_${index}_birthDate`] ? dayjs(values[`member_${index}_birthDate`]).format('YYYY-MM-DD') : null,
          phoneNumber: values[`member_${index}_phoneNumber`] || null,
          emailId: values[`member_${index}_email`] || null,
          bloodGroup: values[`member_${index}_bloodGroup`] 
            ? Object.keys(BloodGroup).find(key => BloodGroup[key] === values[`member_${index}_bloodGroup`])
            : null,
          isFamilyHead: familyHeadIndex === index,
          coupleNo: values[`member_${index}_coupleNo`] || null,
        };
        
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
          // New member
          newMembers.push(memberData);
        }
      });
      
      // Prepare family update data
      const familyUpdateData = {
        address: values.address,
        unit: unitKey,
        houseName: values.houseName,
        familyMembers: existingMembers
      };
      
      console.log("Family update data being sent to API:", familyUpdateData);
      console.log("Address in update data:", familyUpdateData.address);
      console.log("Unit in update data:", familyUpdateData.unit);
      console.log("House name in update data:", familyUpdateData.houseName);
      
      // Update existing family
      await updateFamily(familyId, familyUpdateData);
      
      // Add new members if any
      if (newMembers.length > 0) {
        console.log("Adding new members:", newMembers);
        console.log("Family ID:", familyId);
        console.log("New members request data:", JSON.stringify(newMembers, null, 2));
        await addFamilyMembers(familyId, newMembers);
      }
      
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
                />
                {/* Show Add button only after the last member form */}
                {index === memberForms.length - 1 && (
                  <Button type="dashed" onClick={addNewMember} block style={{ marginTop: "16px" }}>
                    + Add Family Member
                  </Button>
                )}
              </div>
            ))}
            
            <div style={{ height: "20px" }}></div>
          </Form>
        </Spin>
      </div>
    </App>
  );
}
