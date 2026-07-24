package com.navoxi.lms.config;

import java.net.URI;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
@ConditionalOnProperty(name = "lms.s3.enabled", havingValue = "true")
public class S3Config {

  @Bean(destroyMethod = "close")
  S3Client s3Client(S3Properties props) {
    var builder =
        S3Client.builder()
            .region(Region.of(props.getRegion()))
            .credentialsProvider(
                StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(props.getAccessKey(), props.getSecretKey())));
    if (!props.getEndpoint().isBlank()) {
      builder
          .endpointOverride(URI.create(props.getEndpoint()))
          .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build());
    }
    return builder.build();
  }

  @Bean(destroyMethod = "close")
  S3Presigner s3Presigner(S3Properties props) {
    var builder =
        S3Presigner.builder()
            .region(Region.of(props.getRegion()))
            .credentialsProvider(
                StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(props.getAccessKey(), props.getSecretKey())));
    if (!props.getEndpoint().isBlank()) {
      builder.endpointOverride(URI.create(props.getEndpoint()));
    }
    return builder.build();
  }
}
