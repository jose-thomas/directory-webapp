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
  const [loading, setLoading] = useState(false);
  const [photoFileList, setPhotoFileList] = useState([]);

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

  // Function to handle form submission
  const handleSaveFamily = async () => {
    try {
      setLoading(true);
      console.log("Starting form validation...");
      const values = await form.validateFields();
      console.log("Form values:", values);
      
      // Group anniversary dates by date and assign serial numbers
      const anniversaryDatesMap = new Map();
      let serialCounter = 1;
      
      memberForms.forEach((_, index) => {
        const weddingDate = values[`member_${index}_weddingDate`];
        if (weddingDate) {
          const dateString = dayjs(weddingDate).format('YYYY-MM-DD');
          if (!anniversaryDatesMap.has(dateString)) {
            anniversaryDatesMap.set(dateString, {
              serialNo: serialCounter++,
              date: dateString,
              members: []
            });
          }
          anniversaryDatesMap.get(dateString).members.push({
            name: values[`member_${index}_fullName`],
            memberIndex: index
          });
        }
      });
      
      // Convert anniversary dates map to the required format
      const anniversaryDates = {};
      anniversaryDatesMap.forEach((value, key) => {
        anniversaryDates[value.serialNo] = key;
      });
      
      // Find the enum key for the selected unit display value
      const unitKey = Object.keys(Unit).find(key => Unit[key] === values.prayerUnit);
      
      // Prepare family data for submission (CreateFamilyRequest DTO)
      const familyData = {
        address: values.address,
        unit: unitKey, // Send enum key instead of display value
        houseName: values.houseName,
        anniversaryDates: anniversaryDates,
        familyMembers: memberForms.map((_, index) => {
          // Find the enum key for the selected blood group display value
          const bloodGroupKey = values[`member_${index}_bloodGroup`] 
            ? Object.keys(BloodGroup).find(key => BloodGroup[key] === values[`member_${index}_bloodGroup`])
            : null;
          
          return {
            name: values[`member_${index}_fullName`],
            dob: values[`member_${index}_birthDate`] ? dayjs(values[`member_${index}_birthDate`]).format('YYYY-MM-DD') : null,
            phoneNumber: values[`member_${index}_phoneNumber`] || null,
            emailId: values[`member_${index}_email`] || null,
            bloodGroup: bloodGroupKey, // Send enum key instead of display value
            isFamilyHead: familyHeadIndex === index,
            coupleNo: values[`member_${index}_coupleNo`] || null,
            // Don't send password and roles as per requirements
          };
        }),
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
          
          // Professional success notification with photo
          message.success("Family Created Successfully! Family details and photo have been saved to the directory."); // Use message from App.useApp()
        } catch (photoError) {
          console.error("Failed to upload photo:", photoError);
          message.warning("Family Saved, Photo Upload Failed. You can upload the photo later from the family details page."); // Use message from App.useApp()
        }
      } else {
        console.log("No photo to upload or no family ID");
        message.success("🎉 Family Created Successfully! Family details have been saved to the directory."); // Use message from App.useApp()
      }
      
      // Reset form after successful submission
      form.resetFields();
      setMemberForms([0]);
      setFamilyHeadIndex(0);
      setPhotoFileList([]);
    } catch (error) {
      console.error("Failed to save family details:", error);
      message.error("Failed to save family details. Please try again."); // Use message from App.useApp()
    } finally {
      setLoading(false);
    }
  };

  return (
    <App>
      <div 
        className="family-form-container" 
        style={{ 
          maxHeight: "calc(100vh - 120px)", // Leaves space for header, adjust as needed
          overflowY: "auto",
          padding: "24px",
          position: "relative",
          background: "#fff"
        }}
      >
        <Spin spinning={loading} tip="Saving...">
          <Form layout="vertical" form={form} className="family-form">
            {/* Save Family button moved to top */}
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
            
            {/* Remove the Save Family button from the bottom */}
            {/* Add some bottom padding to ensure the last elements are visible when scrolled */}
            <div style={{ height: "20px" }}></div>
          </Form>
        </Spin>
      </div>
    </App>
  );
}
