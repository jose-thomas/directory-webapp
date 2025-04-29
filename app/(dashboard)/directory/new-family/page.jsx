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
} from "antd";
import { Footer } from "antd/es/layout/layout";
import units from "@/constants/units";
import FamilyMemberForm from "@/components/FamilyMemberForm";
import FamilyPhotoUpload from "@/components/FamilyPhotoUpload";

const { Title } = Typography;
const { Option } = Select;

//Main component
export default function FamilyFormPage() {
  const [form] = Form.useForm();
  const [familyHeadIndex, setFamilyHeadIndex] = useState(0); // default: first member is family head
  const [memberForms, setMemberForms] = useState([0]);

  const addNewMember = () => {
    setMemberForms((prev) => [...prev, Date.now()]); // Use Date.now() for unique keys
  };

  const removeMember = (indexToRemove) => {
    setMemberForms((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          flex: 1,
          overflow: "auto",
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE 10+
        }}
        className="no-scrollbar"
      >

        <div style={{ padding: 24, maxWidth: 1200, marginLeft: 28 }}>

          {/* Image upload component */}
          <Form layout="vertical" form={form} >
            <Row gutter={50}>
              <Col span={12}>
                <FamilyPhotoUpload />
              </Col>

              {/* Input components */}
              <Col span={12}>
                <Form.Item label="Prayer Unit" style={{ textAlign: "left" }} name="prayerUnit" rules={[{ required: true, message: "Please select a prayer unit!" }]}>
                  <Select placeholder="Select Prayer Unit">
                    {units.map((unit) => (
                      <Option key={unit} value={unit}>
                        {unit}
                      </Option>
                    ))}
                  </Select>
                  <div style={{ marginBottom: '25px' }}></div>
                </Form.Item>

                <Form.Item label="Address" name="address" rules={[{ required: true, message: "Please enter the address!" }]}>
                  <Input.TextArea placeholder="Enter Address" rows={3} />
                  <div style={{ marginBottom: '25px' }}></div>
                </Form.Item>

                <Form.Item label="House Name" name="houseName">
                  <Input placeholder="Enter House Name" />
                  <div style={{ marginBottom: '25px' }}></div>
                </Form.Item>
              </Col>
            </Row>

            {/* Add family details component */}
            <Title level={4} style={{ textAlign: "left", marginTop: 20, marginBottom: 20 }}>Add Family Details</Title>

            {memberForms.map((key, index) => (
              <div key={key} style={{ marginBottom: "20px" }}>
                {index > 0 && (
                  <Row gutter={50}>
                    <Col span={12} />
                    <Col span={12}>
                      <Button
                        onClick={() => removeMember(index)}
                        style={{
                          backgroundColor: "red",
                          color: "white",
                          border: "1px solid red",
                          padding: "6px 12px",
                          float: "right",
                          fontSize: "14px",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Remove
                      </Button>
                    </Col>
                  </Row>
                )}
                <FamilyMemberForm
                  namePrefix={`member_${index}_`}
                  isFamilyHead={familyHeadIndex === index}
                  onSelectFamilyHead={() => setFamilyHeadIndex(index)}
                />
              </div>
            ))}

            <Form.Item style={{ marginTop: 20, textAlign: "left" }}>
              <Button type="primary" onClick={addNewMember}>Add Member</Button>
            </Form.Item>
          </Form>

          <Footer style={{ height: 200 }} />
        </div>
      </div>
    </div>
  );
}
