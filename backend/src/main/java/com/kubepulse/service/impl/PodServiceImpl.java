package com.kubepulse.service.impl;

import com.kubepulse.exception.ResourceNotFoundException;
import com.kubepulse.model.ContainerStatusDTO;
import com.kubepulse.model.PodDetailDTO;
import com.kubepulse.model.PodSummaryDTO;
import com.kubepulse.service.PodService;
import io.kubernetes.client.openapi.ApiException;
import io.kubernetes.client.openapi.apis.CoreV1Api;
import io.kubernetes.client.openapi.models.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PodServiceImpl implements PodService {

    private static final Logger log = LoggerFactory.getLogger(PodServiceImpl.class);
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ISO_OFFSET_DATE_TIME;
    private static final int DEFAULT_LOG_LINES = 500;

    private final CoreV1Api coreV1Api;

    public PodServiceImpl(CoreV1Api coreV1Api) {
        this.coreV1Api = coreV1Api;
    }

    @Override
    public List<PodSummaryDTO> getAllPods() {
        try {
            V1PodList podList = coreV1Api.listPodForAllNamespaces().execute();
            return podList.getItems().stream()
                .map(this::toPodSummary)
                .collect(Collectors.toList());
        } catch (ApiException e) {
            log.error("Failed to list all pods: HTTP {} - {}", e.getCode(), e.getResponseBody());
            throw new RuntimeException("Failed to retrieve pods from Kubernetes API", e);
        }
    }

    @Override
    public List<PodSummaryDTO> getPodsByNamespace(String namespace) {
        try {
            V1PodList podList = coreV1Api.listNamespacedPod(namespace).execute();
            return podList.getItems().stream()
                .map(this::toPodSummary)
                .collect(Collectors.toList());
        } catch (ApiException e) {
            log.error("Failed to list pods in namespace {}: HTTP {}", namespace, e.getCode());
            throw new RuntimeException("Failed to retrieve pods for namespace: " + namespace, e);
        }
    }

    @Override
    public PodDetailDTO getPodDetail(String namespace, String podName) {
        try {
            V1Pod pod = coreV1Api.readNamespacedPod(podName, namespace).execute();
            return toPodDetail(pod);
        } catch (ApiException e) {
            if (e.getCode() == 404) {
                throw new ResourceNotFoundException("Pod not found: " + podName + " in namespace: " + namespace);
            }
            log.error("Failed to get pod details {}/{}: HTTP {}", namespace, podName, e.getCode());
            throw new RuntimeException("Failed to retrieve pod details", e);
        }
    }

    @Override
    public String getPodLogs(String namespace, String podName, String container, int tailLines) {
        int lines = tailLines > 0 ? tailLines : DEFAULT_LOG_LINES;
        try {
            CoreV1Api.APIreadNamespacedPodLogRequest request =
                coreV1Api.readNamespacedPodLog(podName, namespace).tailLines(lines);
            if (container != null && !container.isBlank()) {
                request = request.container(container);
            }
            return request.execute();
        } catch (ApiException e) {
            if (e.getCode() == 404) {
                throw new ResourceNotFoundException("Pod not found: " + podName);
            }
            log.error("Failed to get logs for pod {}/{}: HTTP {}", namespace, podName, e.getCode());
            throw new RuntimeException("Failed to retrieve pod logs", e);
        }
    }

    private PodSummaryDTO toPodSummary(V1Pod pod) {
        V1ObjectMeta meta = pod.getMetadata();
        V1PodStatus status = pod.getStatus();

        String podName = meta != null ? meta.getName() : "unknown";
        String namespace = meta != null ? meta.getNamespace() : "unknown";
        String serviceName = extractServiceName(podName, meta);
        String podStatus = resolveStatus(pod);
        int restartCount = getTotalRestartCount(status);
        String node = pod.getSpec() != null ? pod.getSpec().getNodeName() : null;
        String podIp = status != null ? status.getPodIP() : null;
        String creationTimestamp = meta != null && meta.getCreationTimestamp() != null
            ? meta.getCreationTimestamp().format(FORMATTER) : null;

        int readyCount = countReadyContainers(status);
        int totalCount = status != null && status.getContainerStatuses() != null
            ? status.getContainerStatuses().size() : 0;

        return new PodSummaryDTO(
            podName, serviceName, namespace, podStatus, restartCount,
            node, podIp, creationTimestamp,
            readyCount + "/" + totalCount,
            readyCount == totalCount && totalCount > 0
        );
    }

    private PodDetailDTO toPodDetail(V1Pod pod) {
        V1ObjectMeta meta = pod.getMetadata();
        V1PodStatus status = pod.getStatus();

        List<ContainerStatusDTO> containerStatuses = new ArrayList<>();
        if (status != null && status.getContainerStatuses() != null) {
            containerStatuses = status.getContainerStatuses().stream()
                .map(this::toContainerStatus)
                .collect(Collectors.toList());
        }

        return new PodDetailDTO(
            meta != null ? meta.getName() : "unknown",
            meta != null ? meta.getNamespace() : "unknown",
            resolveStatus(pod),
            pod.getSpec() != null ? pod.getSpec().getNodeName() : null,
            meta != null && meta.getCreationTimestamp() != null
                ? meta.getCreationTimestamp().format(FORMATTER) : null,
            containerStatuses
        );
    }

    private ContainerStatusDTO toContainerStatus(V1ContainerStatus cs) {
        String state = "Unknown";
        String reason = null;

        if (cs.getState() != null) {
            if (cs.getState().getRunning() != null) {
                state = "Running";
            } else if (cs.getState().getWaiting() != null) {
                state = "Waiting";
                reason = cs.getState().getWaiting().getReason();
            } else if (cs.getState().getTerminated() != null) {
                state = "Terminated";
                reason = cs.getState().getTerminated().getReason();
            }
        }

        return new ContainerStatusDTO(
            cs.getName(),
            cs.getImage(),
            Boolean.TRUE.equals(cs.getReady()),
            cs.getRestartCount() != null ? cs.getRestartCount() : 0,
            state,
            reason
        );
    }

    private String resolveStatus(V1Pod pod) {
        if (pod.getStatus() == null) return "Unknown";

        if (pod.getMetadata() != null && pod.getMetadata().getDeletionTimestamp() != null) {
            return "Terminating";
        }

        List<V1ContainerStatus> initStatuses = pod.getStatus().getInitContainerStatuses();
        if (initStatuses != null) {
            for (V1ContainerStatus cs : initStatuses) {
                if (cs.getState() != null && cs.getState().getWaiting() != null) {
                    String r = cs.getState().getWaiting().getReason();
                    if (r != null && !r.isEmpty()) return "Init:" + r;
                }
            }
        }

        List<V1ContainerStatus> containerStatuses = pod.getStatus().getContainerStatuses();
        if (containerStatuses != null) {
            for (V1ContainerStatus cs : containerStatuses) {
                if (cs.getState() != null && cs.getState().getWaiting() != null) {
                    String r = cs.getState().getWaiting().getReason();
                    if (r != null && !r.isEmpty()) return r;
                }
                if (cs.getState() != null && cs.getState().getTerminated() != null) {
                    String r = cs.getState().getTerminated().getReason();
                    if (r != null && !r.isEmpty()) return r;
                }
            }
        }

        String phase = pod.getStatus().getPhase();
        return phase != null ? phase : "Unknown";
    }

    private int getTotalRestartCount(V1PodStatus status) {
        if (status == null || status.getContainerStatuses() == null) return 0;
        return status.getContainerStatuses().stream()
            .mapToInt(cs -> cs.getRestartCount() != null ? cs.getRestartCount() : 0)
            .sum();
    }

    private int countReadyContainers(V1PodStatus status) {
        if (status == null || status.getContainerStatuses() == null) return 0;
        return (int) status.getContainerStatuses().stream()
            .filter(cs -> Boolean.TRUE.equals(cs.getReady()))
            .count();
    }

    private String extractServiceName(String podName, V1ObjectMeta meta) {
        if (meta != null && meta.getLabels() != null) {
            String app = meta.getLabels().get("app");
            if (app != null) return app;
            String appName = meta.getLabels().get("app.kubernetes.io/name");
            if (appName != null) return appName;
        }
        if (podName != null && podName.contains("-")) {
            String[] parts = podName.split("-");
            if (parts.length >= 3) {
                return String.join("-", Arrays.copyOf(parts, parts.length - 2));
            }
        }
        return podName;
    }
}
