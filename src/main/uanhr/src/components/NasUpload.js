import React, { useState } from "react";
import axios from "axios";

function NasUpload() {
    const [file, setFile] = useState(null);
    const [meta, setMeta] = useState({
        albumId: "",
        title: "",
        description: "",
        tags: "",
        location: "",
    });
    const [message, setMessage] = useState("");
    const [uploadedUrl, setUploadedUrl] = useState("");

    const handleFileChange = (e) => setFile(e.target.files[0]);
    const handleMetaChange = (e) => setMeta({ ...meta, [e.target.name]: e.target.value });

    const handleUpload = async () => {
        if (!file) {
            setMessage("❌ 파일을 선택해주세요.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("albumId", meta.albumId);
        formData.append("title", meta.title);
        formData.append("description", meta.description);
        formData.append("tags", meta.tags);
        formData.append("location", meta.location);

        try {
            setMessage("⏳ 업로드 중...");
            const res = await axios.post("https://web.inku.i234.me/api/nas/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setMessage("✅ 업로드 성공");
            setUploadedUrl(res.data.fileUrl); // DTO 반영
        } catch (err) {
            console.error(err);
            setMessage("❌ 업로드 실패: " + (err.response?.data || err.message));
            setUploadedUrl("");
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "20px auto", textAlign: "center" }}>
            <h3>NAS 파일 업로드</h3>

            <input type="file" onChange={handleFileChange} /><br /><br />

            <input
                type="text"
                name="albumId"
                placeholder="앨범 ID"
                value={meta.albumId}
                onChange={handleMetaChange}
            /><br /><br />

            <input
                type="text"
                name="title"
                placeholder="제목"
                value={meta.title}
                onChange={handleMetaChange}
            /><br /><br />

            <input
                type="text"
                name="description"
                placeholder="설명"
                value={meta.description}
                onChange={handleMetaChange}
            /><br /><br />

            <input
                type="text"
                name="tags"
                placeholder="태그 (쉼표 구분)"
                value={meta.tags}
                onChange={handleMetaChange}
            /><br /><br />

            <input
                type="text"
                name="location"
                placeholder="위치"
                value={meta.location}
                onChange={handleMetaChange}
            /><br /><br />

            <button onClick={handleUpload} style={{ padding: "6px 12px" }}>업로드</button>

            <p>{message}</p>
            {uploadedUrl && (
                <div>
                    <p>파일 URL:</p>
                    <a href={uploadedUrl} target="_blank" rel="noopener noreferrer">{uploadedUrl}</a>
                    <br />
                    <img src={uploadedUrl} alt="uploaded" style={{ maxWidth: "100%", marginTop: "10px" }} />
                </div>
            )}
        </div>
    );
}

export default NasUpload;
