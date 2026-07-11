package com.example.adminbackend.security;

import java.util.Map;

public record SupabaseClaims(
        String userId,
        String email,
        String role,
        Map<String, Object> raw
) {
}

