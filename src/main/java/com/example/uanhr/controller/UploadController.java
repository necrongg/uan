package com.example.uanhr.controller;

import com.example.uanhr.entity.Photo;
import com.example.uanhr.service.NasService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/nas")
@RequiredArgsConstructor
public class UploadController {

    private final NasService nasService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestPart("file") MultipartFile file,
            @RequestParam(required = false) Long albumId,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String tags,
            @RequestParam(required = false) String location
    ) {
        try {
            Photo photo = nasService.uploadFileAndSave(file, title, description, tags, location, albumId);
            return ResponseEntity.ok(photo);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("❌ 업로드 실패: " + e.getMessage());
        }
    }
}
