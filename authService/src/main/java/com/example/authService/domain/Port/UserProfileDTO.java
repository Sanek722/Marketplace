package com.example.authService.domain.Port;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
public class UserProfileDTO {
    private String name;
    private String email;
    private String phone;
    private String avatarUrl;

    public UserProfileDTO(String name, String email, String phone, String avatarUrl) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.avatarUrl = avatarUrl;
    }

}

