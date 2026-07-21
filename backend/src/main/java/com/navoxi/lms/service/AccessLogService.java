package com.navoxi.lms.service;

import com.navoxi.lms.domain.entity.AccessLog;
import com.navoxi.lms.repository.AccessLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
public class AccessLogService {

  public static final String ACTION_AUTH_LOGIN = "auth.login";
  public static final String ACTION_AUTH_SSO = "auth.sso.microsoft";
  public static final String ACTION_USERS_ME = "users.me.read";
  public static final String ACTION_USERS_EXPORT = "users.me.export";
  public static final String ACTION_USERS_DELETE = "users.me.delete";

  private final AccessLogRepository logs;

  public AccessLogService(AccessLogRepository logs) {
    this.logs = logs;
  }

  @Transactional
  public void record(String userId, String action, String resource) {
    AccessLog entry = new AccessLog();
    entry.setUserId(userId);
    entry.setAction(action);
    entry.setResource(resource);
    applyRequestMeta(entry);
    logs.save(entry);
  }

  private static void applyRequestMeta(AccessLog entry) {
    ServletRequestAttributes attrs =
        (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
    if (attrs == null) {
      return;
    }
    HttpServletRequest request = attrs.getRequest();
    entry.setIpAddress(clientIp(request));
    String ua = request.getHeader("User-Agent");
    if (ua != null && ua.length() > 512) {
      ua = ua.substring(0, 512);
    }
    entry.setUserAgent(ua);
  }

  static String clientIp(HttpServletRequest request) {
    String forwarded = request.getHeader("X-Forwarded-For");
    if (forwarded != null && !forwarded.isBlank()) {
      return forwarded.split(",")[0].trim();
    }
    return request.getRemoteAddr();
  }
}
