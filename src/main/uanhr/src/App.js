import React, { useState } from "react";
import NasUpload from "./components/NasUpload";
import NasGallery from "./components/NasGallery";

import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload } from 'antd';



function App() {
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 20px" }}>
                <h2>갤러리</h2>
                <div>
                    <Upload disabled>
                        <Button icon={<UploadOutlined />} onClick={() => setIsUploadOpen(true)}>사진 올리기</Button>
                    </Upload>
                </div>
            </div>

            {/* 업로드 모달 */}
            {isUploadOpen && <NasUpload onClose={() => setIsUploadOpen(false)} />}

            {/* 갤러리 */}
            <NasGallery />
        </div>
    );
}

export default App;
