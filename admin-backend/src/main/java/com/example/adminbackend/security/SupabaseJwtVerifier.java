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

    public SupabaseJwtVerifier(
            @Value("${supabase.jwks-url}") String jwksUrl,
            @Value("${supabase.jwt-secret:}") String jwtSecret,
            @Value("${supabase.jwt-issuer}") String issuer
    ) throws Exception {
        this.jwkSource = new RemoteJWKSet<>(new URL(jwksUrl));
        this.jwtSecret = jwtSecret;
        this.issuer = issuer;
        logger.info("SupabaseJwtVerifier initialized with issuer: {}, jwtSecret configured: {}", 
            issuer, !jwtSecret.isBlank());
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

        // Basic issuer check
        if (claimsSet.getIssuer() != null && issuer != null && !issuer.isBlank()) {
            if (!issuer.equals(claimsSet.getIssuer())) {
                logger.warn("Issuer mismatch. Expected: {}, Got: {}", issuer, claimsSet.getIssuer());
                throw new SecurityException("Invalid issuer");
            }
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

                if (matches != null && !matches.isEmpty()) {
                    logger.debug("Found {} matching keys in JWKS", matches.size());
                    JWK jwk = matches.get(0);
                    if (jwk instanceof RSAKey k) {
                        rsaKey = k;
                        logger.debug("Successfully extracted RSA key");
                    }
                } else {
                    logger.warn("No matching RSA key found in JWKS for keyID: {}", keyId);
                    try {
                        List<JWK> allKeys = jwkSource.get(
                                new JWKSelector(new JWKMatcher.Builder().keyType(KeyType.RSA).build()),
                                null
                        );
                        if (allKeys != null && !allKeys.isEmpty()) {
                            logger.info("Available RSA keys in JWKS: {}", allKeys.size());
                            JWK jwk = allKeys.get(0);
                            if (jwk instanceof RSAKey k) {
                                rsaKey = k;
                                logger.warn("Using fallback RSA key (first available)");
                            }
                        }
                    } catch (Exception e) {
                        logger.error("Error fetching all JWKS keys: {}", e.getMessage());
                    }
                }

                if (rsaKey == null) {
                    logger.error("Unable to resolve signing key from JWKS. KeyID: {}", header.getKeyID());
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

        // Trích xuất Role của Supabase
        String role = claimsSet.getStringClaim("role"); // Thường Supabase sẽ để role ở root claim
        
        if (role == null) {
            Object appMetadataObj = claimsSet.getClaim("app_metadata");
            if (appMetadataObj instanceof Map<?, ?> meta) {
                Object roleObj = meta.get("role");
                if (roleObj != null) role = roleObj.toString();
            }
        }
        
        if (role == null) {
            role = claimsSet.getStringClaim("user_role");
        }

        logger.debug("Extracted claims - UserId: {}, Email: {}, Role: {}", userId, email, role);

        Map<String, Object> raw = new HashMap<>(claimsSet.getClaims());

        return new SupabaseClaims(userId, email, role, raw);
    }
}