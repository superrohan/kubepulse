package com.kubepulse.service.impl;

import com.kubepulse.service.NamespaceService;
import io.kubernetes.client.openapi.ApiException;
import io.kubernetes.client.openapi.apis.CoreV1Api;
import io.kubernetes.client.openapi.models.V1NamespaceList;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NamespaceServiceImpl implements NamespaceService {

    private static final Logger log = LoggerFactory.getLogger(NamespaceServiceImpl.class);

    private final CoreV1Api coreV1Api;

    public NamespaceServiceImpl(CoreV1Api coreV1Api) {
        this.coreV1Api = coreV1Api;
    }

    @Override
    public List<String> getNamespaces() {
        try {
            V1NamespaceList namespaceList = coreV1Api.listNamespace().execute();
            return namespaceList.getItems().stream()
                .map(ns -> ns.getMetadata() != null ? ns.getMetadata().getName() : "unknown")
                .filter(name -> !name.startsWith("kube-"))
                .sorted()
                .collect(Collectors.toList());
        } catch (ApiException e) {
            log.error("Failed to list namespaces: HTTP {}", e.getCode());
            throw new RuntimeException("Failed to retrieve namespaces", e);
        }
    }
}
