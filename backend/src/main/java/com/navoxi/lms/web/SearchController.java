package com.navoxi.lms.web;

import com.navoxi.lms.service.SearchService;
import com.navoxi.lms.web.dto.SearchResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/search")
public class SearchController {

  private final SearchService search;
  private final CurrentUserResolver currentUser;

  public SearchController(SearchService search, CurrentUserResolver currentUser) {
    this.search = search;
    this.currentUser = currentUser;
  }

  @GetMapping
  public SearchResponse search(
      @RequestParam("q") String q,
      @RequestParam(value = "types", required = false) String types,
      @RequestParam(value = "limit", required = false) Integer limit) {
    return search.search(currentUser.require(), q, types, limit);
  }
}
