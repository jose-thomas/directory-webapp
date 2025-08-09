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
  Upload,
  Divider,
  Spin,
  Image,
} from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import api from "@/lib/api";
import { useParams } from "next/navigation";
import { searchMembers } from "@/lib/services/familyService";
import debounce from "lodash.debounce";

const { Title, Text } = Typography;
const { Option } = Select;

const AddRepresentativesPage = () => {
  const [form] = Form.useForm();
  const [template, setTemplate] = useState(null);
  const [members, setMembers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentSearchValue, setCurrentSearchValue] = useState("");
  const { unitId } = useParams();
  const [unitName, setUnitName] = useState("");
  const [outerCoverPhoto, setOuterCoverPhoto] = useState(null);
  const [innerCoverPhoto, setInnerCoverPhoto] = useState(null);


  const fetchMembers = useCallback(
    async (searchValue, page) => {
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
      } finally {
        setSearching(false);
      }
    },
    []
  );

  const debouncedFetchMembers = useCallback(
    debounce((searchValue) => {
      setCurrentSearchValue(searchValue);
      setCurrentPage(1);
      setHasMore(true);
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
    const fetchData = async () => {
      try {
        const [templateResponse, representativesResponse, unitResponse] = await Promise.all([
          api.get("/unit-representatives/templates"),
          api.get(`/unit-representatives/${unitId}`).catch(() => null),
          api.get(`/unit/${unitId}`),
        ]);

        setUnitName(unitResponse.data.name);

        const templateData = templateResponse.data[0];
        setTemplate(templateData);

        if (representativesResponse && representativesResponse.data) {
          const { cards, coverPhotoUrl, innerCoverPhotoUrl } = representativesResponse.data;
          
          const formattedCards = templateData.cards.map(templateCard => {
            const existingCard = cards.find(c => c.title === templateCard.title);
            if (existingCard) {
              return {
                ...templateCard,
                positions: templateCard.positions.map(templatePosition => {
                  const existingPosition = existingCard.positions.find(p => p.positionId === templatePosition.id);
                  return {
                    ...templatePosition,
                    memberId: existingPosition ? existingPosition.memberId : null,
                  };
                }),
              };
            }
            return templateCard;
          });

          form.setFieldsValue({ cards: formattedCards });

          if (coverPhotoUrl) setOuterCoverPhoto(coverPhotoUrl);
          if (innerCoverPhotoUrl) setInnerCoverPhoto(innerCoverPhotoUrl);
          
          const initialMembers = cards
            .flatMap(card => card.positions)
            .filter(p => p.memberId)
            .map(p => ({ id: p.memberId, name: p.memberName }));
          setMembers(initialMembers);
        } else {
          form.setFieldsValue({ cards: templateData.cards });
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };
    fetchData();
  }, [unitId, form]);

  const onFinish = async (values) => {
    const formData = new FormData();
    const payload = {
      unitId,
      templateId: template.id,
      cardPositionMemberMap: values.cards.reduce((acc, card) => {
        acc[card.id] = card.positions.reduce((posAcc, pos) => {
          posAcc[pos.id] = pos.memberId;
          return posAcc;
        }, {});
        return acc;
      }, {}),
    };

    formData.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));

    if (outerCoverPhoto && outerCoverPhoto instanceof File) {
      formData.append('coverPhoto', outerCoverPhoto);
    }
    if (innerCoverPhoto && innerCoverPhoto instanceof File) {
      formData.append('innerCoverPhoto', innerCoverPhoto);
    }

    try {
      await api.post("/unit-representatives/assign", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Handle success
    } catch (error) {
      console.error("Failed to assign representatives", error);
    }
  };

  if (!template) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ 
      backgroundColor: "#f0f2f5", 
      minHeight: "100vh",
      padding: "24px",
    }}>
      <div style={{ 
        maxWidth: "900px", 
        margin: "0 auto",
        paddingTop: "20px"
      }}>
        <div style={{ 
          textAlign: "center", 
          marginBottom: "32px",
        }}>
          <Title level={2} style={{ 
            color: "#262626", 
            marginBottom: "8px",
            fontSize: "28px",
            fontWeight: "600"
          }}>
            {form.getFieldValue('cards') ? 'Edit' : 'Add'} Unit Representatives for {unitName}
          </Title>
          <Text type="secondary" style={{ fontSize: "14px" }}>
            Assign members to their positions
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Card style={{ 
            marginBottom: "24px",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Upload Outer Cover Photo">
                  {outerCoverPhoto ? (
                    <div style={{ position: 'relative', width: '100%', height: 200, overflow: 'hidden', borderRadius: '8px' }}>
                      <Image
                        src={typeof outerCoverPhoto === 'string' ? outerCoverPhoto : URL.createObjectURL(outerCoverPhoto)}
                        alt="Outer Cover"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        preview={false}
                      />
                      <Button
                        icon={<DeleteOutlined />}
                        onClick={() => setOuterCoverPhoto(null)}
                        style={{ position: 'absolute', top: 8, right: 8 }}
                        danger
                      />
                    </div>
                  ) : (
                    <Upload.Dragger
                      name="outerCover"
                      listType="picture"
                      showUploadList={false}
                      beforeUpload={() => false}
                      onChange={({ file }) => setOuterCoverPhoto(file)}
                    >
                      <p className="ant-upload-drag-icon">
                        <UploadOutlined />
                      </p>
                      <p className="ant-upload-text">Click or drag file to this area to upload</p>
                    </Upload.Dragger>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Upload Inner Cover Photo">
                  {innerCoverPhoto ? (
                     <div style={{ position: 'relative', width: '100%', height: 200, overflow: 'hidden', borderRadius: '8px' }}>
                      <Image
                        src={typeof innerCoverPhoto === 'string' ? innerCoverPhoto : URL.createObjectURL(innerCoverPhoto)}
                        alt="Inner Cover"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        preview={false}
                      />
                      <Button
                        icon={<DeleteOutlined />}
                        onClick={() => setInnerCoverPhoto(null)}
                        style={{ position: 'absolute', top: 8, right: 8 }}
                        danger
                      />
                    </div>
                  ) : (
                    <Upload.Dragger
                      name="innerCover"
                      listType="picture"
                      showUploadList={false}
                      beforeUpload={() => false}
                      onChange={({ file }) => setInnerCoverPhoto(file)}
                    >
                      <p className="ant-upload-drag-icon">
                        <UploadOutlined />
                      </p>
                      <p className="ant-upload-text">Click or drag file to this area to upload</p>
                    </Upload.Dragger>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <div style={{ 
            textAlign: "center", 
            marginBottom: "24px",
          }}>
            <Title level={3} style={{ 
              color: "#595959", 
              marginBottom: "4px",
              fontSize: "20px",
              fontWeight: "500"
            }}>
              Assign Representatives
            </Title>
          </div>

          <Form.List name="cards">
            {(fields) => (
              <div style={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: "16px",
              }}>
                {fields.map(({ key, name, ...restField }) => (
                  <Card 
                    key={key}
                    title={form.getFieldValue(["cards", name, "title"])}
                    style={{ 
                      borderRadius: "8px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      backgroundColor: "#ffffff"
                    }}
                  >
                    <Form.List name={[name, "positions"]}>
                      {(subFields) => (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {subFields.map(
                            ({ key: subKey, name: subName, ...subRestField }) => (
                              <div 
                                key={subKey}
                                style={{ 
                                  display: "flex", 
                                  alignItems: "center", 
                                  gap: "8px",
                                  padding: "8px",
                                  backgroundColor: "#fafafa",
                                  borderRadius: "4px",
                                  border: "1px solid #f0f0f0",
                                }}
                              >
                                <Form.Item
                                  {...subRestField}
                                  name={[subName, "name"]}
                                  label="Role/Responsibility"
                                  style={{ marginBottom: 0, flex: 1 }}
                                >
                                  <Input readOnly />
                                </Form.Item>
                                <Form.Item
                                  {...subRestField}
                                  name={[subName, "memberId"]}
                                  label="Person Name"
                                  rules={[
                                    {
                                      required: true,
                                      message: "Please select a member",
                                    },
                                  ]}
                                  style={{ marginBottom: 0, flex: 1 }}
                                >
                                  <Select
                                    showSearch
                                    placeholder="Select a member"
                                    optionFilterProp="children"
                                    onSearch={debouncedFetchMembers}
                                    onPopupScroll={handlePopupScroll}
                                    notFoundContent={searching ? <Spin size="small" /> : null}
                                    filterOption={false}
                                  >
                                    {members.map((member) => (
                                      <Option key={member.id} value={member.id}>
                                        {member.name}
                                      </Option>
                                    ))}
                                  </Select>
                                </Form.Item>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </Form.List>
                  </Card>
                ))}
              </div>
            )}
          </Form.List>

          <div style={{ 
            textAlign: "center", 
            marginTop: "32px",
            paddingTop: "24px",
            borderTop: "1px solid #f0f0f0",
          }}>
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
                borderColor: "#1890ff"
              }}
            >
              Save Details
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default AddRepresentativesPage;
