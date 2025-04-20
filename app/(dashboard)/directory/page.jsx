"use client";
import React, { useState, useEffect } from "react";
import { Button, Flex, Input, Tooltip, Spin } from "antd";
import { SearchOutlined, FilterOutlined, FileImageFilled, PlusOutlined } from "@ant-design/icons";
import useHorizontalScroll from "@/hooks/useHorizontalScroll";
import DirectoryTable from "./DirectoryTable";
import { searchFamilies } from "@/lib/services/familyService";
import Unit from "@/enums/Unit";

// HeaderActions Component
const HeaderActions = ({ onSearch }) => {
  return (
    <Flex gap="small" justify="center" align="center" style={{ width: "82vw", height: "10vh" }}>
      <Input.Search
        style={{ width: "34vw" }}
        placeholder="Search"
        enterButton={<Button icon={<SearchOutlined />} type="primary" />}
        onSearch={onSearch}
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
};

// UnitButtons Component
const UnitButtons = ({ onUnitSelect }) => {
  const scrollRef = useHorizontalScroll();
  const extendedUnit = { All: "All", ...Unit };
  const [selectedUnit, setSelectedUnit] = useState("All");

  const handleUnitClick = (key) => {
    setSelectedUnit(key);
    onUnitSelect(key);
  };

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
      {Object.entries(extendedUnit).map(([key, value]) => (
        <Button
          key={key === "All" ? "ALL" : key}
          style={{
            width: "8vw",
            borderRadius: "1.5vw",
            color: selectedUnit === key ? "#fff" : "#467CC8",
            fontSize: 16,
          }}
          type={selectedUnit === key ? "primary" : "default"}
          onClick={() => handleUnitClick(key)}
        >
          {value}
        </Button>
      ))}
    </Flex>
  );
};

// Main DirectoryPage Component
export default function DirectoryPage() {
  const contentStyle = { height: "80vh", width: "82vw", overflow: "hidden" };
  const [loading, setLoading] = useState(false);
  const [familyData, setFamilyData] = useState([]);
  const [filterUnit, setFilterUnit] = useState("All");
  const [searchText, setSearchText] = useState("");

  const handleUnitSelect = (unit) => {
    setFilterUnit(unit);
    console.log("Selected Unit for Filter:", unit);
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

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
            filters: [
              ...(filterUnit !== "All"
                ? [
                    {
                      type: "fieldFilter",
                      fieldName: "unit",
                      operation: "EQUALS",
                      values: [filterUnit],
                    },
                  ]
                : []),
              ...(searchText
                ? [
                    {
                      type: "fieldFilter",
                      fieldName: "name",
                      operation: "STARTS_WITH",
                      values: [searchText],
                    },
                  ]
                : []),
            ],
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
  }, [filterUnit, searchText]);

  return (
    <Flex vertical justify="flex-start" align="center" style={contentStyle} gap="small">
      <HeaderActions onSearch={handleSearch} />
      <UnitButtons onUnitSelect={handleUnitSelect} />
      {loading ? (
        <Spin size="large" style={{ marginTop: "20px" }} />
      ) : (
        <DirectoryTable familyData={familyData} />
      )}
    </Flex>
  );
}