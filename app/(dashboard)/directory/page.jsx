"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Button, Flex, Input, Spin } from "antd";
import { SearchOutlined, FilterOutlined, PlusOutlined } from "@ant-design/icons";
import useHorizontalScroll from "@/hooks/useHorizontalScroll";
import DirectoryTable from "./DirectoryTable";
import { searchFamiliesWithCount } from "@/lib/services/familyService";
import Unit from "@/enums/Unit";

// HeaderActions Component

const HeaderActions = ({ onSearch }) => {
  const router = useRouter();
  return (
    <Flex gap="small" justify="center" align="center" style={{ width: "82vw", height: "10vh" }}>
      <Input.Search
        style={{ width: "34vw" }}
        placeholder="Search"
        enterButton={<Button icon={<SearchOutlined />} type="primary" />}
        onSearch={onSearch}
      />
      <Button icon={<FilterOutlined />} style={{ width: "4.7vw", borderRadius: "1.5vw" }} />
      <Button type="primary" icon={<PlusOutlined />} style={{ width: "10vw", borderRadius: "1.5vw" }} onClick={() => router.push("/directory/new-family")}>
        New Family
      </Button>
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
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filterUnit, setFilterUnit] = useState("All");
  const [searchText, setSearchText] = useState("");

  const handleUnitSelect = (unit) => {
    setFilterUnit(unit);
    setCurrentPage(1); // Reset to first page when filter changes
    console.log("Selected Unit for Filter:", unit);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  useEffect(() => {
    const fetchFamilies = async () => {
      setLoading(true);
      try {
        const payload = {
          pageSize: pageSize,
          offset: currentPage,
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
        const response = await searchFamiliesWithCount(payload);
        setFamilyData(response.results);
        setTotalCount(response.totalCount);
      } catch (error) {
        console.error("Error fetching families:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFamilies();
  }, [filterUnit, searchText, currentPage, pageSize]);

  return (
    <Flex vertical justify="flex-start" align="center" style={contentStyle} gap="small">
      <HeaderActions onSearch={handleSearch} />
      <UnitButtons onUnitSelect={handleUnitSelect} />
      {loading ? (
        <Spin size="large" style={{ marginTop: "20px" }} />
      ) : (
        <DirectoryTable 
          familyData={familyData}
          totalCount={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      )}
    </Flex>
  );
}
