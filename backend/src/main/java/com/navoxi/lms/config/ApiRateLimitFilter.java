package com.navoxi.lms.config;

import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.web.ApiExceptionHandler.TooManyRequestsException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Locale;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Rate limit para mutações /api/v1 e GET export do titular. Auth/login permanece no {@link
 * LoginRateLimiter}.
 */
@Component
public class ApiRateLimitFilter extends OncePerRequestFilter {

  private static final Set<String> MUTATING =
      Set.of("POST", "PUT", "PATCH", "DELETE");

  private final ApiRateLimiter rateLimiter;

  public ApiRateLimitFilter(ApiRateLimiter rateLimiter) {
    this.rateLimiter = rateLimiter;
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    if (!rateLimiter.isEnabled()) {
      return true;
    }
    if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
      return true;
    }
    String path = request.getRequestURI();
    if (ApiTokenFilter.isPublicPath(path) || ApiTokenFilter.isAuthPath(path)) {
      return true;
    }
    if (!path.startsWith("/api/v1/")) {
      return true;
    }
    String method = request.getMethod() == null ? "" : request.getMethod().toUpperCase(Locale.ROOT);
    if (MUTATING.contains(method)) {
      return false;
    }
    return !isExportGet(method, path);
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    try {
      rateLimiter.check(clientIp(request), authenticatedUserId());
      filterChain.doFilter(request, response);
    } catch (TooManyRequestsException ex) {
      response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
      response.setHeader("Retry-After", String.valueOf(rateLimiter.windowSeconds()));
      response.setContentType(MediaType.APPLICATION_JSON_VALUE);
      response.getWriter().write("{\"error\":\"" + escapeJson(ex.getMessage()) + "\"}");
    }
  }

  private static boolean isExportGet(String method, String path) {
    return "GET".equals(method) && path.equals("/api/v1/users/me/export");
  }

  private static String authenticatedUserId() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !(auth.getPrincipal() instanceof UserAccount user)) {
      return null;
    }
    return user.getId();
  }

  static String clientIp(HttpServletRequest request) {
    String forwarded = request.getHeader("X-Forwarded-For");
    if (forwarded != null && !forwarded.isBlank()) {
      return forwarded.split(",")[0].trim();
    }
    String remote = request.getRemoteAddr();
    return remote == null ? "unknown" : remote;
  }

  private static String escapeJson(String message) {
    if (message == null) {
      return "";
    }
    return message.replace("\\", "\\\\").replace("\"", "\\\"");
  }
}
