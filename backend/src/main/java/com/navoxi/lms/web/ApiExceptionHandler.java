package com.navoxi.lms.web;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

  @ExceptionHandler(NotFoundException.class)
  public ResponseEntity<Map<String, String>> notFound(NotFoundException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
  }

  @ExceptionHandler(BadRequestException.class)
  public ResponseEntity<Map<String, String>> badRequest(BadRequestException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", ex.getMessage()));
  }

  @ExceptionHandler(UnauthorizedException.class)
  public ResponseEntity<Map<String, String>> unauthorized(UnauthorizedException ex) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", ex.getMessage()));
  }

  @ExceptionHandler(ForbiddenException.class)
  public ResponseEntity<Map<String, String>> forbidden(ForbiddenException ex) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", ex.getMessage()));
  }

  @ExceptionHandler(TooManyRequestsException.class)
  public ResponseEntity<Map<String, String>> tooManyRequests(TooManyRequestsException ex) {
    return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
        .body(Map.of("error", ex.getMessage()));
  }

  @ExceptionHandler(ServiceUnavailableException.class)
  public ResponseEntity<Map<String, String>> unavailable(ServiceUnavailableException ex) {
    return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
        .body(Map.of("error", ex.getMessage()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, String>> validation(MethodArgumentNotValidException ex) {
    String msg =
        ex.getBindingResult().getFieldErrors().stream()
            .findFirst()
            .map(f -> f.getField() + ": " + f.getDefaultMessage())
            .orElse("Dados inválidos");
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", msg));
  }

  public static class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
      super(message);
    }
  }

  public static class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
      super(message);
    }
  }

  public static class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
      super(message);
    }
  }

  public static class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
      super(message);
    }
  }

  public static class TooManyRequestsException extends RuntimeException {
    public TooManyRequestsException(String message) {
      super(message);
    }
  }

  public static class ServiceUnavailableException extends RuntimeException {
    public ServiceUnavailableException(String message) {
      super(message);
    }
  }
}
