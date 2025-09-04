package com.example.uanhr.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class PhotoUploadRequest {
    private Long albumId;
    private String title;
    private String description;
    private String tags;
    private String location;
}
