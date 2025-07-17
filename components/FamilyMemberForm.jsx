import React from "react";
import { Form, Input, DatePicker, Radio, Select, Row, Col, Divider } from "antd";
import BloodGroup from "@/enums/BloodGroup";
const { Option } = Select;

// Add member component 
export default function FamilyMemberForm({ namePrefix = "", isFamilyHead, onSelectFamilyHead }) {
    return (
        <>
            <Row gutter={50}>
                <Col span={12}>
                    <Form.Item label="Full Name" name={`${namePrefix}fullName`} rules={[{ required: true, message: "Please enter the full name!" }]}>
                        <Input placeholder="Enter Full Name" />
                    </Form.Item>
                </Col>

                <Col span={12}>
                    <Form.Item label=" " style={{ textAlign: "left", fontStyle: "italic" }}>
                        <Radio checked={isFamilyHead} onChange={onSelectFamilyHead}>
                            Mark as Family Head
                        </Radio>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={50}>
                <Col span={12}>
                    <Form.Item label="Email" name={`${namePrefix}email`}>
                        <Input placeholder="Enter Email" />
                    </Form.Item>
                </Col>

                <Col span={12}>
                    <Form.Item label="Phone Number" name={`${namePrefix}phoneNumber`}>
                        <Input placeholder="Enter Phone Number" />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={50}>
                <Col span={12}>
                    <Form.Item label="Date of Birth" name={`${namePrefix}birthDate`} rules={[{ required: true, message: "Please enter the Date of Birth!" }]}>
                        <DatePicker style={{ width: "100%" }} placeholder="dd/mm/yyyy" format="DD/MM/YYYY" />
                    </Form.Item>
                </Col>
            </Row>


            <Row gutter={50}>
                <Col span={12}>
                    <Form.Item label="Blood Group" style={{ textAlign: "left" }} name={`${namePrefix}bloodGroup`}>
                        <Select placeholder="Select Blood Group">
                            {Object.entries(BloodGroup).map(([key, value]) => (
                                <Option key={key} value={value}>
                                    {value}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Divider style={{ borderTop: "1px solid #d9d9d9" }} />
        </>
    );
}
