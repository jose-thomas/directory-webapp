import { Flex, Table } from "antd";
import { PhoneOutlined, MailOutlined } from "@ant-design/icons";
import React from "react";
import directorySample from "@/sampleData/directorySample";

function DirectoryTable() {
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
            {record.unit}
          </span>
        </Flex>
      ),
      width: "26vw",
    },
    {
      title: "Contact",
      dataIndex: "contact",
      key: "contact",
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
            {"+91 " + text.slice(0, 5) + " " + text.slice(5)}
          </span>
        </Flex>
      ),
      width: "26vw",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
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
            {text}
          </span>
        </Flex>
      ),
      width: "26vw",
    },
  ];
  return (
    <Table
      style={
        {
          // outline: "red solid 1px"
        }
      }
      columns={columns}
      dataSource={directorySample}
      pagination={{ pageSize: 10 }}
      scroll={{ x: "max-content", y: "45vh" }}
      showHeader={false}
      rowKey={(record) => record.id}
      //   bordered
    ></Table>
  );
}

export default DirectoryTable;
