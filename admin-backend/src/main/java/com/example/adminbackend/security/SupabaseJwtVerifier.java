package com.example.adminbackend.security;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jose.crypto.RSASSAVerifier;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKMatcher;
import com.nimbusds.jose.jwk.JWKSelector;
import com.nimbusds.jose.jwk.KeyType;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URL;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Component
public class SupabaseJwtVerifier {

    private final RemoteJWKSet<SecurityContext> jwkSource;
    private final String jwtSecret;
    private final String issuer;

    public SupabaseJwtVerifier(
            @Value("${supabase.jwks-url}") String jwksUrl,
            @Value("${supabase.jwt-secret:}") String jwtSecret,
            @Value("${supabase.jwt-issuer}") String issuer
    ) throws Exception {
        this.jwkSource = new RemoteJWKSet<>(new URL(jwksUrl));
        this.jwtSecret = jwtSecret;
        this.issuer = issuer;
    }

    public SupabaseClaims verifyAndExtract(String token) throws Exception {
        SignedJWT jwt = SignedJWT.parse(token);

        // Basic issuer check first
        JWTClaimsSet claimsSet = jwt.getJWTClaimsSet();
        if (claimsSet.getIssuer() != null && issuer != null && !issuer.isBlank()) {
            if (!issuer.equals(claimsSet.getIssuer())) {
                throw new SecurityException("Invalid issuer");
            }
        }

        JWSHeader header = jwt.getHeader();
        JWSAlgorithm alg = header.getAlgorithm();
        boolean verified = false;

        if (JWSAlgorithm.Family.HMAC_SHA.contains(alg)) {
            // Symmetrically verify using MACVerifier (HS256 / HS384 / HS512)
            if (jwtSecret != null && !jwtSecret.isBlank()) {
                byte[] secretBytes;
                try {
                    // Try to decode as Base64 first
                    secretBytes = Base64.getDecoder().decode(jwtSecret.trim());
                } catch (IllegalArgumentException e) {
                    // Fallback to plain bytes
                    secretBytes = jwtSecret.getBytes();
                }
                MACVerifier verifier = new MACVerifier(secretBytes);
                verified = jwt.verify(verifier);
            } else {
                throw new SecurityException("HMAC token received but supabase.jwt-secret is not configured");
            }
        } else if (JWSAlgorithm.Family.SIGNATURE.contains(alg)) {
            // Asymmetrically verify using JWKS (RS256 etc.)
            RSAKey rsaKey = null;
            var matches = jwkSource.get(
                    new JWKSelector(new JWKMatcher.Builder()
                            .keyType(KeyType.RSA)
                            .keyID(header.getKeyID())
                            .build()),
                    null
            );

            if (matches != null && !matches.isEmpty()) {
                JWK jwk = matches.get(0);
                if (jwk instanceof RSAKey k) {
                    rsaKey = k;
                }
            }

            if (rsaKey == null) {
                throw new SecurityException("Unable to resolve signing key from JWKS");
            }

            RSASSAVerifier verifier = new RSASSAVerifier(rsaKey.toRSAPublicKey());
            verified = jwt.verify(verifier);
        }

        if (!verified) {
            throw new SecurityException("Invalid token signature");
        }

        String userId = claimsSet.getSubject(); // Supabase uses sub as user id
        String email = claimsSet.getStringClaim("email");

        // Supabase role claim - try multiple locations
        String role = null;
        
        // Try app_metadata.role first
        Object appMetadataObj = claimsSet.getClaim("app_metadata");
        if (appMetadataObj instanceof Map<?, ?> meta) {
            Object roleObj = meta.get("role");
            if (roleObj != null) role = roleObj.toString();
        }
        
        // Fallback to root level role claim if app_metadata doesn't have it
        if (role == null) {
            role = claimsSet.getStringClaim("role");
        }
        
        // Fallback to user_role if available
        if (role == null) {
            role = claimsSet.getStringClaim("user_role");
        }

        Map<String, Object> raw = new HashMap<>();
        for (Map.Entry<String, Object> e : claimsSet.getClaims().entrySet()) {
            raw.put(e.getKey(), e.getValue());
        }

        return new SupabaseClaims(userId, email, role, raw);
    }
}


