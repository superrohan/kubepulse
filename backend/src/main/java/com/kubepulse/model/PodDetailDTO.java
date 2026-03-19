package com.kubepulse.model;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record PodDetailDTO(
    String podName,
    String namespace,
    String status,
    String node,
    String creationTimestamp,
    List<ContainerStatusDTO> containerStatuses
) {}
