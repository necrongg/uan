import React, { useState } from "react";
import NasUpload from "./components/NasUpload";
import NasGallery from "./components/NasGallery";
import { Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";

function App() {
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    return (
        <div>
            {contextHolder} {/* 메시지 표시 영역 */}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 20px" }}>
                <h2>갤러리</h2>
                <div>
                    <Button icon={<UploadOutlined />} onClick={() => setIsUploadOpen(true)}>
                        사진 올리기
                    </Button>
                </div>
            </div>

            {/* 업로드 모달 */}
            {isUploadOpen && (
                <NasUpload
                    onClose={() => setIsUploadOpen(false)}
                    messageApi={messageApi} // 상위에서 메시지 전달
                />
            )}

            {/* 갤러리 */}
            <NasGallery />
        </div>
    );
}

export default App;
