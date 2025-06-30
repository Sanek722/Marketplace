package com.example.authService.domain.Port;

import com.example.authService.domain.Entity.User;

import java.util.Optional;

public interface UserRepositoryPort {
    Optional<User> findByUsername(String username);
    User save(User user);
}

