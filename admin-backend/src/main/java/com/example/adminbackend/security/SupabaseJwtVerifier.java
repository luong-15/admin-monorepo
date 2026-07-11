package com.example.adminbackend.security;

import com.nimbusds.jose.JWSHeader;
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
import java.util.HashMap;
import java.util.Map;



@Component
public class SupabaseJwtVerifier {

    private final RemoteJWKSet<SecurityContext> jwkSource;

    @Value("${supabase.jwks-url}")
    private String jwksUrl;

    @Value("${supabase.jwt-issuer}")
    private String issuer;

    public SupabaseJwtVerifier(@Value("${supabase.jwks-url}") String jwksUrl) throws Exception {
        this.jwksUrl = jwksUrl;
        this.jwkSource = new RemoteJWKSet<>(new URL(jwksUrl));
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
        RSAKey rsaKey = null;

        JWK jwk = jwkSource.get(new JWKSelector(new JWKMatcher.Builder()
                .keyType(KeyType.RSA)
                .keyID(header.getKeyID())
                .build()), null).get(0);

        if (jwk instanceof RSAKey k) {
            rsaKey = k;
        }

        if (rsaKey == null) {
            throw new SecurityException("Unable to resolve signing key from JWKS");
        }

        com.nimbusds.jose.crypto.RSASSAVerifier verifier = new com.nimbusds.jose.crypto.RSASSAVerifier(rsaKey.toRSAPublicKey());
        if (!jwt.verify(verifier)) {
            throw new SecurityException("Invalid token signature");
        }

        String userId = claimsSet.getSubject(); // Supabase uses sub as user id
        String email = claimsSet.getStringClaim("email");

        // Supabase role claim is often under app_metadata.role
        String role = null;
        Object appMetadataObj = claimsSet.getClaim("app_metadata");
        if (appMetadataObj instanceof Map<?, ?> meta) {
            Object roleObj = meta.get("role");
            if (roleObj != null) role = roleObj.toString();
        }

        Map<String, Object> raw = new HashMap<>();
        for (Map.Entry<String, Object> e : claimsSet.getClaims().entrySet()) {
            raw.put(e.getKey(), e.getValue());
        }

        return new SupabaseClaims(userId, email, role, raw);
    }
}

