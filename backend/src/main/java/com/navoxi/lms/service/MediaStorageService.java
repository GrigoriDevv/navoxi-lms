package com.navoxi.lms.service;

import com.navoxi.lms.config.S3Properties;
import com.navoxi.lms.web.ApiExceptionHandler.BadRequestException;
import com.navoxi.lms.web.ApiExceptionHandler.ServiceUnavailableException;
import java.io.IOException;
import java.time.Duration;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

@Service
public class MediaStorageService {

  private final S3Properties props;
  private final ObjectProvider<S3Client> s3Client;
  private final ObjectProvider<S3Presigner> s3Presigner;

  public MediaStorageService(
      S3Properties props,
      ObjectProvider<S3Client> s3Client,
      ObjectProvider<S3Presigner> s3Presigner) {
    this.props = props;
    this.s3Client = s3Client;
    this.s3Presigner = s3Presigner;
  }

  public boolean isEnabled() {
    return props.isEnabled();
  }

  public String uploadLessonVideo(String courseId, MultipartFile file) {
    if (!props.isEnabled()) {
      throw new ServiceUnavailableException(
          "Upload de vídeo desabilitado. Configure LMS_S3_ENABLED=true e o bucket S3.");
    }
    S3Client client = s3Client.getIfAvailable();
    if (client == null) {
      throw new ServiceUnavailableException("Cliente S3 não disponível");
    }
    if (file == null || file.isEmpty()) {
      throw new BadRequestException("Arquivo de vídeo obrigatório");
    }
    if (file.getSize() > props.getMaxFileBytes()) {
      throw new BadRequestException(
          "Arquivo muito grande. Máximo: " + (props.getMaxFileBytes() / (1024 * 1024)) + " MB");
    }
    String contentType =
        Optional.ofNullable(file.getContentType()).orElse("").toLowerCase(Locale.ROOT);
    if (!contentType.startsWith("video/")) {
      throw new BadRequestException("Content-Type deve ser video/*");
    }

    String ext = extensionFor(file.getOriginalFilename(), contentType);
    String key = "lessons/" + courseId + "/" + UUID.randomUUID() + ext;

    try {
      client.putObject(
          PutObjectRequest.builder()
              .bucket(props.getBucket())
              .key(key)
              .contentType(contentType)
              .build(),
          RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
    } catch (IOException ex) {
      throw new BadRequestException("Falha ao ler o arquivo de vídeo");
    }

    if (!props.getPublicBaseUrl().isBlank()) {
      return props.getPublicBaseUrl() + "/" + key;
    }

    S3Presigner presigner = s3Presigner.getIfAvailable();
    if (presigner == null) {
      throw new ServiceUnavailableException("Presigner S3 não disponível");
    }
    return presigner
        .presignGetObject(
            GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofSeconds(props.getPresignTtlSeconds()))
                .getObjectRequest(
                    GetObjectRequest.builder().bucket(props.getBucket()).key(key).build())
                .build())
        .url()
        .toString();
  }

  private static String extensionFor(String filename, String contentType) {
    if (filename != null) {
      int dot = filename.lastIndexOf('.');
      if (dot > 0 && dot < filename.length() - 1) {
        String ext = filename.substring(dot).toLowerCase(Locale.ROOT);
        if (ext.matches("\\.(mp4|webm|mov|m4v|ogv|mkv)")) {
          return ext;
        }
      }
    }
    return switch (contentType) {
      case "video/webm" -> ".webm";
      case "video/quicktime" -> ".mov";
      case "video/ogg" -> ".ogv";
      default -> ".mp4";
    };
  }
}
