package com.kubepulse.service;

import com.kubepulse.model.PodDetailDTO;
import com.kubepulse.model.PodSummaryDTO;

import java.util.List;

public interface PodService {

    List<PodSummaryDTO> getAllPods();

    List<PodSummaryDTO> getPodsByNamespace(String namespace);

    PodDetailDTO getPodDetail(String namespace, String podName);

    String getPodLogs(String namespace, String podName, String container, int tailLines);
}
