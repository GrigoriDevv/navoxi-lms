package com.navoxi.lms.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class S3Properties {

  private final boolean enabled;
  private final String endpoint;
  private final String region;
  private final String bucket;
  private final String accessKey;
  private final String secretKey;
  private final String publicBaseUrl;
  private final long maxFileBytes;
  private final int presignTtlSeconds;

  public S3Properties(
      @Value("${lms.s3.enabled:false}") boolean enabled,
      @Value("${lms.s3.endpoint:}") String endpoint,
      @Value("${lms.s3.region:us-east-1}") String region,
      @Value("${lms.s3.bucket:}") String bucket,
      @Value("${lms.s3.access-key:}") String accessKey,
      @Value("${lms.s3.secret-key:}") String secretKey,
      @Value("${lms.s3.public-base-url:}") String publicBaseUrl,
      @Value("${lms.s3.max-file-bytes:104857600}") long maxFileBytes,
      @Value("${lms.s3.presign-ttl-seconds:3600}") int presignTtlSeconds) {
    this.enabled = enabled;
    this.endpoint = endpoint == null ? "" : endpoint.trim();
    this.region = region == null || region.isBlank() ? "us-east-1" : region.trim();
    this.bucket = bucket == null ? "" : bucket.trim();
    this.accessKey = accessKey == null ? "" : accessKey.trim();
    this.secretKey = secretKey == null ? "" : secretKey.trim();
    this.publicBaseUrl = publicBaseUrl == null ? "" : publicBaseUrl.trim().replaceAll("/$", "");
    this.maxFileBytes = maxFileBytes;
    this.presignTtlSeconds = presignTtlSeconds;
  }

  public boolean isEnabled() {
    return enabled;
  }

  public String getEndpoint() {
    return endpoint;
  }

  public String getRegion() {
    return region;
  }

  public String getBucket() {
    return bucket;
  }

  public String getAccessKey() {
    return accessKey;
  }

  public String getSecretKey() {
    return secretKey;
  }

  public String getPublicBaseUrl() {
    return publicBaseUrl;
  }

  public long getMaxFileBytes() {
    return maxFileBytes;
  }

  public int getPresignTtlSeconds() {
    return presignTtlSeconds;
  }
}
