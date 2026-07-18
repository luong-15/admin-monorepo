package com.example.adminbackend.security;

import com.example.adminbackend.repo.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class SupabaseJwtAuthFilter extends OncePerRequestFilter {

    private final SupabaseJwtVerifier verifier;
    private final UserRepository userRepository;

    public SupabaseJwtAuthFilter(SupabaseJwtVerifier verifier, UserRepository userRepository) {
        this.verifier = verifier;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        if (!path.startsWith("/api/admin/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"Missing or invalid Authorization header\"}");
            response.setContentType("application/json");
            return;
        }

        String token = authHeader.substring("Bearer ".length()).trim();
        try {
            SupabaseClaims claims = verifier.verifyAndExtract(token);

            // Check role from app_metadata
            String claimRole = claims.role();

            // Check role from DB as well (per requirement C)
            String dbRole = null;
            if (claims.userId() != null) {
                dbRole = userRepository.findRoleByUserId(claims.userId());
            }

            boolean isAdmin = "admin".equalsIgnoreCase(claimRole) || "admin".equalsIgnoreCase(dbRole);
            if (!isAdmin) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.getWriter().write("{\"error\":\"User does not have admin role\"}");
                response.setContentType("application/json");
                return;
            }

            SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken(
                            claims.userId(),
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
                    )
            );

            filterChain.doFilter(request, response);
        } catch (SecurityException se) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"" + se.getMessage() + "\"}");
            return;
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Token verification failed: " + e.getMessage() + "\"}");
            return;
        }

    }
}

