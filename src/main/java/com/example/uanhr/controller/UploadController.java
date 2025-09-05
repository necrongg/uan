package com.example.uanhr.controller;

import com.example.uanhr.dto.PhotoResponse;
import com.example.uanhr.entity.Album;
import com.example.uanhr.entity.Photo;
import com.example.uanhr.service.AlbumService;
import com.example.uanhr.service.NasService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/nas")
@RequiredArgsConstructor
@CrossOrigin(origins = "https://web.inku.i234.me")
public class UploadController {

    private final NasService nasService;
    private final AlbumService albumService;

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
            Album album = null;
            if (albumId != null) {
                album = albumService.getAlbum(albumId)
                        .orElseThrow(() -> new RuntimeException("앨범을 찾을 수 없습니다."));
            }

            Photo photo = nasService.uploadFileAndSave(file, title, description, tags, location, album);

            PhotoResponse response = PhotoResponse.builder()
                    .id(photo.getId())
                    .title(photo.getTitle())
                    .fileUrl(photo.getFileUrl())
                    .uploadedDate(photo.getUploadedDate())
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("❌ 업로드 실패: " + e.getMessage());
        }
    }
}
