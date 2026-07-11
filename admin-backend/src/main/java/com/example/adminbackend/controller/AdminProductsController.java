package com.example.adminbackend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/products")
public class AdminProductsController {

    // Minimal DTO to match FE shape: { data, pagination }
    @GetMapping
    public ResponseEntity<?> getProducts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, name = "category_id") String categoryId
    ) {
        // TODO: implement JDBC queries for products table
        return ResponseEntity.ok(Map.of(
                "data", List.of(),
                "pagination", Map.of(
                        "page", page,
                        "limit", limit,
                        "total", 0,
                        "totalPages", 0
                )
        ));
    }

    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody Map<String, Object> body) {
        // TODO: implement insert into products
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PutMapping
    public ResponseEntity<?> updateProduct(@RequestBody Map<String, Object> body) {
        // TODO: implement update into products
        return ResponseEntity.ok(Map.of("success", true));
    }

    @DeleteMapping
    public ResponseEntity<?> deleteProduct(@RequestParam String id) {
        // TODO: implement delete from products
        return ResponseEntity.ok(Map.of("success", true));
    }
}

