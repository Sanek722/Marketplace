package com.example.authService.infrastructure.controller;



import com.example.authService.domain.Entity.User;
import com.example.authService.infrastructure.Adapters.UserRepositoryAdapter;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("user/files")
public class FileController
{
    private final String UploadDirPicture = "uploads/";
    private final UserRepositoryAdapter userRepository;

    public FileController(UserRepositoryAdapter userRepository) {
        this.userRepository = userRepository;
    }
    @PostMapping("/upload")
    public ResponseEntity<String> uploadPictureProfile(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("X-User") String username
    ) throws IOException {
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(UploadDirPicture, fileName);
        Files.createDirectories(filePath.getParent());
        Files.write(filePath, file.getBytes());
        // Найти пользователя в базе
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден: " + username));
        // Сохранить путь к файлу
        user.setAvatarUrl("/user/files/" + fileName);
        userRepository.save(user);

        return ResponseEntity.ok("Фотография успешно загружена и сохранена");
    }
    @GetMapping("/{filename}")
    public ResponseEntity<Resource> getFile(@PathVariable String filename) throws IOException {
        try {
            Path file = Paths.get(UploadDirPicture, filename);
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                throw new RuntimeException("Файл не найден или не читается: " + filename);
            }
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при загрузке файла: " + filename, e);
        }
    }
}
