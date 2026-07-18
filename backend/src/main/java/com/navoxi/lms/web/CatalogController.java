package com.navoxi.lms.web;

import com.navoxi.lms.service.CatalogService;
import com.navoxi.lms.web.dto.LessonDto;
import com.navoxi.lms.web.dto.ModuleDto;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class CatalogController {

  private final CatalogService catalog;

  public CatalogController(CatalogService catalog) {
    this.catalog = catalog;
  }

  @GetMapping("/modules")
  public List<ModuleDto> allModules() {
    return catalog.allModules();
  }

  @GetMapping("/lessons")
  public List<LessonDto> allLessons() {
    return catalog.allLessons();
  }
}
