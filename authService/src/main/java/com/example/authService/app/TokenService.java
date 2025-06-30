package com.example.authService.app;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Service
public class TokenService {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final long TOKEN_EXPIRATION_TIME = 60 * 60; // 1 час

    public TokenService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }
    public void storeToken(String username, String token) {
        redisTemplate.opsForValue().set("refreshToken:" + username, token, 7, TimeUnit.DAYS);
    }
    public String getToken(String userId) {
        return (String) redisTemplate.opsForValue().get("TOKEN:" + userId);
    }
    public void revokeToken(String userId) {
        redisTemplate.delete("TOKEN:" + userId);
    }
}

