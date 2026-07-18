package com.example.adminbackend.repo;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class UserRepository {

    private final JdbcTemplate jdbcTemplate;

    public UserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public String findRoleByUserId(String userId) {
        try {
            // In Supabase, the role is stored in raw_app_meta_data ->> 'role' in auth.users
            return jdbcTemplate.queryForObject(
                    "select (raw_app_meta_data ->> 'role') from auth.users where id = cast(? as uuid) limit 1",
                    new Object[]{userId},
                    String.class
            );
        } catch (Exception e) {
            return null;
        }
    }
}

