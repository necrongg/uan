import React, { useEffect, useState } from "react";
import axios from "axios";

function NasGallery() {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const res = await axios.get("https://web.inku.i234.me/api/nas/list");
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
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {photos.map((url, idx) => (
                <img key={idx} src={url} alt={`photo-${idx}`} style={{ width: "200px", height: "200px", objectFit: "cover" }} />
            ))}
        </div>
    );
}

export default NasGallery;
