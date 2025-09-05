package com.example.uanhr.repository;

import com.example.uanhr.entity.Like;
import com.example.uanhr.entity.Photo;
import com.example.uanhr.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LikeRepository extends JpaRepository<Like, Long> {
    List<Like> findByPhoto(Photo photo);
    List<Like> findByUser(User user);
    Optional<Like> findByPhotoAndUser(Photo photo, User user);
}
