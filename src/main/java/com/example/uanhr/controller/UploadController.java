package com.example.uanhr.controller;

import com.example.uanhr.service.NasService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class UploadController {

    private final NasService nasService;

    public UploadController(NasService nasService) {
        this.nasService = nasService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String url = nasService.uploadFile(file);
            return ResponseEntity.ok(Map.of("success", true, "url", url));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("success", false, "error", e.getMessage()));
        }
    }
}
