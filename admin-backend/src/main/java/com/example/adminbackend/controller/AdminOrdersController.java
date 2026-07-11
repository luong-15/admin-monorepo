package com.example.adminbackend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrdersController {

    @GetMapping
    public ResponseEntity<?> getOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status
    ) {
        // TODO: implement JDBC queries for orders + order_items
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

    // FE uses PATCH /api/admin/orders/{id}
    @PatchMapping("/{id}")
    public ResponseEntity<?> updateOrder(
            @PathVariable("id") String id,
            @RequestBody Map<String, Object> body
    ) {
        // TODO: implement update orders set status/payment_status/admin_notes
        return ResponseEntity.ok(Map.of("success", true));
    }
}

