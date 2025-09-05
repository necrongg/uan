package com.example.uanhr.repository;

import com.example.uanhr.entity.Comment;
import com.example.uanhr.entity.Photo;
import com.example.uanhr.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPhoto(Photo photo);
    List<Comment> findByUser(User user);
}
