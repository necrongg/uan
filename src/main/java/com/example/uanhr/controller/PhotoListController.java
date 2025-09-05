package com.example.uanhr.controller;

import com.example.uanhr.service.NasService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nas")
@RequiredArgsConstructor
public class PhotoListController {

    private final NasService nasService;

    @GetMapping("/list")
    public ResponseEntity<?> getPhotoList() {
        try {
            List<String> photos = nasService.listPhotos();
            return ResponseEntity.ok(photos);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("❌ NAS 목록 조회 실패: " + e.getMessage());
        }
    }
}
