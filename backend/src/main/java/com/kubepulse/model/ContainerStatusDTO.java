package com.kubepulse.model;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ContainerStatusDTO(
    String name,
    String image,
    boolean ready,
    int restartCount,
    String state,
    String reason
) {}
