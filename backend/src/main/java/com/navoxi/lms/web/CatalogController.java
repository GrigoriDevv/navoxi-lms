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
  private final CurrentUserResolver currentUser;

  public CatalogController(CatalogService catalog, CurrentUserResolver currentUser) {
    this.catalog = catalog;
    this.currentUser = currentUser;
  }

  @GetMapping("/modules")
  public List<ModuleDto> allModules() {
    return catalog.allModules(currentUser.require());
  }

  @GetMapping("/lessons")
  public List<LessonDto> allLessons() {
    return catalog.allLessons(currentUser.require());
  }
}
