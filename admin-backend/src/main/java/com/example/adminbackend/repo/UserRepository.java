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
            return jdbcTemplate.queryForObject(
                    "select role from users where id = ? limit 1",
                    new Object[]{userId},
                    String.class
            );
        } catch (Exception e) {
            return null;
        }
    }
}

