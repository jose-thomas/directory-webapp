"use client";
import React, { useState, useEffect } from "react";
import {
  Button,
  Row,
  Col,
  Card,
  Typography,
  Modal,
  Form,
  Input,
  Table,
  Space,
} from "antd";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Title } = Typography;

const PrayerUnitsPage = () => {
  const router = useRouter();
  const [units, setUnits] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [form] = Form.useForm();

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const [unitsResponse, templatesResponse] = await Promise.all([
        api.get("/unit"),
        api.get("/unit-representatives/templates"),
      ]);
      setUnits(unitsResponse.data);
      setTemplates(templatesResponse.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const showModal = (unit = null) => {
    setEditingUnit(unit);
    form.setFieldsValue(unit ? { name: unit.name } : { name: "" });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingUnit(null);
    form.resetFields();
  };

  const handleOk = () => {
    form.submit();
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      if (editingUnit) {
        await api.put(`/unit/${editingUnit.id}`, values);
      } else {
        await api.post("/unit", values);
      }
      fetchUnits();
      handleCancel();
    } catch (error) {
      console.error("Failed to save unit", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/unit/${id}`);
      fetchUnits();
    } catch (error) {
      console.error("Failed to delete unit", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Unit Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            danger
          />
          <Button
            onClick={() =>
              router.push(`/prayer-units/representatives/${record.id}`)
            }
            disabled={templates.length === 0}
          >
            Add/Edit Representatives
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "2rem" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: "2rem" }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            Prayer Units
          </Title>
        </Col>
        <Col>
          <Space>
            <Button type="primary" onClick={() => showModal()}>
              Create Unit
            </Button>
            <Button
              onClick={() => router.push("/prayer-units/templates/new")}
              disabled={templates.length > 0}
            >
              Create Template
            </Button>
          </Space>
        </Col>
      </Row>
      <Card>
        <Table
          columns={columns}
          dataSource={units}
          rowKey="id"
          loading={loading}
        />
      </Card>
      <Modal
        title={editingUnit ? "Edit Prayer Unit" : "Create Prayer Unit"}
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={handleOk}
        confirmLoading={loading}
      >
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="name"
            label="Unit Name"
            rules={[{ required: true, message: "Please enter the unit name" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PrayerUnitsPage;
