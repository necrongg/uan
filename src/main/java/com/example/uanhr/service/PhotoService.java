package com.example.uanhr.service;

import com.example.uanhr.entity.Photo;
import com.example.uanhr.entity.Album;
import com.example.uanhr.repository.PhotoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PhotoService {
    private final PhotoRepository photoRepository;

    public Photo uploadPhoto(Photo photo) {
        return photoRepository.save(photo);
    }

    public List<Photo> getPhotosByAlbum(Album album) {
        return photoRepository.findByAlbum(album);
    }

    public Optional<Photo> getPhoto(Long id) {
        return photoRepository.findById(id);
    }
}
