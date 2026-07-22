package com.example.adminbackend.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/stats")
public class AdminStatsController {

    private static final Logger log = LoggerFactory.getLogger(AdminStatsController.class);

    private final JdbcTemplate jdbcTemplate;

    public AdminStatsController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public ResponseEntity<?> getStats() {
        try {
            long totalProducts = 0;
            try {
                totalProducts = jdbcTemplate.queryForObject("select count(*) from products", Long.class);
            } catch (Exception ignored) {}

            long totalOrders = 0;
            try {
                totalOrders = jdbcTemplate.queryForObject("select count(*) from orders", Long.class);
            } catch (Exception ignored) {}

            long totalUsers = 0;
            try {
                totalUsers = jdbcTemplate.queryForObject("select count(*) from auth.users", Long.class);
            } catch (Exception ignored) {}

            BigDecimal totalRevenue = BigDecimal.ZERO;
            try {
                // Sum the total for orders that have been paid (payment_status is 'paid')
                totalRevenue = jdbcTemplate.queryForObject(
                        "select coalesce(sum(total), 0) from orders where lower(payment_status) = 'paid'",
                        BigDecimal.class
                );
                if (totalRevenue == null) {
                    totalRevenue = BigDecimal.ZERO;
                }
            } catch (Exception ignored) {}

            return ResponseEntity.ok(Map.of(
                    "totalProducts", totalProducts,
                    "totalOrders", totalOrders,
                    "totalUsers", totalUsers,
                    "totalRevenue", totalRevenue
            ));
        } catch (Exception e) {
            log.warn("Request failed", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Request failed"));
        }
    }
}
