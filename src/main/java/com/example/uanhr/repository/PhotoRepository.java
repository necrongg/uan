package com.example.uanhr.repository;

import com.example.uanhr.entity.Photo;
import com.example.uanhr.entity.Album;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PhotoRepository extends JpaRepository<Photo, Long> {
    List<Photo> findByAlbum(Album album);
}
