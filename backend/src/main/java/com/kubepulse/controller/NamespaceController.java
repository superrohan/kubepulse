package com.kubepulse.controller;

import com.kubepulse.model.ApiResponse;
import com.kubepulse.service.NamespaceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/namespaces")
public class NamespaceController {

    private static final Logger log = LoggerFactory.getLogger(NamespaceController.class);

    private final NamespaceService namespaceService;

    public NamespaceController(NamespaceService namespaceService) {
        this.namespaceService = namespaceService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<String>>> getNamespaces() {
        log.debug("GET /api/namespaces");
        return ResponseEntity.ok(ApiResponse.ok(namespaceService.getNamespaces()));
    }
}
