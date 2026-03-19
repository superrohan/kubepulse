package com.kubepulse.controller;

import com.kubepulse.model.ApiResponse;
import com.kubepulse.model.PodDetailDTO;
import com.kubepulse.model.PodSummaryDTO;
import com.kubepulse.service.PodService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pods")
public class PodController {

    private static final Logger log = LoggerFactory.getLogger(PodController.class);

    private final PodService podService;

    public PodController(PodService podService) {
        this.podService = podService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PodSummaryDTO>>> getAllPods() {
        log.debug("GET /api/pods");
        return ResponseEntity.ok(ApiResponse.ok(podService.getAllPods()));
    }

    @GetMapping("/{namespace}")
    public ResponseEntity<ApiResponse<List<PodSummaryDTO>>> getPodsByNamespace(
            @PathVariable String namespace) {
        log.debug("GET /api/pods/{}", namespace);
        return ResponseEntity.ok(ApiResponse.ok(podService.getPodsByNamespace(namespace)));
    }

    @GetMapping("/{namespace}/{podName}")
    public ResponseEntity<ApiResponse<PodDetailDTO>> getPodDetail(
            @PathVariable String namespace,
            @PathVariable String podName) {
        log.debug("GET /api/pods/{}/{}", namespace, podName);
        return ResponseEntity.ok(ApiResponse.ok(podService.getPodDetail(namespace, podName)));
    }

    @GetMapping("/{namespace}/{podName}/logs")
    public ResponseEntity<ApiResponse<String>> getPodLogs(
            @PathVariable String namespace,
            @PathVariable String podName,
            @RequestParam(required = false) String container,
            @RequestParam(defaultValue = "500") int tailLines) {
        log.debug("GET /api/pods/{}/{}/logs tailLines={}", namespace, podName, tailLines);
        return ResponseEntity.ok(ApiResponse.ok(
            podService.getPodLogs(namespace, podName, container, tailLines)));
    }
}
