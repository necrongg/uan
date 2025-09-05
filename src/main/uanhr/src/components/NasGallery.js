import React, { useState } from "react";
import "./NasGallery.css";

const samplePhotos = [
    { id: 1, fileUrl: "https://picsum.photos/id/1015/600/400", title: "사진 1", description: "샘플 이미지 1", uploadedDate: "2025-09-05", tags: "tag1", location: "서울" },
    { id: 2, fileUrl: "https://picsum.photos/id/1016/600/400", title: "사진 2", description: "샘플 이미지 2", uploadedDate: "2025-09-04", tags: "tag2", location: "부산" },
    { id: 3, fileUrl: "https://picsum.photos/id/1018/600/400", title: "사진 3", description: "샘플 이미지 3", uploadedDate: "2025-09-03", tags: "tag3", location: "대구" },
    { id: 4, fileUrl: "https://picsum.photos/id/1020/600/400", title: "사진 4", description: "샘플 이미지 4", uploadedDate: "2025-09-02", tags: "tag4", location: "인천" },
    { id: 5, fileUrl: "https://picsum.photos/id/1024/600/400", title: "사진 5", description: "샘플 이미지 5", uploadedDate: "2025-09-01", tags: "tag5", location: "광주" },
    { id: 6, fileUrl: "https://picsum.photos/id/1025/600/400", title: "사진 6", description: "샘플 이미지 6", uploadedDate: "2025-08-31", tags: "tag6", location: "대전" },
    { id: 7, fileUrl: "https://picsum.photos/id/1027/600/400", title: "사진 7", description: "샘플 이미지 7", uploadedDate: "2025-08-30", tags: "tag7", location: "울산" },
    { id: 8, fileUrl: "https://picsum.photos/id/1035/600/400", title: "사진 8", description: "샘플 이미지 8", uploadedDate: "2025-08-29", tags: "tag8", location: "제주" },
    { id: 9, fileUrl: "https://picsum.photos/id/1038/600/400", title: "사진 9", description: "샘플 이미지 9", uploadedDate: "2025-08-28", tags: "tag9", location: "강릉" },
    { id: 10, fileUrl: "https://picsum.photos/id/1039/600/400", title: "사진 10", description: "샘플 이미지 10", uploadedDate: "2025-08-27", tags: "tag10", location: "속초" },
    { id: 11, fileUrl: "https://picsum.photos/id/1041/600/400", title: "사진 11", description: "샘플 이미지 11", uploadedDate: "2025-08-26", tags: "tag11", location: "춘천" },
    { id: 12, fileUrl: "https://picsum.photos/id/1043/600/400", title: "사진 12", description: "샘플 이미지 12", uploadedDate: "2025-08-25", tags: "tag12", location: "강진" },
    { id: 13, fileUrl: "https://picsum.photos/id/1050/600/400", title: "사진 13", description: "샘플 이미지 13", uploadedDate: "2025-08-24", tags: "tag13", location: "목포" },
    { id: 14, fileUrl: "https://picsum.photos/id/1052/600/400", title: "사진 14", description: "샘플 이미지 14", uploadedDate: "2025-08-23", tags: "tag14", location: "여수" },
    { id: 15, fileUrl: "https://picsum.photos/id/1053/600/400", title: "사진 15", description: "샘플 이미지 15", uploadedDate: "2025-08-22", tags: "tag15", location: "순천" },
    { id: 16, fileUrl: "https://picsum.photos/id/1055/600/400", title: "사진 16", description: "샘플 이미지 16", uploadedDate: "2025-08-21", tags: "tag16", location: "광양" },
    { id: 17, fileUrl: "https://picsum.photos/id/1060/600/400", title: "사진 17", description: "샘플 이미지 17", uploadedDate: "2025-08-20", tags: "tag17", location: "포항" },
    { id: 18, fileUrl: "https://picsum.photos/id/1062/600/400", title: "사진 18", description: "샘플 이미지 18", uploadedDate: "2025-08-19", tags: "tag18", location: "경주" },
    { id: 19, fileUrl: "https://picsum.photos/id/1065/600/400", title: "사진 19", description: "샘플 이미지 19", uploadedDate: "2025-08-18", tags: "tag19", location: "부안" },
    { id: 20, fileUrl: "https://picsum.photos/id/1069/600/400", title: "사진 20", description: "샘플 이미지 20", uploadedDate: "2025-08-17", tags: "tag20", location: "군산" },
];

function NasGallery() {
    const [selected, setSelected] = useState(null);
    const [likes, setLikes] = useState(samplePhotos.map(() => 0));
    const [likedPhotos, setLikedPhotos] = useState(samplePhotos.map(() => false));

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

    return (
        <>
            <div className="masonry">
                {samplePhotos.map((photo, idx) => (
                    <div key={photo.id} className="masonry-item" onClick={() => setSelected({ ...photo, idx })}>
                        <img src={photo.fileUrl} alt={photo.title} />
                        <div className="photo-overlay">
                            <div className="overlay-text">
                                <p className="overlay-title">{photo.title}</p>
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
                            <img src={selected.fileUrl} alt={selected.title} />
                        </div>
                        <div className="modal-right">
                            <h2>{selected.title}</h2>
                            <p>{selected.description}</p>
                            <p><strong>업로드:</strong> {selected.uploadedDate}</p>
                            <p><strong>태그:</strong> {selected.tags}</p>
                            <p><strong>위치:</strong> {selected.location}</p>

                            <div className="like-section">
                                <button
                                    className={`like-btn ${likedPhotos[selected.idx] ? "liked" : ""}`}
                                    onClick={() => handleLike(selected.idx)}>
                                    ❤️ 좋아요
                                    <span className="like-heart"></span>
                                </button>
                                <p className="like-count">{likes[selected.idx]}</p>
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
