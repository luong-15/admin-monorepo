package com.example.adminbackend.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.HttpRequestMethodNotSupportedException;

import jakarta.servlet.http.HttpServletRequest;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNoHandlerFound(
            NoHandlerFoundException ex,
            HttpServletRequest request
    ) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        log.warn("404 No handler: method={} path={} uri={} status={} exception={}",
                method, path, ex.getRequestURL(), HttpStatus.NOT_FOUND.value(), ex.toString());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", "NOT_FOUND");
        body.put("message", "No endpoint matches the requested path");
        body.put("path", path);
        body.put("method", method);
        body.put("timestamp", Instant.now().toString());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException ex,
            HttpServletRequest request
    ) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        log.warn("405 Method not supported: method={} path={} supported={} exception={}",
                method, path, ex.getSupportedHttpMethods(), ex.toString());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", "METHOD_NOT_ALLOWED");
        body.put("message", "HTTP method is not supported for this endpoint");
        body.put("path", path);
        body.put("method", method);
        body.put("supportedMethods", ex.getSupportedHttpMethods());
        body.put("timestamp", Instant.now().toString());
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(body);
    }

    // Safety net: anything not caught by a controller's own try/catch still
    // gets logged with full detail server-side, but the client only ever sees
    // a generic message — never a raw exception/stack trace.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleUnexpected(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception on {} {}", request.getMethod(), request.getRequestURI(), ex);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", "INTERNAL_ERROR");
        body.put("message", "Something went wrong. Please try again.");
        body.put("timestamp", Instant.now().toString());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}

