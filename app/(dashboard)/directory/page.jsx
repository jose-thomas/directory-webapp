"use client";
import { Button, Flex, Input, Tooltip, Table } from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  FileImageFilled,
  PlusOutlined,
} from "@ant-design/icons";
import units from "@/constants/units";
import useHorizontalScroll from "@/hooks/useHorizontalScroll";
import DirectoryTable from "./DirectoryTable";
export default function DirectoryPage() {
  const contentStyle = { height: "80vh", width: "82vw", overflow: "hidden" };
  const scrollRef = useHorizontalScroll();

  return (
    <Flex
      vertical
      justify="flex-start"
      align="center"
      style={contentStyle}
      gap="small"
    >
      <Flex
        gap="small"
        justify="center"
        align="center"
        style={{ width: "82vw", height: "10vh" }}
      >
        <Input.Search
          style={{ width: "34vw" }}
          placeholder="Search"
          enterButton={<Button icon={<SearchOutlined />} type="primary" />}
        />
        <Button
          icon={<FilterOutlined />}
          style={{ width: "4.7vw", borderRadius: "1.5vw" }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ width: "10vw", borderRadius: "1.5vw" }}
        >
          New Family
        </Button>
        <Tooltip
          title="*Temp., will be removed post launch"
          color="red"
          placement="topRight"
        >
          <Button
            color="gold"
            variant="outlined"
            style={{
              width: "10vw",
              borderRadius: "1.5vw",
            }}
            icon={<FileImageFilled />}
          >
            Bulk Upload
            <span style={{ color: "red" }}>*</span>
          </Button>
        </Tooltip>
      </Flex>
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
        {["All", ...units].map((unit, i) => {
          return (
            <Button
              key={String(i + 1)}
              style={{
                width: "8vw",
                borderRadius: "1.5vw",
                color: `${unit == "All" ? "#fff" : "#467CC8"}`,
                fontSize: 16,
              }}
              type={`${unit == "All" ? "primary" : "default"}`}
            >
              {unit}
            </Button>
          );
        })}
      </Flex>
      <DirectoryTable />
    </Flex>
  );
}
