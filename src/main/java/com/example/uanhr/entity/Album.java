package com.example.uanhr.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "albums")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Album {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String description;

    private LocalDateTime createdAt;

    // cover_photo_id → photos.id (nullable)
    @OneToOne
    @JoinColumn(name = "cover_photo_id")
    private Photo coverPhoto;

    // 관계
    @OneToMany(mappedBy = "album", cascade = CascadeType.ALL)
    private List<Photo> photos;
}
