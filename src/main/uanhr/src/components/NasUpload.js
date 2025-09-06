import React, { useState, useEffect } from "react";
import axios from "axios";
import { LeftOutlined, RightOutlined, CloseOutlined } from "@ant-design/icons";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    useSortable,
    horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "./NasUpload.css";

function NasUpload({ onClose }) {
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [message, setMessage] = useState("");
    const [albums, setAlbums] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [meta, setMeta] = useState({
        albumId: "",
        title: "",
        description: "",
        tags: "",
        location: "",
    });

    // 드래그 센서 (1초 이상 눌러야 드래그 시작)
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                delay: 200, // 0.2초
                tolerance: 5, // 드래그 이동 허용 오차
            },
        })
    );

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

    // 파일 선택
    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
        setCurrentIndex(0);
    };

    // 파일 삭제
    const handleDelete = (index) => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        setFiles(newFiles);
        if (currentIndex >= newFiles.length) setCurrentIndex(newFiles.length - 1);
        else if (index < currentIndex) setCurrentIndex((prev) => prev - 1);
    };

    // 업로드
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

    const prevSlide = () => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
    const nextSlide = () =>
        setCurrentIndex((prev) => (prev < files.length - 1 ? prev + 1 : prev));

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = Number(active.id);
            const newIndex = Number(over.id);
            setFiles(arrayMove(files, oldIndex, newIndex));
            if (currentIndex === oldIndex) setCurrentIndex(newIndex);
            else if (oldIndex < currentIndex && newIndex >= currentIndex) setCurrentIndex((prev) => prev - 1);
            else if (oldIndex > currentIndex && newIndex <= currentIndex) setCurrentIndex((prev) => prev + 1);
        }
        setActiveId(null);
    };

    return (
        <div className="nas-modal-overlay">
            <div className="nas-modal">
                {/* 왼쪽 슬라이드 */}
                <div
                    className={`nas-upload-area ${isDragging ? "dragging" : ""}`}
                    onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const droppedFiles = Array.from(e.dataTransfer.files);
                        setFiles(droppedFiles);
                        setCurrentIndex(0);
                    }}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                    }}
                >

                {files.length > 0 ? (
                        <>
                            <div
                                className="nas-slide-wrapper"
                                style={{
                                    transform: `translateX(-${currentIndex * 100}%)`,
                                    width: `${files.length * 100}%`,
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

                            {/* 썸네일 하단 */}
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragStart={(e) => setActiveId(e.active.id)}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={files.map((_, i) => String(i))}
                                    strategy={horizontalListSortingStrategy}
                                >
                                    <div className="nas-thumbnails">
                                        {files.map((file, i) => (
                                            <SortableThumbnail
                                                key={i}
                                                id={String(i)}
                                                file={file}
                                                isActive={i === currentIndex}
                                                onClick={() => setCurrentIndex(i)}
                                                onDelete={() => handleDelete(i)}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>

                                <DragOverlay>
                                    {activeId !== null && (
                                        <img
                                            src={URL.createObjectURL(files[Number(activeId)])}
                                            alt="drag"
                                            className="thumbnail-image"
                                        />
                                    )}
                                </DragOverlay>
                            </DndContext>
                        </>
                    ) : (
                        <label className="nas-file-label">
                            <input type="file" multiple hidden onChange={handleFileChange} />
                            📂 여기에 드롭하거나 클릭해서 사진 선택
                        </label>
                    )}
                </div>

                {/* 오른쪽 폼 */}
                <div className="nas-form">
                    <h2>새 게시물 만들기</h2>
                    <select
                        name="albumId"
                        value={meta.albumId}
                        onChange={(e) => setMeta({ ...meta, albumId: e.target.value })}
                    >
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
                        onChange={(e) => setMeta({ ...meta, title: e.target.value })}
                    />
                    <textarea
                        name="description"
                        placeholder="설명"
                        value={meta.description}
                        onChange={(e) => setMeta({ ...meta, description: e.target.value })}
                    />
                    <input
                        type="text"
                        name="tags"
                        placeholder="태그 (쉼표 구분)"
                        value={meta.tags}
                        onChange={(e) => setMeta({ ...meta, tags: e.target.value })}
                    />
                    <input
                        type="text"
                        name="location"
                        placeholder="위치"
                        value={meta.location}
                        onChange={(e) => setMeta({ ...meta, location: e.target.value })}
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

// Sortable 썸네일
function SortableThumbnail({ id, file, isActive, onClick, onDelete }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        border: isActive ? "2px solid #3b82f6" : "2px solid transparent",
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="thumbnail-wrapper">
            <img src={URL.createObjectURL(file)} alt="thumb" className="thumbnail-image" onClick={onClick} />
            <button
                className="thumbnail-delete"
                onPointerDown={(e) => e.stopPropagation()} // 드래그 이벤트 차단
                onClick={onDelete}
            >
                <CloseOutlined />
            </button>
        </div>
    );
}

export default NasUpload;
