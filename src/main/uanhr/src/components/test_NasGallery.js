import React, { useEffect, useState } from "react";
import axios from "axios";
import "./NasGallery.css";

function Test_NasGallery() {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const res = await axios.get("http://localhost:8080/api/nas/list");
                setPhotos(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPhotos();
    }, []);

    if (loading) return <p>⏳ 사진 불러오는 중...</p>;

    return (
        <>
            <div className="masonry">
                {photos.map((photo) => (
                    <div key={photo.id} className="masonry-item" onClick={() => setSelected(photo)}>
                        <img src={photo.fileUrl} alt={photo.title || "photo"} />
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
                            <p><strong>업로드:</strong> {selected.uploadedDate}</p>
                            <p><strong>태그:</strong> {selected.tags || "없음"}</p>
                            <p><strong>위치:</strong> {selected.location || "정보 없음"}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Test_NasGallery;
