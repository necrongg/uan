package com.example.uanhr.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "photos")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Photo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long albumId;
    private String title;
    private String description;
    private String fileUrl;
    private LocalDateTime takenDate;
    private LocalDateTime uploadedDate;
    private String tags;
    private String location;
}
