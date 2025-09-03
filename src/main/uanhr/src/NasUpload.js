import React, { useState } from "react";
import axios from "axios";

function NasUpload() {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage("❌ 파일을 선택해주세요.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setMessage("⏳ 업로드 중...");
            const res = await axios.post("http://localhost:8080/api/nas/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setMessage(res.data); // 업로드된 파일 URL 포함 메시지
        } catch (err) {
            console.error(err);
            setMessage("❌ 업로드 실패: " + (err.response?.data || err.message));
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "20px auto", textAlign: "center" }}>
            <h3>NAS 파일 업로드</h3>
            <input type="file" onChange={handleFileChange} />
            <br /><br />
            <button onClick={handleUpload} style={{ padding: "6px 12px" }}>업로드</button>
            <p>{message}</p>
        </div>
    );
}

export default NasUpload;
