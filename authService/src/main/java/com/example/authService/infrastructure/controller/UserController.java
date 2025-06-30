package com.example.authService.infrastructure.controller;

import com.example.authService.domain.Entity.User;
import com.example.authService.domain.Port.UpdateProfileRequest;
import com.example.authService.domain.Port.UserProfileDTO;
import com.example.authService.infrastructure.Adapters.UserRepositoryAdapter;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {
    private final UserRepositoryAdapter userRepository;

    public UserController(UserRepositoryAdapter userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDTO> getProfile(@RequestHeader("X-User") String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        UserProfileDTO profile = new UserProfileDTO(
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getAvatarUrl()
        );

        return ResponseEntity.ok(profile);
    }
    @PutMapping("/profile/update")
    public ResponseEntity<?> updateProfile(@RequestHeader("X-User") String username,
                                           @RequestBody UpdateProfileRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        userRepository.save(user);

        return ResponseEntity.ok("Профиль обновлен");
    }
}