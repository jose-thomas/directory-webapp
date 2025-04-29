import React, { useState } from "react";
import { Upload, Button, Form } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const FamilyPhotoUpload = () => {
    const [fileList, setFileList] = useState([]);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleChange = ({ fileList }) => {
        const latestFile = fileList[fileList.length - 1];
        if (latestFile) {
            const file = latestFile.originFileObj;
            const reader = new FileReader();
            reader.onload = (e) => setPreviewUrl(e.target.result);
            reader.readAsDataURL(file);
            setFileList([latestFile]);
        }
    };


    const handleRemove = () => {
        setFileList([]);
        setPreviewUrl(null);
    };

    return (
        <div>

            <Form.Item
                label="Upload Family Photo"
                name="upload"
                valuePropName="fileList"
                getValueFromEvent={(e) => e?.fileList}
            >
                {/* Wrapper div controls the size */}
                <div style={{
                    width: "100%",
                    height: "250px",
                    border: "1px dashed #d9d9d9",
                    borderRadius: "10px",
                    overflow: "hidden",
                    background: previewUrl ? `url(${previewUrl}) center/contain no-repeat` : "#fafafa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative"
                }}>

                    {/* Upload inside */}
                    <Upload.Dragger
                        fileList={fileList}
                        beforeUpload={() => false}
                        onChange={handleChange}
                        onRemove={handleRemove}
                        itemRender={() => null}
                        style={{
                            background: "transparent",
                            height: "100%", // Full height inside the container
                            width: "100%",
                            padding: 0,
                            border: "none",
                        }}
                    >
                        {!previewUrl && (
                            <div>
                                <p className="ant-upload-drag-icon">
                                    <UploadOutlined />
                                </p>
                                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                            </div>
                        )}
                    </Upload.Dragger>
                </div>

                {/* Buttons */}
                {!previewUrl ? (
                    <Button
                        type="primary"
                        block
                        style={{ marginTop: 16 }}
                    >
                        Upload Image
                    </Button>
                ) : (
                    <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
                        <Button danger onClick={handleRemove} style={{ flex: 1 }}>
                            Remove Image
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => document.querySelector('input[type="file"]').click()}
                            style={{ flex: 1 }}
                        >
                            Change Image
                        </Button>
                    </div>
                )}
            </Form.Item>
        </div>
    );
};

export default FamilyPhotoUpload;