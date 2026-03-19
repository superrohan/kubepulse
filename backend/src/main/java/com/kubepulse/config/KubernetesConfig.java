package com.kubepulse.config;

import io.kubernetes.client.openapi.ApiClient;
import io.kubernetes.client.openapi.apis.CoreV1Api;
import io.kubernetes.client.util.Config;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

@Configuration
public class KubernetesConfig {

    private static final Logger log = LoggerFactory.getLogger(KubernetesConfig.class);

    @Value("${kubernetes.in-cluster:true}")
    private boolean inCluster;

    @Value("${kubernetes.request-timeout-seconds:30}")
    private int requestTimeoutSeconds;

    @Bean
    public ApiClient kubernetesApiClient() throws IOException {
        ApiClient client;
        if (inCluster) {
            log.info("Initialising Kubernetes client using in-cluster service account token");
            client = Config.fromCluster();
        } else {
            log.info("Initialising Kubernetes client using local kubeconfig");
            client = Config.defaultClient();
        }
        client.setHttpClient(
            client.getHttpClient().newBuilder()
                .readTimeout(requestTimeoutSeconds, TimeUnit.SECONDS)
                .connectTimeout(10, TimeUnit.SECONDS)
                .build()
        );
        io.kubernetes.client.openapi.Configuration.setDefaultApiClient(client);
        log.info("Kubernetes API client initialised successfully");
        return client;
    }

    @Bean
    public CoreV1Api coreV1Api(ApiClient apiClient) {
        return new CoreV1Api(apiClient);
    }
}
