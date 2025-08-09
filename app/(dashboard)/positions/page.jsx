"use client";
import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  Table,
  Typography,
  Spin,
  Alert,
  Card,
  Col,
  Row,
  Modal,
  Space,
  App,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import api from "@/lib/api";

const { Title } = Typography;

const PositionsPage = () => {
  const { modal } = App.useApp();
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [editingPosition, setEditingPosition] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchPositions = async () => {
    setLoading(true);
    try {
      const response = await api.get("/positions");
      setPositions(response.data);
    } catch (err) {
      setError("Failed to fetch positions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await api.post("/positions", values);
      form.resetFields();
      fetchPositions();
    } catch (err) {
      setError("Failed to create position");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingPosition(record);
    editForm.setFieldsValue({ name: record.name });
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    modal.confirm({
      title: "Are you sure you want to delete this position?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        setLoading(true);
        try {
          await api.delete(`/positions/${id}`);
          fetchPositions();
        } catch (err) {
          setError("Failed to delete position");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleUpdate = async (values) => {
    setLoading(true);
    try {
      await api.put(`/positions/${editingPosition.id}`, values);
      setIsModalVisible(false);
      setEditingPosition(null);
      editForm.resetFields();
      fetchPositions();
    } catch (err) {
      setError("Failed to update position");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Position Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            danger
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "2rem" }}>
      <Title level={2}>Church Positions</Title>
      <Row gutter={16}>
        <Col span={8}>
          <Card title="Create New Position">
            <Form form={form} onFinish={onFinish} layout="vertical">
              <Form.Item
                name="name"
                label="Position Name"
                rules={[
                  {
                    required: true,
                    message: "Please input the position name!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Create Position
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col span={16}>
          <Card title="Existing Positions">
            {error && <Alert message={error} type="error" showIcon />}
            {loading ? (
              <Spin />
            ) : (
              <Table
                dataSource={positions}
                columns={columns}
                rowKey="id"
                pagination={false}
              />
            )}
          </Card>
        </Col>
      </Row>
      <Modal
        title="Edit Position"
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingPosition(null);
          editForm.resetFields();
        }}
        footer={null}
      >
        <Form form={editForm} onFinish={handleUpdate} layout="vertical">
          <Form.Item
            name="name"
            label="Position Name"
            rules={[
              {
                required: true,
                message: "Please input the position name!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Update Position
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const PositionsPageWithApp = () => (
  <App>
    <PositionsPage />
  </App>
);

export default PositionsPageWithApp;
