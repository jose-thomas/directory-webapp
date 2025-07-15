import React, { useState, useEffect } from "react";
import { Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const FamilyPhotoUpload = ({ value = [], onChange }) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [fileList, setFileList] = useState([]);

    // Update preview and fileList when value changes (for existing photos)
    useEffect(() => {
        console.log("FamilyPhotoUpload useEffect triggered with value:", value);
        if (value && value.length > 0) {
            const file = value[0];
            console.log("Processing file:", file);
            setFileList(value);
            
            // If it's an existing photo with URL
            if (file.url && !file.originFileObj) {
                console.log("Setting preview URL from existing photo:", file.url);
                setPreviewUrl(file.url);
            }
            // If it's a new file being uploaded
            else if (file.originFileObj) {
                console.log("Reading new file for preview");
                const reader = new FileReader();
                reader.onload = (e) => {
                    console.log("FileReader completed, setting preview");
                    setPreviewUrl(e.target.result);
                };
                reader.readAsDataURL(file.originFileObj);
            }
        } else {
            console.log("No value or empty array, clearing preview");
            setPreviewUrl(null);
            setFileList([]);
        }
    }, [value]);

    const handleChange = (info) => {
        const { fileList: newFileList } = info;
        setFileList(newFileList);
        
        if (newFileList.length > 0) {
            const file = newFileList[0];
            const actualFile = file.originFileObj || file;
            
            if (actualFile && actualFile instanceof File) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setPreviewUrl(e.target.result);
                };
                reader.readAsDataURL(actualFile);
            }
            
            // Update form field
            onChange?.(newFileList);
        } else {
            setPreviewUrl(null);
            onChange?.([]);
        }
    };

    const handleRemove = () => {
        setPreviewUrl(null);
        setFileList([]);
        onChange?.([]);
    };

    return (
        <div>
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
            {previewUrl && (
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
        </div>
    );
};

export default FamilyPhotoUpload;
