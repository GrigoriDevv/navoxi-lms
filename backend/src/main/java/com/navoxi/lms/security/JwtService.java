package com.navoxi.lms.security;

import com.navoxi.lms.domain.entity.UserAccount;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

  private final SecretKey key;
  private final long ttlSeconds;

  public JwtService(
      @Value("${lms.jwt.secret}") String secret,
      @Value("${lms.jwt.ttl-seconds:604800}") long ttlSeconds) {
    byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
    if (bytes.length < 32) {
      // HS256 requires sufficient key material; pad deterministically for short local secrets
      byte[] padded = new byte[32];
      System.arraycopy(bytes, 0, padded, 0, Math.min(bytes.length, 32));
      for (int i = bytes.length; i < 32; i++) {
        padded[i] = (byte) i;
      }
      bytes = padded;
    }
    this.key = Keys.hmacShaKeyFor(bytes);
    this.ttlSeconds = ttlSeconds;
  }

  public String issue(UserAccount user) {
    Instant now = Instant.now();
    Instant exp = now.plusSeconds(ttlSeconds);
    return Jwts.builder()
        .subject(user.getId())
        .claim("email", user.getEmail())
        .claim("role", user.getRole().name())
        .claim("unitId", user.getUnitId().name())
        .issuedAt(Date.from(now))
        .expiration(Date.from(exp))
        .signWith(key)
        .compact();
  }

  public Claims parse(String token) {
    try {
      return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    } catch (JwtException | IllegalArgumentException ex) {
      throw new InvalidJwtException("Token JWT inválido ou expirado", ex);
    }
  }

  public String emailFrom(Claims claims) {
    Object email = claims.get("email");
    if (email == null || email.toString().isBlank()) {
      throw new InvalidJwtException("JWT sem claim email");
    }
    return email.toString().trim().toLowerCase();
  }

  public static class InvalidJwtException extends RuntimeException {
    public InvalidJwtException(String message) {
      super(message);
    }

    public InvalidJwtException(String message, Throwable cause) {
      super(message, cause);
    }
  }
}
