package com.example.adminbackend.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/settings")
public class AdminSettingsController {

    private static final Logger log = LoggerFactory.getLogger(AdminSettingsController.class);

    private final JdbcTemplate jdbcTemplate;

    public AdminSettingsController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public ResponseEntity<?> getSettings() {
        try {
            Map<String, Object> settings;
            try {
                settings = jdbcTemplate.queryForMap("select * from settings limit 1");
            } catch (Exception e) {
                // If table is empty, insert default row
                String defaultId = "default";
                jdbcTemplate.update(
                        "insert into settings (id, store_name, store_description, email, phone, address, currency, timezone, maintenance_mode, auto_approve_orders, default_tax_rate, logo_url, favicon_url, created_at, updated_at) " +
                                "values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, now(), now())",
                        defaultId,
                        "TechNova Store",
                        "Modern Tech Store",
                        "contact@technova.com",
                        "",
                        "",
                        "VND",
                        "Asia/Ho_Chi_Minh",
                        false,
                        false,
                        BigDecimal.valueOf(10.0),
                        "",
                        ""
                );
                settings = jdbcTemplate.queryForMap("select * from settings limit 1");
            }
            return ResponseEntity.ok(settings);
        } catch (Exception e) {
            log.warn("Request failed", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Request failed"));
        }
    }

    @PostMapping
    public ResponseEntity<?> saveSettings(@RequestBody Map<String, Object> body) {
        try {
            // Find existing ID or fallback to "default"
            String id = "default";
            try {
                Map<String, Object> existing = jdbcTemplate.queryForMap("select id from settings limit 1");
                id = existing.get("id").toString();
            } catch (Exception ignored) {}

            BigDecimal taxRate;
            try {
                taxRate = body.get("default_tax_rate") != null
                        ? new BigDecimal(body.get("default_tax_rate").toString())
                        : BigDecimal.valueOf(10.0);
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "default_tax_rate must be a number"));
            }
            if (taxRate.signum() < 0 || taxRate.compareTo(BigDecimal.valueOf(100)) > 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "default_tax_rate must be between 0 and 100"));
            }

            Boolean maintenanceMode = body.get("maintenance_mode") != null 
                    ? (Boolean) body.get("maintenance_mode") 
                    : false;

            Boolean autoApproveOrders = body.get("auto_approve_orders") != null 
                    ? (Boolean) body.get("auto_approve_orders") 
                    : false;

            jdbcTemplate.update(
                    "update settings set store_name=?, store_description=?, email=?, phone=?, address=?, currency=?, timezone=?, maintenance_mode=?, auto_approve_orders=?, default_tax_rate=?, logo_url=?, favicon_url=?, updated_at=now() where id=?",
                    body.get("store_name"),
                    body.get("store_description"),
                    body.get("email"),
                    body.get("phone"),
                    body.get("address"),
                    body.get("currency"),
                    body.get("timezone"),
                    maintenanceMode,
                    autoApproveOrders,
                    taxRate,
                    body.get("logo_url"),
                    body.get("favicon_url"),
                    id
            );

            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            log.warn("Request failed", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Request failed"));
        }
    }
}
