package com.example.uanhr.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "photos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Photo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 앨범과 관계 매핑 (FK: album_id)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "album_id", nullable = false)
    private Album album;

    private String title;

    private String description;

    private String fileUrl;

    private LocalDateTime takenDate;

    private LocalDateTime uploadedDate;

    private String tags;

    private String location;

    // 관계
    @OneToMany(mappedBy = "photo", cascade = CascadeType.ALL)
    private List<Comment> comments;

    @OneToMany(mappedBy = "photo", cascade = CascadeType.ALL)
    private List<Like> likes;
}
