package com.example.adminbackend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/products")
public class AdminProductsController {

    private final JdbcTemplate jdbcTemplate;

    public AdminProductsController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // Minimal DTO to match FE shape: { data, pagination }
    @GetMapping
    public ResponseEntity<?> getProducts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, name = "category_id") String categoryId
    ) {

        int offset = Math.max(0, (page - 1) * limit);

        String whereSql = " where 1=1 ";
        java.util.List<Object> params = new java.util.ArrayList<>();

        if (search != null && !search.isBlank()) {
            whereSql += " and (lower(name) like lower(?) or lower(brand) like lower(?)) ";
            String q = "%" + search.trim() + "%";
            params.add(q);
            params.add(q);
        }

        if (categoryId != null && !categoryId.isBlank()) {
            whereSql += " and category_id = ? ";
            params.add(categoryId.trim());
        }

        // Total count
        long total = 0;
        try {
            total = jdbcTemplate.queryForObject(
                    "select count(*) from products " + whereSql,
                    params.toArray(),
                    Long.class
            );
        } catch (Exception ignored) {
            total = 0;
        }

        int totalPages = (int) Math.ceil(total / (double) limit);
        if (totalPages < 0) totalPages = 0;

        // Fetch data
        String sql = "select * from products " + whereSql + " order by id desc limit ? offset ?";
        java.util.List<Map<String, Object>> rows;
        try {
            java.util.List<Object> dataParams = new java.util.ArrayList<>(params);
            dataParams.add(limit);
            dataParams.add(offset);
            rows = jdbcTemplate.queryForList(sql, dataParams.toArray());
        } catch (Exception ignored) {
            rows = java.util.List.of();
        }

        return ResponseEntity.ok(Map.of(
                "data", rows,
                "pagination", Map.of(
                        "page", page,
                        "limit", limit,
                        "total", total,
                        "totalPages", totalPages
                )
        ));
    }

    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody Map<String, Object> body) {
        // Best-effort JDBC implementation (schema may vary).
        // If columns are missing in your DB, this will throw and should be adjusted.
        try {
            jdbcTemplate.update(
                    "insert into products (name, description, price, original_price, discount_price, stock, brand, category_id, image_url, images, is_featured, is_deal, specs) " +
                            "values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    body.get("name"),
                    body.get("description"),
                    body.get("price"),
                    body.get("original_price"),
                    body.get("discount_price"),
                    body.get("stock"),
                    body.get("brand"),
                    body.get("category_id"),
                    body.get("image_url"),
                    body.get("images"),
                    body.get("is_featured"),
                    body.get("is_deal"),
                    body.get("specs")
            );
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping
    public ResponseEntity<?> updateProduct(@RequestBody Map<String, Object> body) {
        try {
            Object id = body.get("id");
            jdbcTemplate.update(
                    "update products set name=?, description=?, price=?, original_price=?, discount_price=?, stock=?, brand=?, category_id=?, image_url=?, images=?, is_featured=?, is_deal=?, specs=? where id=?",
                    body.get("name"),
                    body.get("description"),
                    body.get("price"),
                    body.get("original_price"),
                    body.get("discount_price"),
                    body.get("stock"),
                    body.get("brand"),
                    body.get("category_id"),
                    body.get("image_url"),
                    body.get("images"),
                    body.get("is_featured"),
                    body.get("is_deal"),
                    body.get("specs"),
                    id
            );
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping
    public ResponseEntity<?> deleteProduct(@RequestParam String id) {
        try {
            jdbcTemplate.update("delete from products where id=?", id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

}

