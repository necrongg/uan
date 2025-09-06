import React, { useState } from "react";
import NasUpload from "./components/NasUpload";
import NasGallery from "./components/NasGallery";
import "./App.css"
import { Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";

function App() {
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    return (
        <div>
            <div className="title-flex">
                <h2>갤러리</h2>
                <div className="btn-flex">
                    <Button icon={<UploadOutlined />} onClick={() => setIsUploadOpen(true)}>
                        사진 올리기
                    </Button>
                </div>
            </div>

            {/* 업로드 모달 */}
            {isUploadOpen && (
                <NasUpload
                    onClose={() => setIsUploadOpen(false)}
                />
            )}

            {/* 갤러리 */}
            <NasGallery />
        </div>
    );
}

export default App;
