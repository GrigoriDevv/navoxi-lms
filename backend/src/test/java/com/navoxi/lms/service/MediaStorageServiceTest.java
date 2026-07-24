package com.navoxi.lms.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.navoxi.lms.config.S3Properties;
import com.navoxi.lms.web.ApiExceptionHandler.ServiceUnavailableException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mock.web.MockMultipartFile;

class MediaStorageServiceTest {

  @Test
  void uploadFailsWhenS3Disabled() {
    S3Properties props =
        new S3Properties(false, "", "us-east-1", "", "", "", "", 1024, 60);
    MediaStorageService service =
        new MediaStorageService(props, emptyProvider(), emptyProvider());
    MockMultipartFile file =
        new MockMultipartFile("file", "a.mp4", "video/mp4", new byte[] {1, 2, 3});
    assertThatThrownBy(() -> service.uploadLessonVideo("c1", file))
        .isInstanceOf(ServiceUnavailableException.class)
        .hasMessageContaining("LMS_S3_ENABLED");
  }

  private static <T> ObjectProvider<T> emptyProvider() {
    return new ObjectProvider<>() {
      @Override
      public T getObject() {
        return null;
      }

      @Override
      public T getObject(Object... args) {
        return null;
      }

      @Override
      public T getIfAvailable() {
        return null;
      }

      @Override
      public T getIfUnique() {
        return null;
      }
    };
  }
}
