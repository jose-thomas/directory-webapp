"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Form,
  Input,
  Card,
  Select,
  Space,
  Typography,
  Row,
  Col,
  Divider,
  App,
  Spin,
} from "antd";
import { PlusOutlined, DeleteOutlined, DragOutlined } from "@ant-design/icons";
import api from "@/lib/api";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { searchMembers } from "@/lib/services/familyService";
import debounce from "lodash.debounce";

const { Title, Text } = Typography;
const { Option } = Select;

const CommitteesPage = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [positions, setPositions] = useState([]);
  const [members, setMembers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentSearchValue, setCurrentSearchValue] = useState("");

  const fetchMembers = useCallback(async (searchValue, page) => {
    if (!searchValue) {
      setMembers([]);
      return;
    }
    setSearching(true);
    try {
      const payload = {
        pageSize: 20,
        offset: page,
        node: {
          type: "filterCriteria",
          evaluationType: "AND",
          filters: [
            {
              type: "fieldFilter",
              fieldName: "name",
              operation: "STARTS_WITH",
              values: [searchValue],
            },
          ],
        },
      };
      const response = await searchMembers(payload);
      const newMembers = response || [];
      setMembers((prevMembers) =>
        page === 1 ? newMembers : [...prevMembers, ...newMembers]
      );
      setHasMore(newMembers.length > 0);
    } catch (error) {
      console.error("Error searching members:", error);
      message.error("Error searching members");
    } finally {
      setSearching(false);
    }
  }, [message]);

  const debouncedFetchMembers = useCallback(
    debounce((searchValue) => {
      setCurrentSearchValue(searchValue);
      setCurrentPage(1);
      setHasMore(true);
      setMembers([]); // Clear members on new search
      fetchMembers(searchValue, 1);
    }, 300),
    [fetchMembers]
  );

  const handlePopupScroll = (e) => {
    const { target } = e;
    if (
      target.scrollTop + target.offsetHeight === target.scrollHeight &&
      hasMore &&
      !searching
    ) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchMembers(currentSearchValue, nextPage);
    }
  };

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await api.get("/positions");
        setPositions(response.data);
      } catch (error) {
        console.error("Failed to fetch positions", error);
        message.error("Failed to fetch positions");
      }
    };
    fetchPositions();
  }, [message]);

  const onFinish = async (values) => {
    const payload = {
      name: values.name,
      cards: values.cards.map((card) => ({
        title: card.title,
        positions: card.positions.map((p) => ({
          positionId: p.positionId,
          memberId: p.memberId,
        })),
      })),
    };
    try {
      await api.post("/committees", payload);
      message.success("Committee created successfully!");
      form.resetFields();
    } catch (error) {
      console.error("Failed to create committee", error);
      message.error("Failed to create committee");
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const cards = form.getFieldValue("cards");
    const sourceCardIndex = parseInt(source.droppableId.split("-")[1]);
    const destCardIndex = parseInt(destination.droppableId.split("-")[1]);

    if (sourceCardIndex === destCardIndex) {
      const card = cards[sourceCardIndex];
      const reorderedPositions = Array.from(card.positions);
      const [removed] = reorderedPositions.splice(source.index, 1);
      reorderedPositions.splice(destination.index, 0, removed);
      cards[sourceCardIndex].positions = reorderedPositions;
      form.setFieldsValue({ cards });
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          paddingTop: "20px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "32px",
          }}
        >
          <Title
            level={2}
            style={{
              color: "#262626",
              marginBottom: "8px",
              fontSize: "28px",
              fontWeight: "600",
            }}
          >
            Create Committee
          </Title>
          <Text type="secondary" style={{ fontSize: "14px" }}>
            Design your organizational structure and assign members
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Card
            style={{
              marginBottom: "24px",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <Form.Item
              name="name"
              label={
                <Text strong style={{ fontSize: "14px", color: "#262626" }}>
                  Committee Name
                </Text>
              }
              rules={[
                { required: true, message: "Please enter Committee name" },
              ]}
              style={{ marginBottom: 0 }}
            >
              <Input
                placeholder="Enter committee name"
                style={{
                  height: "40px",
                  fontSize: "14px",
                  border: "1px solid #d9d9d9",
                }}
              />
            </Form.Item>
          </Card>

          <div
            style={{
              textAlign: "center",
              marginBottom: "24px",
            }}
          >
            <Title
              level={3}
              style={{
                color: "#595959",
                marginBottom: "4px",
                fontSize: "20px",
                fontWeight: "500",
              }}
            >
              Committee Cards
            </Title>
            <Text type="secondary" style={{ fontSize: "14px" }}>
              Add cards to organize different roles and positions
            </Text>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Form.List name="cards">
              {(fields, { add, remove }) => (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  {fields.map(({ key, name, ...restField }, cardIndex) => (
                    <Card
                      key={key}
                      style={{
                        borderRadius: "8px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        backgroundColor: "#ffffff",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                          marginBottom: "16px",
                        }}
                      >
                        <Form.Item
                          {...restField}
                          name={[name, "title"]}
                          label={
                            <Text
                              strong
                              style={{ fontSize: "14px", color: "#262626" }}
                            >
                              Card Title
                            </Text>
                          }
                          rules={[
                            {
                              required: true,
                              message: "Please enter card title",
                            },
                          ]}
                          style={{ marginBottom: 0, flex: 1 }}
                        >
                          <Input
                            placeholder="E.g., Office Bearers"
                            style={{
                              height: "40px",
                              fontSize: "14px",
                              border: "1px solid #d9d9d9",
                            }}
                          />
                        </Form.Item>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                          style={{
                            color: "#ff4d4f",
                            border: "none",
                            boxShadow: "none",
                          }}
                        />
                      </div>

                      <Divider style={{ margin: "16px 0" }} />

                      <div style={{ marginBottom: "12px" }}>
                        <Text
                          strong
                          style={{ fontSize: "14px", color: "#595959" }}
                        >
                          Positions
                        </Text>
                      </div>

                      <Droppable droppableId={`positions-${cardIndex}`}>
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
                            <Form.List name={[name, "positions"]}>
                              {(
                                subFields,
                                { add: subAdd, remove: subRemove }
                              ) => (
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "8px",
                                  }}
                                >
                                  {subFields.map(
                                    (
                                      {
                                        key: subKey,
                                        name: subName,
                                        ...subRestField
                                      },
                                      index
                                    ) => (
                                      <Draggable
                                        key={subKey}
                                        draggableId={`position-${cardIndex}-${subKey}`}
                                        index={index}
                                      >
                                        {(provided) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={{
                                              ...provided.draggableProps.style,
                                              display: "flex",
                                              alignItems: "center",
                                              gap: "8px",
                                              padding: "8px",
                                              backgroundColor: "#fafafa",
                                              borderRadius: "4px",
                                              border: "1px solid #f0f0f0",
                                            }}
                                          >
                                            <DragOutlined />
                                            <Form.Item
                                              {...subRestField}
                                              name={[subName, "positionId"]}
                                              rules={[
                                                {
                                                  required: true,
                                                  message:
                                                    "Please select a position",
                                                },
                                              ]}
                                              style={{
                                                marginBottom: 0,
                                                flex: 1,
                                              }}
                                            >
                                              <Select
                                                showSearch
                                                placeholder="Select a position"
                                                style={{
                                                  height: "36px",
                                                }}
                                                optionFilterProp="children"
                                                filterOption={(input, option) =>
                                                  (option?.children ?? "")
                                                    .toLowerCase()
                                                    .includes(
                                                      input.toLowerCase()
                                                    )
                                                }
                                              >
                                                {positions.map((pos) => (
                                                  <Option
                                                    key={pos.id}
                                                    value={pos.id}
                                                  >
                                                    {pos.name}
                                                  </Option>
                                                ))}
                                              </Select>
                                            </Form.Item>
                                            <Form.Item
                                              {...subRestField}
                                              name={[subName, "memberId"]}
                                              rules={[
                                                {
                                                  required: true,
                                                  message:
                                                    "Please select a member",
                                                },
                                              ]}
                                              style={{
                                                marginBottom: 0,
                                                flex: 1,
                                              }}
                                            >
                                              <Select
                                                showSearch
                                                placeholder="Select a member"
                                                optionFilterProp="children"
                                                onSearch={
                                                  debouncedFetchMembers
                                                }
                                                onPopupScroll={
                                                  handlePopupScroll
                                                }
                                                notFoundContent={
                                                  searching ? (
                                                    <Spin size="small" />
                                                  ) : null
                                                }
                                                filterOption={false}
                                              >
                                                {members.map((member) => (
                                                  <Option
                                                    key={member.id}
                                                    value={member.id}
                                                  >
                                                    {member.name}
                                                  </Option>
                                                ))}
                                              </Select>
                                            </Form.Item>
                                            <Button
                                              type="text"
                                              danger
                                              icon={<DeleteOutlined />}
                                              onClick={() =>
                                                subRemove(subName)
                                              }
                                              size="small"
                                              style={{
                                                color: "#ff4d4f",
                                                minWidth: "24px",
                                                height: "24px",
                                              }}
                                            />
                                          </div>
                                        )}
                                      </Draggable>
                                    )
                                  )}
                                  {provided.placeholder}
                                  <Button
                                    type="dashed"
                                    onClick={() => subAdd()}
                                    block
                                    icon={<PlusOutlined />}
                                    style={{
                                      height: "40px",
                                      fontSize: "14px",
                                      border: "1px dashed #d9d9d9",
                                      color: "#595959",
                                      backgroundColor: "#ffffff",
                                    }}
                                  >
                                    Add Position
                                  </Button>
                                </div>
                              )}
                            </Form.List>
                          </div>
                        )}
                      </Droppable>
                    </Card>
                  ))}

                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                    style={{
                      height: "50px",
                      fontSize: "14px",
                      border: "2px dashed #1890ff",
                      color: "#1890ff",
                      fontWeight: "500",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    Add New Card
                  </Button>
                </div>
              )}
            </Form.List>
          </DragDropContext>

          <div
            style={{
              textAlign: "center",
              marginTop: "32px",
              paddingTop: "24px",
              borderTop: "1px solid #f0f0f0",
            }}
          >
        
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              style={{
                height: "44px",
                fontSize: "14px",
                fontWeight: "500",
                paddingLeft: "32px",
                paddingRight: "32px",
                backgroundColor: "#1890ff",
                borderColor: "#1890ff",
              }}
            >
              Save Committee
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

const CommitteesPageWithApp = () => (
  <App>
    <CommitteesPage />
  </App>
);

export default CommitteesPageWithApp;
