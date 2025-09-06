import React, { useState, useEffect } from "react";
import axios from "axios";
import "./NasUpload.css";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

function NasUpload({ onClose }) {
    const [files, setFiles] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [meta, setMeta] = useState({
        albumId: "",
        title: "",
        description: "",
        tags: "",
        location: "",
    });
    const [message, setMessage] = useState("");
    const [albums, setAlbums] = useState([]);

    // 앨범 불러오기
    useEffect(() => {
        const fetchAlbums = async () => {
            try {
                const res = await axios.get("http://localhost:8080/api/albums");
                const albumList = Array.isArray(res.data) ? res.data : [];
                setAlbums(albumList);
                if (albumList.length > 0) {
                    setMeta((prev) => ({
                        ...prev,
                        albumId: String(albumList[0].id),
                    }));
                }
            } catch (err) {
                console.error("앨범 가져오기 실패:", err);
                setAlbums([]);
            }
        };
        fetchAlbums();
    }, []);

    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
        setCurrentIndex(0);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFiles(Array.from(e.dataTransfer.files));
            setCurrentIndex(0);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleMetaChange = (e) =>
        setMeta({ ...meta, [e.target.name]: e.target.value });

    const handleUpload = async () => {
        if (files.length === 0) {
            setMessage("❌ 파일을 선택해주세요.");
            return;
        }
        if (!meta.albumId) {
            setMessage("❌ 앨범을 선택해주세요.");
            return;
        }

        const formData = new FormData();
        files.forEach((f) => formData.append("files", f));
        Object.keys(meta).forEach((key) => formData.append(key, meta[key]));

        try {
            setMessage("⏳ 업로드 중...");
            await axios.post("http://localhost:8080/api/nas/upload-multi", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setMessage("✅ 업로드 성공");
        } catch (err) {
            console.error(err);
            setMessage("❌ 업로드 실패: " + (err.response?.data || err.message));
        }
    };

    const prevSlide = () =>
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
    const nextSlide = () =>
        setCurrentIndex((prev) => (prev < files.length - 1 ? prev + 1 : prev));

    return (
        <div className="nas-modal-overlay">
            <div className="nas-modal">
                {/* 왼쪽 슬라이드 영역 */}
                <div
                    className={`nas-upload-area ${isDragging ? "dragging" : ""}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    {files.length > 0 ? (
                        <>
                            <div
                                className="nas-slide-wrapper"
                                style={{
                                    transform: `translateX(-${currentIndex * 100}%)`, // 한 장씩 정확히 이동
                                    width: `${files.length * 100}%`,                // wrapper 폭 = 이미지 수 * 100%
                                }}
                            >
                                {files.map((file, i) => (
                                    <img
                                        key={i}
                                        src={URL.createObjectURL(file)}
                                        alt="preview"
                                        className="nas-preview-image"
                                    />
                                ))}
                            </div>


                            {currentIndex > 0 && (
                                <button onClick={prevSlide} className="nas-arrow left">
                                    <LeftOutlined />
                                </button>
                            )}
                            {currentIndex < files.length - 1 && (
                                <button onClick={nextSlide} className="nas-arrow right">
                                    <RightOutlined />
                                </button>
                            )}

                            <div className="nas-dots">
                                {files.map((_, i) => (
                                    <span
                                        key={i}
                                        className={`dot ${i === currentIndex ? "active" : ""}`}
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <label className="nas-file-label">
                            <input type="file" multiple hidden onChange={handleFileChange} />
                            📂 여기에 드롭하거나 클릭해서 사진 선택
                        </label>
                    )}
                </div>

                {/* 오른쪽 폼 영역 */}
                <div className="nas-form">
                    <h2>새 게시물 만들기</h2>

                    <select name="albumId" value={meta.albumId} onChange={handleMetaChange}>
                        {albums.map((album) => (
                            <option key={album.id} value={String(album.id)}>
                                {album.name}
                            </option>
                        ))}
                    </select>

                    <input
                        type="text"
                        name="title"
                        placeholder="제목"
                        value={meta.title}
                        onChange={handleMetaChange}
                    />
                    <textarea
                        name="description"
                        placeholder="설명"
                        value={meta.description}
                        onChange={handleMetaChange}
                    />
                    <input
                        type="text"
                        name="tags"
                        placeholder="태그 (쉼표 구분)"
                        value={meta.tags}
                        onChange={handleMetaChange}
                    />
                    <input
                        type="text"
                        name="location"
                        placeholder="위치"
                        value={meta.location}
                        onChange={handleMetaChange}
                    />

                    <button onClick={handleUpload} className="nas-upload-btn">
                        업로드
                    </button>
                    <p className="nas-message">{message}</p>
                </div>

                <button onClick={onClose} className="nas-close-btn">
                    ✖
                </button>
            </div>
        </div>
    );
}

export default NasUpload;
