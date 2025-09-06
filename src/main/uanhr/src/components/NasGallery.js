import React, { useEffect, useState } from "react";
import axios from "axios";
import "./NasGallery.css";

function NasGallery() {
    const [photos, setPhotos] = useState([]); // DB/API에서 가져온 사진
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [likes, setLikes] = useState([]);
    const [likedPhotos, setLikedPhotos] = useState([]);

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const res = await axios.get(`https://web.inku.i234.me/api/nas/list`);
                const data = res.data.map((photo) => ({
                    ...photo,
                    uploadedDate: photo.uploadedDate || photo.takenDate || "날짜 없음",
                }));
                setPhotos(data);
                setLikes(data.map(() => 0));
                setLikedPhotos(data.map(() => false));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPhotos();
    }, []);

    const handleLike = (index) => {
        const newLikes = [...likes];
        const newLiked = [...likedPhotos];

        if (!newLiked[index]) {
            newLikes[index] += 1;
            newLiked[index] = true;
        } else {
            newLikes[index] -= 1;
            newLiked[index] = false;
        }

        setLikes(newLikes);
        setLikedPhotos(newLiked);
    };

    if (loading) return <p>⏳ 사진 불러오는 중...</p>;

    return (
        <>
            <div className="masonry">
                {photos.map((photo, idx) => (
                    <div key={photo.id} className="masonry-item" onClick={() => setSelected({ ...photo, idx })}>
                        <img src={photo.fileUrl} alt={photo.title || "photo"} />
                        <div className="photo-overlay">
                            <div className="overlay-text">
                                <p className="overlay-title">{photo.title || "제목 없음"}</p>
                                <p className="overlay-date">{photo.uploadedDate}</p>
                                <p className="overlay-likes">❤️ {likes[idx]}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selected && (
                <div className="modal-overlay" onClick={() => setSelected(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setSelected(null)}>✖</button>
                        <div className="modal-left">
                            <img src={selected.fileUrl} alt={selected.title || "photo"} />
                        </div>
                        <div className="modal-right">
                            <h2>{selected.title || "제목 없음"}</h2>
                            <p>{selected.description || "설명 없음"}</p>
                            <p><strong>태그:</strong> {selected.tags || "없음"}</p>
                            <p><strong>위치:</strong> {selected.location || "정보 없음"}</p>
                            <p><strong>업로드:</strong> {selected.uploadedDate}</p>
                            <p><strong>촬영일:</strong> {selected.takenDate || "정보 없음"}</p>

                            <div className="like-section">
                                <button
                                    className={`like-btn ${likedPhotos[selected.idx] ? "liked" : ""}`}
                                    onClick={() => handleLike(selected.idx)}>
                                    ❤️ 좋아요
                                </button>
                                <span className="like-count">{likes[selected.idx]}</span>
                            </div>

                            <div className="comment-section">
                                <p>댓글 영역 (준비중)</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default NasGallery;
