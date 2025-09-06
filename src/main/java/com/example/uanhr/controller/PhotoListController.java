package com.example.uanhr.controller;

import com.example.uanhr.dto.PhotoResponse;
import com.example.uanhr.entity.Photo;
import com.example.uanhr.repository.PhotoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PhotoListController {

    private final PhotoRepository photoRepository;

    @GetMapping("/list")
    public ResponseEntity<List<PhotoResponse>> listPhotos() {
        List<Photo> photos = photoRepository.findAll(Sort.by(Sort.Direction.DESC, "uploadedDate")); // 최신순
        List<PhotoResponse> res = photos.stream()
                .map(p -> PhotoResponse.builder()
                        .id(p.getId())
                        .title(p.getTitle())
                        .description(p.getDescription())
                        .takenDate(p.getTakenDate())
                        .fileUrl(p.getFileUrl())
                        .uploadedDate(p.getUploadedDate())
                        .tags(p.getTags())
                        .location(p.getLocation())
                        .build())
                .toList();
        return ResponseEntity.ok(res);
    }

}
