import React, { useState } from "react";
import NasUpload from "./components/NasUpload";
import NasGallery from "./components/NasGallery";

function App() {
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 20px" }}>
                <h2>유안앨범</h2>
                <button onClick={() => setIsUploadOpen(true)} style={{ padding: "6px 12px", cursor: "pointer" }}>
                    사진 올리기
                </button>
            </div>

            {/* 업로드 모달 */}
            {isUploadOpen && <NasUpload onClose={() => setIsUploadOpen(false)} />}

            {/* 갤러리 */}
            <NasGallery />
        </div>
    );
}

export default App;
