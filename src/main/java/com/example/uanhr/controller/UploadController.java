package com.example.uanhr.controller;

import com.example.uanhr.service.NasService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/nas")
public class UploadController {

    private final NasService nasService;

    @Autowired
    public UploadController(NasService nasService) {
        this.nasService = nasService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String uploadedFileUrl = nasService.uploadFile(file);
            return ResponseEntity.ok().body("✅ 업로드 성공: " + uploadedFileUrl);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("❌ 업로드 실패: " + e.getMessage());
        }
    }
}
