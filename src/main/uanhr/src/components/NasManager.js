import React, { useState, useEffect } from "react";
import axios from "axios";

function NasManager() {
    const [file, setFile] = useState(null);
    const [meta, setMeta] = useState({
        albumId: "",
        title: "",
        description: "",
        tags: "",
        location: "",
    });
    const [message, setMessage] = useState("");
    const [photos, setPhotos] = useState([]);
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    const API_URL = process.env.REACT_APP_API_URL || "https://web.inku.i234.me";

    // NAS 사진 목록 가져오기
    const fetchPhotos = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/nas/list`);
            setPhotos(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchPhotos();
    }, []);

    const handleFileChange = (e) => setFile(e.target.files[0]);
    const handleMetaChange = (e) => setMeta({ ...meta, [e.target.name]: e.target.value });

    const handleUpload = async () => {
        if (!file) {
            setMessage("❌ 파일을 선택해주세요.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("album", meta.albumId);
        formData.append("title", meta.title);
        formData.append("description", meta.description);
        formData.append("tags", meta.tags);
        formData.append("location", meta.location);

        try {
            setMessage("⏳ 업로드 중...");
            await axios.post(`${API_URL}/api/nas/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setMessage("✅ 업로드 성공");
            setFile(null);
            setMeta({ albumId: "", title: "", description: "", tags: "", location: "" });
            fetchPhotos(); // 업로드 후 갤러리 갱신
        } catch (err) {
            console.error(err);
            setMessage("❌ 업로드 실패: " + (err.response?.data || err.message));
        }
    };

    return (
        <div style={{ maxWidth: "600px", margin: "20px auto", textAlign: "center" }}>
            <h3>NAS 파일 업로드 & 갤러리</h3>

            <input type="file" onChange={handleFileChange} /><br /><br />

            <input type="text" name="albumId" placeholder="앨범 ID" value={meta.albumId} onChange={handleMetaChange} /><br /><br />
            <input type="text" name="title" placeholder="제목" value={meta.title} onChange={handleMetaChange} /><br /><br />
            <input type="text" name="description" placeholder="설명" value={meta.description} onChange={handleMetaChange} /><br /><br />
            <input type="text" name="tags" placeholder="태그" value={meta.tags} onChange={handleMetaChange} /><br /><br />
            <input type="text" name="location" placeholder="위치" value={meta.location} onChange={handleMetaChange} /><br /><br />

            <button onClick={handleUpload} style={{ padding: "6px 12px" }}>업로드</button>
            <p>{message}</p>

            <hr />

            <h4>갤러리</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
                {photos.map((url, idx) => (
                    <div
                        key={idx}
                        style={{ width: "150px", height: "150px", overflow: "hidden", cursor: "pointer" }}
                        onClick={() => setSelectedPhoto(url)}
                    >
                        <img src={url} alt={`photo-${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                ))}
            </div>

            {selectedPhoto && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0,0,0,0.8)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                        cursor: "pointer"
                    }}
                    onClick={() => setSelectedPhoto(null)}
                >
                    <img src={selectedPhoto} alt="selected" style={{ maxWidth: "90%", maxHeight: "90%" }} />
                </div>
            )}
        </div>
    );
}

export default NasManager;
