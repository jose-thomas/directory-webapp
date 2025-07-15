import { Flex, Table, Button } from "antd";
import { PhoneOutlined, MailOutlined, EditOutlined } from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Unit from "@/enums/Unit";

function DirectoryTable({familyData}) {
  console.log("DirectoryTable rendering with data:", familyData);
  const router = useRouter();

  const handleEditFamily = (record) => {
    console.log("Editing family:", record);
    // Navigate to family details page using the familyId
    router.push(`/directory/${record.familyId}`);
  };

  console.log(familyData);
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Flex vertical align="flex-start" justify="center">
          <span
            style={{ fontWeight: "normal", color: "#000", fontSize: "1vw" }}
          >
            {text}
          </span>
          <span
            style={{
              fontWeight: "normal",
              color: "#989898",
              fontSize: "0.9vw",
            }}
          >
            {Unit[record.unit]}
          </span>
        </Flex>
      ),
      width: "22vw",
    },
    {
      title: "Contact",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      render: (text) => (
        <Flex gap="small">
          <PhoneOutlined style={{ fontSize: "1vw", color: "#989898" }} />
          <span
            style={{
              fontWeight: "normal",
              color: "#989898",
              fontSize: "1vw",
            }}
          >
            {text ? "+91 " + text.slice(0, 5) + " " + text.slice(5) : "N/A"}
          </span>
        </Flex>
      ),
      width: "22vw",
    },
    {
      title: "Email",
      dataIndex: "emailId",
      key: "emailId",
      render: (text) => (
        <Flex gap="small">
          <MailOutlined style={{ fontSize: "1vw", color: "#989898" }} />
          <span
            style={{
              fontWeight: "normal",
              color: "#989898",
              fontSize: "1vw",
            }}
          >
            {text || "N/A"}
          </span>
        </Flex>
      ),
      width: "22vw",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button 
          type="primary"
          icon={<EditOutlined />}
          onClick={() => handleEditFamily(record)}
          style={{ 
            borderRadius: "1.5vw",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px"
          }}
        >
          Edit Family
        </Button>
      ),
      width: "12vw",
      align: "center",
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={familyData || []}
      pagination={{ 
        pageSize: 20,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} members`,
        pageSizeOptions: ['10', '20', '50', '100'],
        defaultPageSize: 20
      }}
      scroll={{ x: "max-content", y: "45vh" }}
      showHeader={false}
      rowKey={(record) => record.id || record._id || Math.random().toString()}
      style={{ width: "80vw" }}
      locale={{ emptyText: "No family data available" }}
    />
  );
}

export default DirectoryTable;
