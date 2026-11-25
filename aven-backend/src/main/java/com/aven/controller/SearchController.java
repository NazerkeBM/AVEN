package com.aven.controller;

import com.aven.entity.Image;
import com.aven.service.SearchService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping
    public Map<String, Object> searchAll(
            @RequestParam(defaultValue = "") String q
    ) {
        return searchService.searchAll(q);
    }

    @GetMapping("/images")
    public List<Image> searchImages(
            @RequestParam(defaultValue = "") String q
    ) {
        return searchService.searchImages(q);
    }

    @GetMapping("/users")
    public List<Map<String, Object>> searchUsers(
            @RequestParam(defaultValue = "") String q
    ) {
        return searchService.searchUsers(q);
    }
}