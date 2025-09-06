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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/nas")
@RequiredArgsConstructor
@CrossOrigin(origins = "https://web.inku.i234.me")
public class UploadController {

    private final NasService nasService;
    private final AlbumService albumService;

    @PostMapping("/upload-multi")
    public ResponseEntity<?> uploadFiles(
            @RequestPart("files") MultipartFile[] files,
            @RequestParam(required = false) Long albumId,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) LocalDateTime takenDate,
            @RequestParam(required = false) String tags,
            @RequestParam(required = false) String location
    ) {
        try {
            Album album = null;
            if (albumId != null) {
                album = albumService.getAlbum(albumId)
                        .orElseThrow(() -> new RuntimeException("앨범을 찾을 수 없습니다."));
            }

            List<PhotoResponse> responses = new ArrayList<>();

            // **배치 업로드 처리**
            for (MultipartFile file : files) {
                try {
                    Photo photo = nasService.uploadFileAndSave(
                            file, title, takenDate, description, tags, location, album
                    );
                    responses.add(PhotoResponse.builder()
                            .id(photo.getId())
                            .title(photo.getTitle())
                            .fileUrl(photo.getFileUrl())
                            .takenDate(photo.getTakenDate())
                            .uploadedDate(photo.getUploadedDate())
                            .build());
                } catch (Exception e) {
                    // 개별 파일 업로드 실패 처리: 로그 기록, 실패 파일 정보 추가 등
                    System.err.println("파일 업로드 실패: " + file.getOriginalFilename() + " / " + e.getMessage());
                }
            }

            if (responses.isEmpty()) {
                return ResponseEntity.status(500).body("❌ 모든 파일 업로드 실패");
            }

            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("❌ 업로드 실패: " + e.getMessage());
        }
    }


}
