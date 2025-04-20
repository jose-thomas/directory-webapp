"use client";
import React, { useState, useEffect } from "react";
import { Button, Flex, Input, Tooltip, Spin } from "antd";
import { SearchOutlined, FilterOutlined, FileImageFilled, PlusOutlined } from "@ant-design/icons";
import useHorizontalScroll from "@/hooks/useHorizontalScroll";
import DirectoryTable from "./DirectoryTable";
import { searchFamilies } from "@/lib/services/familyService";
import units from "@/constants/units";

// Component for the header with search, filter, and action buttons
const HeaderActions = () => (
  <Flex gap="small" justify="center" align="center" style={{ width: "82vw", height: "10vh" }}>
    <Input.Search
      style={{ width: "34vw" }}
      placeholder="Search"
      enterButton={<Button icon={<SearchOutlined />} type="primary" />}
    />
    <Button icon={<FilterOutlined />} style={{ width: "4.7vw", borderRadius: "1.5vw" }} />
    <Button type="primary" icon={<PlusOutlined />} style={{ width: "10vw", borderRadius: "1.5vw" }}>
      New Family
    </Button>
    <Tooltip title="*Temp., will be removed post launch" color="red" placement="topRight">
      <Button
        color="gold"
        variant="outlined"
        style={{ width: "10vw", borderRadius: "1.5vw" }}
        icon={<FileImageFilled />}
      >
        Bulk Upload
        <span style={{ color: "red" }}>*</span>
      </Button>
    </Tooltip>
  </Flex>
);

// Component for the horizontal scrollable unit buttons
const UnitButtons = ({ units }) => {
  const scrollRef = useHorizontalScroll();

  return (
    <Flex
      ref={scrollRef}
      gap="small"
      justify="flex-start"
      align="flex-start"
      style={{
        width: "75vw",
        height: "10vh",
        overflowX: "auto",
        paddingInline: "1vw",
      }}
      className="scroll-container"
    >
      {["All", ...units].map((unit, i) => (
        <Button
          key={String(i + 1)}
          style={{
            width: "8vw",
            borderRadius: "1.5vw",
            color: unit === "All" ? "#fff" : "#467CC8",
            fontSize: 16,
          }}
          type={unit === "All" ? "primary" : "default"}
        >
          {unit}
        </Button>
      ))}
    </Flex>
  );
};

// Main DirectoryPage component
export default function DirectoryPage() {
  const contentStyle = { height: "80vh", width: "82vw", overflow: "hidden" };
  const [loading, setLoading] = useState(false);
  const [familyData, setFamilyData] = useState([]);

  useEffect(() => {
    const fetchFamilies = async () => {
      setLoading(true);
      try {
        const payload = {
          pageSize: 20,
          offset: 1,
          node: {
            type: "filterCriteria",
            evaluationType: "AND",
            filters: [],
          },
        };
        const response = await searchFamilies(payload);
        setFamilyData(response);
      } catch (error) {
        console.error("Error fetching families:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFamilies();
  }, []);

  return (
    <Flex vertical justify="flex-start" align="center" style={contentStyle} gap="small">
      <HeaderActions />
      <UnitButtons units={units} />
      {loading ? (
        <Spin size="large" style={{ marginTop: "20px" }} />
      ) : (
        <DirectoryTable familyData={familyData} />
      )}
    </Flex>
  );
}
