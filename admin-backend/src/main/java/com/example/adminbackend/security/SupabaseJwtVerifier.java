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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class SupabaseJwtVerifier {

    private static final Logger logger = LoggerFactory.getLogger(SupabaseJwtVerifier.class);

    private final RemoteJWKSet<SecurityContext> jwkSource;
    private final String jwtSecret;
    private final String issuer;
    private final String audience;

    public SupabaseJwtVerifier(
            @Value("${supabase.jwks-url}") String jwksUrl,
            @Value("${supabase.jwt-secret:}") String jwtSecret,
            @Value("${supabase.jwt-issuer}") String issuer,
            @Value("${supabase.jwt-audience:authenticated}") String audience
    ) throws Exception {
        this.jwkSource = new RemoteJWKSet<>(new URL(jwksUrl));
        this.jwtSecret = jwtSecret;
        this.issuer = issuer;
        this.audience = audience;
        logger.info("SupabaseJwtVerifier initialized (issuer set: {}, jwtSecret configured: {})",
                issuer != null && !issuer.isBlank(), !jwtSecret.isBlank());
    }

    public SupabaseClaims verifyAndExtract(String token) throws Exception {
        // 1. THÊM MỚI: Xử lý trường hợp token chứa tiền tố Bearer từ HTTP Header
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        SignedJWT jwt = SignedJWT.parse(token);
        JWTClaimsSet claimsSet = jwt.getJWTClaimsSet();

        // 2. THÊM MỚI: Kiểm tra Token đã hết hạn chưa (Rất quan trọng)
        Date expirationTime = claimsSet.getExpirationTime();
        if (expirationTime != null && new Date().after(expirationTime)) {
            logger.warn("Token is expired. Expiration time was: {}", expirationTime);
            throw new SecurityException("Token is expired");
        }

        // Issuer must always be present and match — don't skip the check just
        // because the token happens to omit the claim.
        if (issuer == null || issuer.isBlank() || !issuer.equals(claimsSet.getIssuer())) {
            logger.warn("Issuer mismatch or missing. Expected: {}", issuer);
            throw new SecurityException("Invalid issuer");
        }

        // Audience must match too — without this check, a token minted for a
        // different Supabase-backed app (or a different purpose) would still verify.
        List<String> audiences = claimsSet.getAudience();
        if (audience != null && !audience.isBlank()
                && (audiences == null || !audiences.contains(audience))) {
            logger.warn("Audience mismatch. Expected: {}", audience);
            throw new SecurityException("Invalid audience");
        }

        // not-before check
        Date notBefore = claimsSet.getNotBeforeTime();
        if (notBefore != null && new Date().before(notBefore)) {
            throw new SecurityException("Token not yet valid");
        }

        JWSHeader header = jwt.getHeader();
        JWSAlgorithm alg = header.getAlgorithm();
        boolean verified = false;

        logger.debug("Token algorithm: {}, Key ID: {}", alg, header.getKeyID());

        if (JWSAlgorithm.Family.HMAC_SHA.contains(alg)) {
            if (jwtSecret == null || jwtSecret.isBlank()) {
                throw new SecurityException("HMAC token received but supabase.jwt-secret is not configured");
            }
            
            logger.debug("Using HMAC verification for algorithm: {}", alg);
            
            byte[] secretBytes = jwtSecret.trim().getBytes(StandardCharsets.UTF_8);
            logger.debug("JWT secret used as plain UTF-8 bytes");

            MACVerifier verifier = new MACVerifier(secretBytes);
            verified = jwt.verify(verifier);
            logger.debug("HMAC verification result: {}", verified);
        } else if (JWSAlgorithm.Family.SIGNATURE.contains(alg)) {
            logger.debug("Using RSA/asymmetric verification for algorithm: {}", alg);
            RSAKey rsaKey = null;
            
            try {
                String keyId = header.getKeyID();
                logger.debug("Looking for key with ID: {}", keyId);
                
                List<JWK> matches = jwkSource.get(
                        new JWKSelector(new JWKMatcher.Builder()
                                .keyType(KeyType.RSA)
                                .keyID(keyId)
                                .build()),
                        null
                );

                if (keyId == null || keyId.isBlank()) {
                    // Refuse to guess a key when the token doesn't say which one it used.
                    throw new SecurityException("Token is missing a key ID (kid)");
                }

                if (matches != null && !matches.isEmpty()) {
                    JWK jwk = matches.get(0);
                    if (jwk instanceof RSAKey k) {
                        rsaKey = k;
                    }
                }

                if (rsaKey == null) {
                    // Deliberately do NOT fall back to "any available key" here — doing
                    // so would let a token signed with the wrong key still verify.
                    logger.warn("No matching RSA key found in JWKS for keyID: {}", keyId);
                    throw new SecurityException("Unable to resolve signing key from JWKS");
                }

                RSASSAVerifier verifier = new RSASSAVerifier(rsaKey.toRSAPublicKey());
                verified = jwt.verify(verifier);
                logger.debug("RSA verification result: {}", verified);
                
            } catch (SecurityException se) {
                throw se;
            } catch (Exception e) {
                logger.error("Error during RSA key verification: {}", e.getMessage(), e);
                throw new SecurityException("Error verifying token: " + e.getMessage(), e);
            }
        } else {
            throw new SecurityException("Unsupported JWT algorithm: " + alg.getName());
        }

        if (!verified) {
            logger.error("Token signature verification failed");
            throw new SecurityException("Invalid token signature");
        }

        logger.debug("Token verified successfully");

        String userId = claimsSet.getSubject();
        String email = claimsSet.getStringClaim("email");

        // Trích xuất Role của Supabase: ưu tiên app_metadata.role
        String role = null;
        Object appMetadataObj = claimsSet.getClaim("app_metadata");
        if (appMetadataObj instanceof Map<?, ?> meta) {
            Object roleObj = meta.get("role");
            if (roleObj != null) role = roleObj.toString();
        }

        // Fallback nếu token không có app_metadata.role
        if (role == null) {
            role = claimsSet.getStringClaim("user_role");
        }


        Map<String, Object> raw = new HashMap<>(claimsSet.getClaims());

        return new SupabaseClaims(userId, email, role, raw);
    }
}