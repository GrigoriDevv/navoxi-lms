package com.navoxi.lms.config;

import java.net.URI;
import java.net.URISyntaxException;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Converte DATABASE_URL no formato Railway (postgresql://...) para JDBC.
 */
@Configuration
@Profile("prod")
public class RailwayDataSourceConfig {

  @Bean
  @ConditionalOnProperty(name = "DATABASE_URL")
  public DataSource dataSource(
      @Value("${DATABASE_URL}") String databaseUrl,
      @Value("${DATABASE_USERNAME:}") String usernameOverride,
      @Value("${DATABASE_PASSWORD:}") String passwordOverride)
      throws URISyntaxException {
    String jdbcUrl = databaseUrl;
    String username = usernameOverride;
    String password = passwordOverride;

    if (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://")) {
      URI uri = new URI(databaseUrl.replace("postgres://", "postgresql://"));
      String userInfo = uri.getUserInfo();
      if (userInfo != null) {
        String[] parts = userInfo.split(":", 2);
        if (username == null || username.isBlank()) {
          username = parts[0];
        }
        if ((password == null || password.isBlank()) && parts.length > 1) {
          password = parts[1];
        }
      }
      jdbcUrl =
          "jdbc:postgresql://"
              + uri.getHost()
              + (uri.getPort() > 0 ? ":" + uri.getPort() : "")
              + uri.getPath()
              + (uri.getQuery() != null ? "?" + uri.getQuery() : "");
    }

    return DataSourceBuilder.create()
        .driverClassName("org.postgresql.Driver")
        .url(jdbcUrl)
        .username(username)
        .password(password)
        .build();
  }
}
