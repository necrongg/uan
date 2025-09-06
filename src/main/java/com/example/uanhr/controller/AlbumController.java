package com.example.uanhr.controller;

import com.example.uanhr.dto.AlbumDto;
import com.example.uanhr.service.AlbumService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/albums")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AlbumController {

    private final AlbumService albumService;

    @GetMapping
    public List<AlbumDto> getAllAlbums() {
        return albumService.getAllAlbums()
                .stream()
                .map(a -> new AlbumDto(a.getId(), a.getName(), a.getDescription()))
                .collect(Collectors.toList());
    }
}
