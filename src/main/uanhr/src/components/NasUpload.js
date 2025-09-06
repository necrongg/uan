import React, { useState, useEffect, useRef } from "react";
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
import exifr from "exifr";
import heic2any from "heic2any";
import "./NasUpload.css";

function NasUpload({ onClose }) {
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [message, setMessage] = useState("");
    const [albums, setAlbums] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [progress, setProgress] = useState(0);
    const [uploadedCount, setUploadedCount] = useState(0);
    const [meta, setMeta] = useState({
        albumId: "",
        title: "",
        description: "",
        tags: "",
        location: "",
        takenDate: "",
    });

    const fileInputRef = useRef(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { delay: 200, tolerance: 5 },
        })
    );

    // 앨범 불러오기
    useEffect(() => {
        const fetchAlbums = async () => {
            try {
                const res = await axios.get("https://web.inku.i234.me/api/albums");
                const albumList = Array.isArray(res.data) ? res.data : [];
                setAlbums(albumList);
                if (albumList.length > 0)
                    setMeta((prev) => ({ ...prev, albumId: String(albumList[0].id) }));
            } catch (err) {
                console.error("앨범 가져오기 실패:", err);
            }
        };
        fetchAlbums();
    }, []);

    // 파일 처리 (HEIC 변환 + EXIF)
    const handleFiles = async (selectedFiles) => {
        const processedFiles = [...files];
        const processedPreviews = [...previews];

        await Promise.all(
            selectedFiles.map(async (file, index) => {
                processedFiles.push(file);

                let previewURL;
                if (file.type === "image/heic" || file.name.toLowerCase().endsWith(".heic")) {
                    try {
                        const convertedBlob = await heic2any({ blob: file, toType: "image/jpeg" });
                        previewURL = URL.createObjectURL(convertedBlob);
                    } catch (err) {
                        console.error("HEIC 변환 실패", err);
                        previewURL = "";
                    }
                } else {
                    previewURL = URL.createObjectURL(file);
                }
                processedPreviews.push(previewURL);

                // 첫 번째 파일에 대해서만 EXIF 적용
                if (files.length === 0 && index === 0) {
                    try {
                        const exifData = await exifr.parse(file, { gps: true });
                        const takenDate = exifData?.DateTimeOriginal
                            ? new Date(exifData.DateTimeOriginal).toISOString().slice(0, 16)
                            : new Date(file.lastModified).toISOString().slice(0, 16);

                        let location = "";
                        if (exifData?.latitude && exifData?.longitude) {
                            location = `${exifData.latitude},${exifData.longitude}`;
                        }

                        setMeta((prev) => ({ ...prev, takenDate, location }));
                    } catch (err) {
                        console.warn("EXIF 읽기 실패:", err);
                    }
                }
            })
        );

        setFiles(processedFiles);
        setPreviews(processedPreviews);
    };

    const handleAddClick = () => {
        fileInputRef.current.click();
    };

    const handleDelete = (index) => {
        const newFiles = [...files];
        const newPreviews = [...previews];
        newFiles.splice(index, 1);
        newPreviews.splice(index, 1);
        setFiles(newFiles);
        setPreviews(newPreviews);
        if (currentIndex >= newFiles.length) setCurrentIndex(newFiles.length - 1);
        else if (index < currentIndex) setCurrentIndex((prev) => prev - 1);
    };

    const handleUpload = async () => {
        if (files.length === 0) return setMessage("❌ 파일을 선택해주세요.");
        if (!meta.albumId) return setMessage("❌ 앨범을 선택해주세요.");

        try {
            setMessage("⏳ 업로드 중...");
            setProgress(0);
            setUploadedCount(0);

            let count = 0;

            for (let i = 0; i < files.length; i++) {
                const formData = new FormData();
                formData.append("files", files[i]);
                Object.keys(meta).forEach((key) => formData.append(key, meta[key]));

                await axios.post("https://web.inku.i234.me/api/nas/upload-multi", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                    onUploadProgress: (event) => {
                        const fileProgress = Math.round((event.loaded / event.total) * 100);
                        const overallProgress = Math.round(
                            ((count + fileProgress / 100) / files.length) * 100
                        );
                        setProgress(overallProgress);
                    },
                });

                count++;
                setUploadedCount(count);
            }

            setProgress(100);
            setMessage("✅ 업로드 성공");

            setTimeout(() => {
                window.location.reload();
            }, 500);
        } catch (err) {
            console.error(err);
            setMessage("❌ 업로드 실패: " + (err.response?.data || err.message));
        }
    };

    const prevSlide = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));
    const nextSlide = () => setCurrentIndex((prev) => Math.min(prev + 1, files.length - 1));

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;
        if (active.id !== over.id) {
            const oldIndex = Number(active.id);
            const newIndex = Number(over.id);
            setFiles(arrayMove(files, oldIndex, newIndex));
            setPreviews(arrayMove(previews, oldIndex, newIndex));
            if (currentIndex === oldIndex) setCurrentIndex(newIndex);
            else if (oldIndex < currentIndex && newIndex >= currentIndex)
                setCurrentIndex((prev) => prev - 1);
            else if (oldIndex > currentIndex && newIndex <= currentIndex)
                setCurrentIndex((prev) => prev + 1);
        }
        setActiveId(null);
    };

    return (
        <div className="nas-modal-overlay">
            <div className="nas-modal">
                <div
                    className={`nas-upload-area ${isDragging ? "dragging" : ""}`}
                    onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        handleFiles(Array.from(e.dataTransfer.files));
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
                                {previews.map((url, i) => (
                                    <img key={i} src={url} alt="preview" className="nas-preview-image" />
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
                                        {previews.map((url, i) => (
                                            <SortableThumbnail
                                                key={i}
                                                id={String(i)}
                                                file={files[i]}
                                                preview={url}
                                                isActive={i === currentIndex}
                                                onClick={() => setCurrentIndex(i)}
                                                onDelete={() => handleDelete(i)}
                                            />
                                        ))}

                                        {/* + 버튼 */}
                                        <AddThumbnailButton onAdd={handleAddClick} />
                                    </div>
                                </SortableContext>
                                <DragOverlay>
                                    {activeId !== null && (
                                        <img src={previews[Number(activeId)]} alt="drag" className="thumbnail-image" />
                                    )}
                                </DragOverlay>
                            </DndContext>

                            {/* 숨은 input */}
                            <input
                                type="file"
                                multiple
                                hidden
                                ref={fileInputRef}
                                onChange={(e) => handleFiles(Array.from(e.target.files))}
                            />
                        </>
                    ) : (
                        <label className="nas-file-label">
                            <input
                                type="file"
                                multiple
                                hidden
                                ref={fileInputRef}
                                onChange={(e) => handleFiles(Array.from(e.target.files))}
                            />
                            📂 여기에 드롭하거나 클릭해서 사진 선택
                        </label>
                    )}
                </div>

                <div className="nas-form">
                    <h2>새 게시물 만들기</h2>
                    <select
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
                        required
                        type="text"
                        placeholder="제목"
                        value={meta.title}
                        onChange={(e) => setMeta({ ...meta, title: e.target.value })}
                    />
                    <textarea
                        placeholder="설명"
                        value={meta.description}
                        onChange={(e) => setMeta({ ...meta, description: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="태그 (쉼표 구분)"
                        value={meta.tags}
                        onChange={(e) => setMeta({ ...meta, tags: e.target.value })}
                    />
                    <input
                        type="datetime-local"
                        placeholder="촬영일"
                        value={meta.takenDate}
                        onChange={(e) => setMeta({ ...meta, takenDate: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="위치"
                        value={meta.location}
                        onChange={(e) => setMeta({ ...meta, location: e.target.value })}
                    />
                    <p className="nas-message">{message}</p>
                    <div className="nas-progress">
                        <div className="nas-progress-bar" style={{ width: `${progress}%` }} />
                        <span>({uploadedCount}/{files.length}) {progress}%</span>
                    </div>

                    <button onClick={handleUpload} className="nas-upload-btn">
                        업로드
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="nas-close-btn"
                    disabled={message.startsWith("⏳")}
                    style={{ cursor: message.startsWith("⏳") ? "not-allowed" : "pointer" }}
                >
                    ✖
                </button>
            </div>
        </div>
    );
}

function SortableThumbnail({ id, preview, isActive, onClick, onDelete }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        border: isActive ? "2px solid #3b82f6" : "2px solid transparent",
    };
    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="thumbnail-wrapper">
            <img src={preview} alt="thumb" className="thumbnail-image" onClick={onClick} />
            <button
                className="thumbnail-delete"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={onDelete}
            >
                <CloseOutlined />
            </button>
        </div>
    );
}

// + 버튼 컴포넌트
function AddThumbnailButton({ onAdd }) {
    return (
        <div className="thumbnail-wrapper add-thumbnail" onClick={onAdd}>
            <span className="plus-sign">+</span>
        </div>
    );
}

export default NasUpload;
