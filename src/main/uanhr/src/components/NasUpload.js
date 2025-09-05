import React, { useState } from "react";
import axios from "axios";

function NasUpload() {
    const [files, setFiles] = useState([]);
    const [meta, setMeta] = useState({
        albumId: "",
        title: "",
        description: "",
        tags: "",
        location: "",
    });
    const [message, setMessage] = useState("");
    const [uploadedUrls, setUploadedUrls] = useState([]);

    const handleFileChange = (e) => setFiles(Array.from(e.target.files));
    const handleMetaChange = (e) => setMeta({ ...meta, [e.target.name]: e.target.value });

    const handleUpload = async () => {
        if (files.length === 0) {
            setMessage("❌ 파일을 선택해주세요.");
            return;
        }

        const formData = new FormData();
        files.forEach((f) => formData.append("files", f)); // ✅ 여러 개 전송
        formData.append("albumId", meta.albumId);
        formData.append("title", meta.title);
        formData.append("description", meta.description);
        formData.append("tags", meta.tags);
        formData.append("location", meta.location);

        try {
            setMessage("⏳ 업로드 중...");
            const res = await axios.post("http://localhost:8080/api/nas/upload-multi", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            // const res = await axios.post("https://web.inku.i234.me/api/nas/upload-multi", formData, {
            //     headers: { "Content-Type": "multipart/form-data" },
            // });

            setMessage("✅ 업로드 성공");
            setUploadedUrls(res.data.map((p) => p.fileUrl));
        } catch (err) {
            console.error(err);
            setMessage("❌ 업로드 실패: " + (err.response?.data || err.message));
            setUploadedUrls([]);
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "20px auto", textAlign: "center" }}>
            <h3>사진 올리기</h3>

            <input type="file" multiple onChange={handleFileChange} /><br /><br />

            <input type="text" name="albumId" placeholder="앨범 ID"
                   value={meta.albumId} onChange={handleMetaChange} /><br /><br />
            <input type="text" name="title" placeholder="제목"
                   value={meta.title} onChange={handleMetaChange} /><br /><br />
            <input type="text" name="description" placeholder="설명"
                   value={meta.description} onChange={handleMetaChange} /><br /><br />
            <input type="text" name="tags" placeholder="태그 (쉼표 구분)"
                   value={meta.tags} onChange={handleMetaChange} /><br /><br />
            <input type="text" name="location" placeholder="위치"
                   value={meta.location} onChange={handleMetaChange} /><br /><br />

            <button onClick={handleUpload} style={{ padding: "6px 12px" }}>업로드</button>

            <p>{message}</p>
            {uploadedUrls.length > 0 && (
                <div>
                    <p>업로드된 파일:</p>
                    {uploadedUrls.map((url, idx) => (
                        <div key={idx}>
                            <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
                            <br />
                            <img src={url} alt="uploaded" style={{ maxWidth: "100%", marginTop: "10px" }} />
                            <hr />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default NasUpload;
