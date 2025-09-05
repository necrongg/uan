package com.example.uanhr.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PhotoResponse {
    private Long id;
    private String title;
    private String description;
    private String fileUrl;
    private LocalDateTime uploadedDate;
    private String tags;
    private String location;
}
