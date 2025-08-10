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

const CommitteesListPage = () => {
  const router = useRouter();
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCommittee, setEditingCommittee] = useState(null);
  const [form] = Form.useForm();

  const fetchCommittees = async () => {
    setLoading(true);
    try {
      const response = await api.get("/committees");
      setCommittees(response.data);
    } catch (error) {
      console.error("Failed to fetch committees", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommittees();
  }, []);

  const showModal = (committee = null) => {
    setEditingCommittee(committee);
    form.setFieldsValue(committee ? { name: committee.name } : { name: "" });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingCommittee(null);
    form.resetFields();
  };

  const handleOk = () => {
    form.submit();
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      if (editingCommittee) {
        await api.put(`/committees/${editingCommittee.id}`, values);
      } else {
        // This modal is only for editing, creation is on a new page
      }
      fetchCommittees();
      handleCancel();
    } catch (error) {
      console.error("Failed to save committee", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/committees/${id}`);
      fetchCommittees();
    } catch (error) {
      console.error("Failed to delete committee", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Committee Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            danger
          />
          <Button
            onClick={() =>
              router.push(`/committees/representatives/${record.id}`)
            }
          >
            Edit Representatives
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
            Church Committees
          </Title>
        </Col>
        <Col>
          <Button type="primary" onClick={() => router.push("/committees/new")}>
            Create Committee
          </Button>
        </Col>
      </Row>
      <Card>
        <Table
          columns={columns}
          dataSource={committees}
          rowKey="id"
          loading={loading}
        />
      </Card>
      <Modal
        title="Edit Committee"
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={handleOk}
        confirmLoading={loading}
      >
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="name"
            label="Committee Name"
            rules={[{ required: true, message: "Please enter the committee name" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CommitteesListPage;
