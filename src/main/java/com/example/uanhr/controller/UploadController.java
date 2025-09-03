package com.example.uanhr.controller;

import com.example.uanhr.service.NasService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class UploadController {

    private final NasService nasService;

    public UploadController(NasService nasService) {
        this.nasService = nasService;
    }

    @PostMapping("/upload")
    public String uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            return nasService.uploadFile(file);
        } catch (Exception e) {
            e.printStackTrace();
            return "{\"success\": false, \"error\": \"" + e.getMessage() + "\"}";
        }
    }
}
