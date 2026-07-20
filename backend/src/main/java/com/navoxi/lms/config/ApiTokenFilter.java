package com.navoxi.lms.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Exige Authorization: Bearer &lt;LMS_API_TOKEN&gt; apenas em rotas /api/v1/auth/** (Next → Java).
 */
@Component
public class ApiTokenFilter extends OncePerRequestFilter {

  private final byte[] expectedToken;

  public ApiTokenFilter(@Value("${lms.api-token}") String apiToken) {
    this.expectedToken = apiToken.getBytes(StandardCharsets.UTF_8);
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
      return true;
    }
    String path = request.getRequestURI();
    return !isAuthPath(path);
  }

  static boolean isPublicPath(String path) {
    return path.equals("/api/v1/health")
        || path.startsWith("/actuator/health")
        || path.startsWith("/h2-console")
        || path.startsWith("/swagger-ui")
        || path.equals("/swagger-ui.html")
        || path.startsWith("/api-docs")
        || path.startsWith("/v3/api-docs");
  }

  static boolean isAuthPath(String path) {
    return path.startsWith("/api/v1/auth/");
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    String header = request.getHeader("Authorization");
    if (header == null || !header.regionMatches(true, 0, "Bearer ", 0, 7)) {
      unauthorized(response, "Token de API ausente");
      return;
    }
    byte[] provided = header.substring(7).trim().getBytes(StandardCharsets.UTF_8);
    if (!MessageDigest.isEqual(expectedToken, provided)) {
      unauthorized(response, "Token de API inválido");
      return;
    }

    SecurityContextHolder.getContext()
        .setAuthentication(
            new UsernamePasswordAuthenticationToken(
                "api", null, List.of(new SimpleGrantedAuthority("ROLE_API"))));
    filterChain.doFilter(request, response);
  }

  private static void unauthorized(HttpServletResponse response, String message) throws IOException {
    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    response.getWriter().write("{\"error\":\"" + message + "\"}");
  }
}
