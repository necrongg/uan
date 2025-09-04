package com.example.uanhr.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhotoResponse {
    private Long id;
    private String title;
    private String fileUrl;
    private LocalDateTime uploadedDate;
}
