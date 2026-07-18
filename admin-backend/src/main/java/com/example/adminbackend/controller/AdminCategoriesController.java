package com.example.adminbackend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/categories")
public class AdminCategoriesController {

    private final JdbcTemplate jdbcTemplate;

    public AdminCategoriesController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public ResponseEntity<?> getCategories() {
        try {
            List<Map<String, Object>> categories = jdbcTemplate.queryForList(
                    "select * from categories order by sort_order asc, name asc"
            );
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody Map<String, Object> body) {
        try {
            String idStr = body.get("id") != null ? body.get("id").toString() : null;
            UUID id = idStr != null ? UUID.fromString(idStr) : UUID.randomUUID();
            
            Integer sortOrder = body.get("sort_order") != null ? ((Number) body.get("sort_order")).intValue() : 0;
            Boolean isActive = body.get("is_active") != null ? (Boolean) body.get("is_active") : true;
            String parentIdStr = body.get("parent_id") != null ? body.get("parent_id").toString() : null;
            UUID parentId = parentIdStr != null ? UUID.fromString(parentIdStr) : null;

            jdbcTemplate.update(
                    "insert into categories (id, name, slug, description, image_url, sort_order, is_active, parent_id) " +
                            "values (?, ?, ?, ?, ?, ?, ?, ?)",
                    id,
                    body.get("name"),
                    body.get("slug"),
                    body.get("description"),
                    body.get("image_url"),
                    sortOrder,
                    isActive,
                    parentId
            );
            return ResponseEntity.ok(Map.of("success", true, "id", id.toString()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping
    public ResponseEntity<?> updateCategory(@RequestBody Map<String, Object> body) {
        try {
            Object idObj = body.get("id");
            if (idObj == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Category ID is required for update"));
            }
            UUID id = UUID.fromString(idObj.toString());
            
            Integer sortOrder = body.get("sort_order") != null ? ((Number) body.get("sort_order")).intValue() : 0;
            Boolean isActive = body.get("is_active") != null ? (Boolean) body.get("is_active") : true;
            String parentIdStr = body.get("parent_id") != null ? body.get("parent_id").toString() : null;
            UUID parentId = parentIdStr != null ? UUID.fromString(parentIdStr) : null;

            jdbcTemplate.update(
                    "update categories set name=?, slug=?, description=?, image_url=?, sort_order=?, is_active=?, parent_id=? where id=?",
                    body.get("name"),
                    body.get("slug"),
                    body.get("description"),
                    body.get("image_url"),
                    sortOrder,
                    isActive,
                    parentId,
                    id
            );
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping
    public ResponseEntity<?> deleteCategory(@RequestParam("id") String idStr) {
        try {
            UUID id = UUID.fromString(idStr);
            jdbcTemplate.update("delete from categories where id=?", id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
