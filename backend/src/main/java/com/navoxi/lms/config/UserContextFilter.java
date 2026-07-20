package com.navoxi.lms.config;

import com.navoxi.lms.domain.entity.UserAccount;
import com.navoxi.lms.repository.UserAccountRepository;
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
 * Após validar o token de API, resolve X-User-Email e popula authorities com a role do usuário.
 */
@Component
public class UserContextFilter extends OncePerRequestFilter {

  private final UserAccountRepository users;

  public UserContextFilter(UserAccountRepository users) {
    this.users = users;
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    String path = request.getRequestURI();
    if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
      return true;
    }
    return ApiTokenFilter.isPublicPath(path) || ApiTokenFilter.isAuthPath(path);
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    String email = request.getHeader("X-User-Email");
    if (email == null || email.isBlank()) {
      unauthorized(response, "Header X-User-Email é obrigatório");
      return;
    }

    UserAccount user = users.findByEmailIgnoreCase(email.trim()).orElse(null);
    if (user == null) {
      unauthorized(response, "Usuário não encontrado");
      return;
    }

    var authorities =
        List.of(
            new SimpleGrantedAuthority("ROLE_API"),
            new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    var auth = new UsernamePasswordAuthenticationToken(user, null, authorities);
    SecurityContextHolder.getContext().setAuthentication(auth);
    filterChain.doFilter(request, response);
  }

  private static void unauthorized(HttpServletResponse response, String message) throws IOException {
    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    response.getWriter().write("{\"error\":\"" + message + "\"}");
  }
}
