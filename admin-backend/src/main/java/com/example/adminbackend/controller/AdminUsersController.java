package com.example.adminbackend.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUsersController {

    private static final Logger log = LoggerFactory.getLogger(AdminUsersController.class);

    private final JdbcTemplate jdbcTemplate;

    public AdminUsersController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public ResponseEntity<?> getUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(required = false) String search
    ) {
        try {
            page = Math.max(1, page);
            limit = Math.min(Math.max(1, limit), 200); // clamp: no unbounded/huge page sizes
            int offset = Math.max(0, (page - 1) * limit);
            String whereSql = " where 1=1 ";
            List<Object> params = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                whereSql += " and (lower(u.email) like lower(?) or lower(p.full_name) like lower(?) or lower(p.phone) like lower(?)) ";
                String q = "%" + search.trim() + "%";
                params.add(q);
                params.add(q);
                params.add(q);
            }

            long total = 0;
            try {
                total = jdbcTemplate.queryForObject(
                        "select count(*) from auth.users u left join public.user_profiles p on u.id = p.id " + whereSql,
                        params.toArray(),
                        Long.class
                );
            } catch (Exception ignored) {}

            int totalPages = (int) Math.ceil(total / (double) limit);
            if (totalPages < 0) totalPages = 0;

            String sql = "select u.id, u.email, (u.raw_app_meta_data ->> 'role') as role, " +
                    "p.full_name, p.phone, p.avatar_url, p.address, p.city, p.postal_code, p.country, " +
                    "u.created_at, u.updated_at " +
                    "from auth.users u " +
                    "left join public.user_profiles p on u.id = p.id " +
                    whereSql + " order by u.created_at desc limit ? offset ?";

            List<Object> dataParams = new ArrayList<>(params);
            dataParams.add(limit);
            dataParams.add(offset);

            List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, dataParams.toArray());

            return ResponseEntity.ok(Map.of(
                    "data", rows,
                    "pagination", Map.of(
                            "page", page,
                            "limit", limit,
                            "total", total,
                            "totalPages", totalPages
                    )
            ));
        } catch (Exception e) {
            log.warn("Request failed", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Request failed"));
        }
    }

    @PatchMapping
    public ResponseEntity<?> updateUser(@RequestBody Map<String, Object> body) {
        try {
            Object idObj = body.get("id");
            if (idObj == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User ID is required"));
            }
            UUID id;
            try {
                id = UUID.fromString(idObj.toString());
            } catch (IllegalArgumentException ex) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid user ID"));
            }

            // 1. Update email in auth.users if provided
            if (body.containsKey("email") && body.get("email") != null) {
                String email = body.get("email").toString().trim();
                if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Invalid email format"));
                }
                // Note: writing directly to auth.users bypasses Supabase's own email-change
                // flow (re-confirmation, etc). Prefer the Supabase Admin API for email changes
                // where possible; keep this only for trusted admin-initiated corrections.
                jdbcTemplate.update("update auth.users set email=? where id=?", email, id);
            }

            // 2. Upsert user profile details
            jdbcTemplate.update(
                    "insert into public.user_profiles (id, full_name, phone, avatar_url, address, city, postal_code, country, updated_at) " +
                            "values (?, ?, ?, ?, ?, ?, ?, ?, now()) " +
                            "on conflict (id) do update set " +
                            "  full_name = excluded.full_name, " +
                            "  phone = excluded.phone, " +
                            "  avatar_url = excluded.avatar_url, " +
                            "  address = excluded.address, " +
                            "  city = excluded.city, " +
                            "  postal_code = excluded.postal_code, " +
                            "  country = excluded.country, " +
                            "  updated_at = now()",
                    id,
                    body.get("full_name"),
                    body.get("phone"),
                    body.get("avatar_url"),
                    body.get("address"),
                    body.get("city"),
                    body.get("postal_code"),
                    body.get("country")
            );

            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            log.warn("Request failed", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Request failed"));
        }
    }

    @DeleteMapping
    public ResponseEntity<?> deleteUser(@RequestParam("id") String idStr) {
        try {
            UUID id;
            try {
                id = UUID.fromString(idStr);
            } catch (IllegalArgumentException ex) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid user ID"));
            }
            // Note: deleting directly from auth.users bypasses Supabase's Admin API, which
            // also cleans up sessions/identities. Prefer calling the Supabase Admin API
            // (DELETE /auth/v1/admin/users/{id}) with the service-role key instead of raw SQL
            // where you control that key.
            jdbcTemplate.update("delete from public.user_profiles where id=?", id);
            jdbcTemplate.update("delete from auth.users where id=?", id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            log.warn("Request failed", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Request failed"));
        }
    }
}
