"use client";

import React, { useState } from "react";
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
  App, // Import App component
  DatePicker, // Import DatePicker
} from "antd";
import Unit from "@/enums/Unit";
import BloodGroup from "@/enums/BloodGroup";
import FamilyMemberForm from "@/components/FamilyMemberForm";
import FamilyPhotoUpload from "@/components/FamilyPhotoUpload";
import { createFamily, uploadFamilyPhoto } from "@/lib/services/familyService";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

//Main component
export default function FamilyFormPage() {
  const { message } = App.useApp(); // Destructure message from useApp hook
  const [form] = Form.useForm();
  const [familyHeadIndex, setFamilyHeadIndex] = useState(0);
  const [memberForms, setMemberForms] = useState([0]);
  const [couples, setCouples] = useState([]); // New state for couples
  const [loading, setLoading] = useState(false);
  const [photoFileList, setPhotoFileList] = useState([]);

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
    setMemberForms((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const addNewCouple = () => {
    setCouples((prev) => [...prev, { id: Date.now(), members: [], anniversaryDate: null }]);
  };

  const removeCouple = (idToRemove) => {
    setCouples((prev) => prev.filter((couple) => couple.id !== idToRemove));
  };

  // Function to handle form submission
  const handleSaveFamily = async () => {
    try {
      setLoading(true);
      console.log("Starting form validation...");
      const values = await form.validateFields();
      console.log("Form values:", values);

      // Prepare family members data
      const familyMembers = memberForms.map((_, index) => {
        const bloodGroupKey = values[`member_${index}_bloodGroup`]
          ? Object.keys(BloodGroup).find(key => BloodGroup[key] === values[`member_${index}_bloodGroup`])
          : null;

        return {
          name: values[`member_${index}_fullName`],
          dob: values[`member_${index}_birthDate`] ? dayjs(values[`member_${index}_birthDate`]).format('YYYY-MM-DD') : null,
          phoneNumber: values[`member_${index}_phoneNumber`] || null,
          emailId: values[`member_${index}_email`] || null,
          bloodGroup: bloodGroupKey,
          isFamilyHead: familyHeadIndex === index,
          coupleNo: null, // Will be updated below if part of a couple
        };
      });

      // Prepare couples data and anniversaryDates map
      const anniversaryDates = {};
      const couplesData = couples.map((couple, coupleIndex) => {
        const coupleNo = coupleIndex + 1; // Assign serial number as coupleNo
        const anniversaryDate = values[`couple_${couple.id}_anniversaryDate`]
          ? dayjs(values[`couple_${couple.id}_anniversaryDate`]).format('YYYY-MM-DD')
          : null;

        if (anniversaryDate) {
          anniversaryDates[coupleNo] = anniversaryDate;
        }

        // Update coupleNo for members in familyMembers array
        couple.members.forEach(memberId => {
          const memberIndex = memberForms.findIndex(key => key === memberId);
          if (memberIndex !== -1) {
            familyMembers[memberIndex].coupleNo = coupleNo;
          }
        });

        return {
          coupleNo: coupleNo,
          memberIds: couple.members, // Store the unique keys of selected members
          anniversaryDate: anniversaryDate, // Keep this for the couples array if needed by backend
        };
      });

      // Find the enum key for the selected unit display value
      const unitKey = Object.keys(Unit).find(key => Unit[key] === values.prayerUnit);

      // Prepare family data for submission (CreateFamilyRequest DTO)
      const familyData = {
        address: values.address,
        unit: unitKey,
        houseName: values.houseName,
        familyMembers: familyMembers,
        couples: couplesData, // Include the new couples data
        anniversaryDates: anniversaryDates, // Include the new anniversaryDates map
      };

      // Call the createFamily API
      console.log("Calling createFamily API with data:", familyData);
      const createdFamily = await createFamily(familyData);
      console.log("Family created successfully:", createdFamily);

      // Check if there's a photo to upload using state
      if (photoFileList && photoFileList.length > 0 && createdFamily.id) {
        try {
          const file = photoFileList[0].originFileObj;
          await uploadFamilyPhoto(createdFamily.id, file);

          message.success("Family Created Successfully! Family details and photo have been saved to the directory.");
        } catch (photoError) {
          console.error("Failed to upload photo:", photoError);
          message.warning("Family Saved, Photo Upload Failed. You can upload the photo later from the family details page.");
        }
      } else {
        console.log("No photo to upload or no family ID");
        message.success("🎉 Family Created Successfully! Family details have been saved to the directory.");
      }

      // Reset form after successful submission
      form.resetFields();
      setMemberForms([0]);
      setCouples([]); // Reset couples state
      setFamilyHeadIndex(0);
      setPhotoFileList([]);
    } catch (error) {
      console.error("Failed to save family details:", error);
      message.error("Failed to save family details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <App>
      <div 
        className="family-form-container" 
        style={{ 
          padding: "24px",
          position: "relative",
          background: "#fff"
        }}
      >
        <Spin spinning={loading} tip="Saving...">
          <Form layout="vertical" form={form} className="family-form">
            <Form.Item style={{ marginBottom: 24, textAlign: "right" }}>
              <Button
                type="primary"
                size="large"
                onClick={handleSaveFamily}
                loading={loading}
                style={{ minWidth: "150px" }}
              >
                Save Family
              </Button>
            </Form.Item>
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
              <Title level={4}>Add Family Details</Title>
            </div>

            {memberForms.map((key, index) => (
              <div key={key} style={{ marginBottom: "24px", border: "1px solid #f0f0f0", padding: "16px", borderRadius: "8px" }}>
                <Row justify="space-between" align="middle" style={{ marginBottom: "16px" }}>
                  <Col>
                    <Title level={5}>Member {index + 1}</Title>
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
                {/* Corrected: Wrap Cols in a Row */}
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
          </Form>
        </Spin>
      </div>
    </App>
  );
}
