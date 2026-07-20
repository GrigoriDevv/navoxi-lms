package com.navoxi.lms.config;

import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.domain.enums.UserStatus;
import com.navoxi.lms.repository.UserAccountRepository;
import com.navoxi.lms.security.JwtService;
import com.navoxi.lms.security.JwtService.InvalidJwtException;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Autentica rotas de dados com JWT de usuário emitido no login (sem X-User-Email).
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

  private final JwtService jwtService;
  private final UserAccountRepository users;

  public JwtAuthFilter(JwtService jwtService, UserAccountRepository users) {
    this.jwtService = jwtService;
    this.users = users;
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
      return true;
    }
    String path = request.getRequestURI();
    return ApiTokenFilter.isPublicPath(path) || ApiTokenFilter.isAuthPath(path);
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    String header = request.getHeader("Authorization");
    if (header == null || !header.regionMatches(true, 0, "Bearer ", 0, 7)) {
      unauthorized(response, "Token JWT ausente");
      return;
    }

    String token = header.substring(7).trim();
    try {
      Claims claims = jwtService.parse(token);
      String email = jwtService.emailFrom(claims);
      UserAccount user = users.findByEmailIgnoreCase(email).orElse(null);
      if (user == null) {
        unauthorized(response, "Usuário não encontrado");
        return;
      }
      if (user.getStatus() != UserStatus.ativo) {
        unauthorized(response, "Usuário inativo");
        return;
      }

      var authorities =
          List.of(
              new SimpleGrantedAuthority("ROLE_API"),
              new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
      SecurityContextHolder.getContext()
          .setAuthentication(new UsernamePasswordAuthenticationToken(user, null, authorities));
      filterChain.doFilter(request, response);
    } catch (InvalidJwtException ex) {
      unauthorized(response, "Token JWT inválido ou expirado");
    }
  }

  private static void unauthorized(HttpServletResponse response, String message) throws IOException {
    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    response.getWriter().write("{\"error\":\"" + message + "\"}");
  }
}
