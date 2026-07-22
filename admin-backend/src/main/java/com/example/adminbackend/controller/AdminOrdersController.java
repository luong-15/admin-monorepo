package com.example.adminbackend.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrdersController {

    private static final Logger log = LoggerFactory.getLogger(AdminOrdersController.class);

    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    public AdminOrdersController(org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public ResponseEntity<?> getOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status
    ) {
        // JDBC implementation (best-effort). FE expects { data, pagination }
        page = Math.max(1, page);
        limit = Math.min(Math.max(1, limit), 200); // clamp: no unbounded/huge page sizes
        int offset = Math.max(0, (page - 1) * limit);

        String whereSql = " where 1=1 ";
        java.util.List<Object> params = new java.util.ArrayList<>();

        if (search != null && !search.isBlank()) {
            whereSql += " and (cast(order_number as text) like ? or lower(shipping_name) like lower(?)) ";
            String q = "%" + search.trim() + "%";
            params.add(q);
            params.add(q);
        }

        if (status != null && !status.isBlank() && !"all".equalsIgnoreCase(status)) {
            whereSql += " and status = ? ";
            params.add(status.trim());
        }

        long total = 0;
        try {
            total = jdbcTemplate.queryForObject(
                    "select count(*) from orders " + whereSql,
                    params.toArray(),
                    Long.class
            );
        } catch (Exception ignored) {
            total = 0;
        }

        int totalPages = (int) Math.ceil(total / (double) limit);
        if (totalPages < 0) totalPages = 0;

        String sql = "select * from orders " + whereSql + " order by created_at desc limit ? offset ?";
        java.util.List<Map<String, Object>> rows;
        try {
            java.util.List<Object> dataParams = new java.util.ArrayList<>(params);
            dataParams.add(limit);
            dataParams.add(offset);
            rows = jdbcTemplate.queryForList(sql, dataParams.toArray());
        } catch (Exception ignored) {
            rows = java.util.List.of();
        }

        // FE expects order_items details only when fetching /{id}
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

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderDetails(@PathVariable("id") String id) {
        // Best-effort: returns order + its order_items + related products.
        try {
            Map<String, Object> order = jdbcTemplate.queryForMap("select * from orders where id=? limit 1", id);

            java.util.List<Map<String, Object>> items = jdbcTemplate.queryForList(
                    "select oi.*, p.image_url as product_image, p.name as product_name " +
                            "from order_items oi " +
                            "join products p on p.id = oi.product_id " +
                            "where oi.order_id = ? order by oi.id asc",
                    id
            );
            order.put("order_items", items);

            return ResponseEntity.ok(order);
        } catch (Exception e) {
            log.warn("Request failed", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Request failed"));
        }
    }

    // FE uses PATCH /api/admin/orders/{id}
    @PatchMapping("/{id}")
    public ResponseEntity<?> updateOrder(
            @PathVariable("id") String id,
            @RequestBody Map<String, Object> body
    ) {
        try {
            java.util.Set<String> validStatuses = java.util.Set.of(
                    "pending", "processing", "shipped", "delivered", "cancelled", "refunded");
            java.util.Set<String> validPaymentStatuses = java.util.Set.of(
                    "pending", "paid", "failed", "refunded");

            // Update only known fields if present
            String status = body.get("status") != null ? body.get("status").toString() : null;
            String paymentStatus = body.get("payment_status") != null ? body.get("payment_status").toString() : null;
            String adminNotes = body.get("admin_notes") != null ? body.get("admin_notes").toString() : null;

            if (status != null && !validStatuses.contains(status.toLowerCase())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid status value"));
            }
            if (paymentStatus != null && !validPaymentStatuses.contains(paymentStatus.toLowerCase())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid payment_status value"));
            }
            if (adminNotes != null && adminNotes.length() > 2000) {
                return ResponseEntity.badRequest().body(Map.of("error", "admin_notes is too long"));
            }

            if (status != null) {
                jdbcTemplate.update("update orders set status=? where id=?", status, id);
            }
            if (paymentStatus != null) {
                jdbcTemplate.update("update orders set payment_status=? where id=?", paymentStatus, id);
            }
            if (adminNotes != null) {
                jdbcTemplate.update("update orders set admin_notes=? where id=?", adminNotes, id);
            }

            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            log.warn("Request failed", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Request failed"));
        }
    }
}

