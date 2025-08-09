"use client";
import { Layout as AntLayout, Button, Typography, Flex, App } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
const { Header, Content, Sider } = AntLayout;
const { Title } = Typography;
import React from "react";
import SideMenu from "./SideMenu";
import Image from "next/image";

export default function DashboardLayout({ children }) {
  const headerStyle = {
    height: "20vh",
    width: "82vw",
    position: "sticky",
    top: 0,
    right: 0,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
    background: "#fff",
  };
  const contentStyle = {
    textAlign: "center",
    // height: "80vh", // Remove fixed height
    width: "82vw",
    overflowY: "auto", // Allow vertical scrolling
    flex: 1, // Allow content to grow and shrink
  };
  const siderStyle = {
    height: "100vh",
    background: "linear-gradient(to top, #28537C, #6BA6FF)",
    position: "sticky",
    top: 0,
    bottom: 0,
    left: 0,
    overflowY: "auto", // Allow vertical scrolling for sider if needed
    paddingTop: "20vh",
  };
  const layoutStyle = {
    width: "100vw",
    minHeight: "100vh", // Use minHeight to allow content to push height
    display: "flex",
    // overflow: "hidden", // Remove overflow hidden from main layout
  };

  return (
    <App>
      <AntLayout style={layoutStyle}>
        <Sider width="18vw" style={siderStyle}>
          <SideMenu />
          <Button
            type="text"
            icon={<LogoutOutlined />}
            style={{
              position: "absolute",
              color: "#f5f5f5",
              bottom: "1rem",
              left: "0.7vw",
              fontSize: 16,
            }}
          >
            Log Out
          </Button>
        </Sider>
        <AntLayout style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <Header style={headerStyle}>
            <Flex vertical justify="" align="flex-start">
              <p
                style={{
                  color: "background: #474747",
                  fontSize: "24px",
                  fontWeight: "700",
                  lineHeight: "1.3",
                }}
              >
                St. Jude Parish
              </p>
              <p
                style={{
                  color: "#8A8A8A",
                  fontSize: "18px",
                  fontWeight: "400",
                  lineHeight: "1.6",
                }}
              >
                Sahibabad
              </p>
            </Flex>

            <Image
              src="/ParishLogo.png"
              alt="St. Jude's Church, Sahibabad logo"
              width={100}
              height={100}
              style={{ objectFit: "cover" }}
              priority
            />
          </Header>
          <Content style={contentStyle} className="scroll-container">
            {children}
          </Content>
        </AntLayout>
      </AntLayout>
    </App>
  );
}
