package com.kubepulse.model;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record PodSummaryDTO(
    String podName,
    String serviceName,
    String namespace,
    String status,
    int restartCount,
    String node,
    String podIp,
    String creationTimestamp,
    String readyContainers,
    boolean ready
) {}
