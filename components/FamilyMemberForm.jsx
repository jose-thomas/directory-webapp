import React, { useState } from "react";
import { Form, Input, DatePicker, Checkbox, Radio, Select, Row, Col, Divider } from "antd";
const { Option } = Select;

// Add member component 
export default function FamilyMemberForm({ namePrefix = "", isFamilyHead, onSelectFamilyHead }) {
    const [isMarried, setIsMarried] = useState(false);

    const handleMarriedChange = (e) => {
        setIsMarried(e.target.checked);
    };

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
                    <Form.Item label="Date of Birth" name={`${namePrefix}birthDate`} rules={[{ required: true, message: "Please enter the Date of Birth!" }]}>
                        <DatePicker style={{ width: "100%" }} placeholder="dd/mm/yyyy" format="DD/MM/YYYY" />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={50}>
                <Col span={12}>
                    <Form.Item name={`${namePrefix}isMarried`} style={{ textAlign: "left", fontStyle: "italic" }} valuePropName="checked">
                        <Checkbox onChange={handleMarriedChange}>Is Married</Checkbox>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={50}>
                {isMarried && (
                    <Col span={12}>
                        <Form.Item label="Wedding Date" name={`${namePrefix}weddingDate`} rules={[{ required: true, message: "Please enter the wedding date!" }]}>
                            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="Select wedding date" />
                        </Form.Item>
                    </Col>
                )}
            </Row>

            <Row gutter={50}>
                <Col span={12}>
                    <Form.Item label="Blood Group" style={{ textAlign: "left" }} name={`${namePrefix}bloodGroup`}>
                        <Select placeholder="Select Blood Group">
                            <Option value="A+">A+</Option>
                            <Option value="B+">B+</Option>
                            <Option value="AB+">AB+</Option>
                            <Option value="O+">O+</Option>
                            <Option value="A-">A-</Option>
                            <Option value="B-">B-</Option>
                            <Option value="AB-">AB-</Option>
                            <Option value="O-">O-</Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Divider style={{ borderTop: "1px solid #d9d9d9" }} />
        </>
    );
}