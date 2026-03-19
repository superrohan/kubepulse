# KubePulse

A production-ready internal web dashboard for monitoring Kubernetes pods running in Azure Kubernetes Service (AKS). Designed for banking and enterprise environments — read-only, secure, and auditable.

---

## Architecture

```
React UI (MUI, dark theme)
       ↓  HTTP / WebSocket
Spring Boot 3 API (Java 17)
       ↓  Kubernetes Java Client (in-cluster)
AKS Kubernetes API Server
       ↓
Pod / Namespace / Event / Log data
```

The backend acts as a **secure proxy**. It authenticates to Kubernetes using a service account token mounted inside the pod — cluster credentials are never exposed to the browser.

---

## Features

| Feature | Description |
|---|---|
| Pod Status Dashboard | Table of all pods with status, restarts, node, age |
| Status Colours | Running=green, Pending=yellow, CrashLoop/Failed=red |
| Namespace Filter | Filter by dev / qa / uat / prod |
| Search | Search by pod name or service name |
| Auto Refresh | Polls every 10 seconds with progress indicator |
| Pod Details Panel | Drawer with Overview, Containers, Events, Logs tabs |
| Log Viewer | Tail 100–1000 lines, copy, download |
| Stats Bar | Live counts of Running / CrashLoop / Pending / Failed |
| WebSocket Broadcast | Real-time push via STOMP over SockJS |
| Teams Alerts | CrashLoopBackOff alerts via Teams webhook (optional) |
| Spring Actuator | `/actuator/health`, `/actuator/metrics`, Prometheus |
| RBAC | Read-only ClusterRole: pods, pods/log, namespaces, events |
| Network Policy | Restrict inter-pod traffic |

---

## Project Structure

```
kubepulse/
├── backend/                          # Spring Boot 3 application
│   ├── src/main/java/com/kubepulse/
│   │   ├── KubePulseApplication.java
│   │   ├── config/
│   │   │   ├── KubernetesConfig.java  # ApiClient bean (in-cluster or kubeconfig)
│   │   │   ├── SecurityConfig.java    # HTTP Basic auth, CORS, HSTS
│   │   │   └── WebSocketConfig.java   # STOMP over SockJS
│   │   ├── controller/
│   │   │   ├── PodController.java     # GET /api/pods/**
│   │   │   └── NamespaceController.java # GET /api/namespaces
│   │   ├── service/
│   │   │   ├── PodService.java        # Interface
│   │   │   ├── NamespaceService.java
│   │   │   ├── AlertService.java
│   │   │   └── impl/
│   │   │       ├── PodServiceImpl.java      # K8s API integration
│   │   │       ├── NamespaceServiceImpl.java
│   │   │       └── AlertServiceImpl.java    # Teams webhook
│   │   ├── model/                     # DTOs
│   │   │   ├── PodSummaryDTO.java
│   │   │   ├── PodDetailDTO.java
│   │   │   ├── ContainerStatusDTO.java
│   │   │   ├── PodEventDTO.java
│   │   │   └── ApiResponse.java
│   │   ├── scheduler/
│   │   │   └── PodStatusScheduler.java # WebSocket broadcast + Teams alerts
│   │   └── exception/
│   │       ├── ResourceNotFoundException.java
│   │       └── GlobalExceptionHandler.java
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── logback-spring.xml
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/                         # React + Material UI
│   ├── src/
│   │   ├── pages/Dashboard.jsx        # Main page
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── PodTable.jsx           # Sortable pod table
│   │   │   ├── PodStatusChip.jsx      # Colour-coded status badge
│   │   │   ├── NamespaceFilter.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── StatsBar.jsx           # Summary stat cards
│   │   │   ├── RefreshTimer.jsx       # Auto-refresh toggle + progress
│   │   │   ├── PodDetailsPanel.jsx    # Right-side drawer
│   │   │   └── LogViewer.jsx          # Log tail viewer
│   │   ├── hooks/
│   │   │   ├── usePods.js
│   │   │   └── useAutoRefresh.js
│   │   ├── services/api.js            # Axios client
│   │   ├── theme.js                   # Dark MUI theme
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
└── k8s/                              # Kubernetes manifests
    ├── rbac/
    │   ├── namespace.yaml
    │   ├── serviceaccount.yaml
    │   ├── clusterrole.yaml
    │   └── clusterrolebinding.yaml
    ├── backend/
    │   ├── deployment.yaml
    │   ├── service.yaml
    │   └── secret.yaml
    ├── frontend/
    │   ├── deployment.yaml
    │   └── service.yaml
    ├── ingress.yaml
    └── networkpolicy.yaml
```

---

## REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/pods` | All pods across all namespaces |
| GET | `/api/pods/{namespace}` | Pods in a specific namespace |
| GET | `/api/pods/{namespace}/{podName}` | Pod detail (containers, events) |
| GET | `/api/pods/{namespace}/{podName}/logs` | Pod logs (`?tailLines=500&container=name`) |
| GET | `/api/namespaces` | List of namespaces |
| GET | `/actuator/health` | Health check (public) |
| GET | `/actuator/metrics` | Micrometer metrics |
| GET | `/actuator/prometheus` | Prometheus scrape endpoint |
| WS  | `/ws` (STOMP) | Real-time pod status, topic: `/topic/pods` |

### Example Response — `/api/pods`

```json
{
  "success": true,
  "timestamp": "2026-03-17T10:00:00Z",
  "data": [
    {
      "podName": "payment-service-78fdc9b4c-xk2jq",
      "serviceName": "payment-service",
      "namespace": "prod",
      "status": "Running",
      "restartCount": 0,
      "node": "aks-nodepool1-12345678-vmss000001",
      "podIp": "10.244.1.42",
      "creationTimestamp": "2026-03-10T12:21:00Z",
      "readyContainers": "1/1",
      "ready": true
    }
  ]
}
```

---

## Security Design

| Control | Implementation |
|---|---|
| Cluster auth | In-cluster service account token (`Config.fromCluster()`) |
| RBAC | Read-only ClusterRole (get/list/watch on pods, pods/log, namespaces, events) |
| API auth | HTTP Basic auth (stateless) — replace with OAuth2/OIDC for production |
| Transport | HTTPS via TLS termination at ingress |
| CORS | Restricted to specific origin |
| Headers | HSTS, X-Frame-Options DENY, X-Content-Type-Options, CSP |
| Network | NetworkPolicy restricts inter-pod traffic |
| Annotations | `kubectl.kubernetes.io/last-applied-configuration` stripped before API response |
| Principle | Read-only — no write operations on Kubernetes API |

---

## Running Locally

### Prerequisites

- Java 17+, Maven 3.9+
- Node.js 20+
- `kubectl` configured for a cluster (AKS or local Kind/Minikube)
- Docker (optional)

### Backend

```bash
cd backend

# Use local kubeconfig instead of in-cluster
export KUBERNETES_IN_CLUSTER=false
export SECURITY_ENABLED=false     # disable auth for local dev

mvn spring-boot:run
# → http://localhost:8080
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

The Vite dev server proxies `/api`, `/ws`, and `/actuator` to `localhost:8080`.

---

## Docker Build (Local)

```bash
# Backend
cd backend
docker build -t kubepulse-backend:local .
docker run -p 8080:8080 \
  -e KUBERNETES_IN_CLUSTER=false \
  -e SECURITY_ENABLED=false \
  -v ~/.kube:/root/.kube:ro \
  kubepulse-backend:local

# Frontend
cd frontend
docker build -t kubepulse-frontend:local .
docker run -p 3000:80 kubepulse-frontend:local
```

---

## Deploying to AKS

### 1. Push images to Azure Container Registry

```bash
ACR_NAME=yourbankacr
az acr login --name $ACR_NAME

# Backend
cd backend
mvn package -DskipTests
docker build -t $ACR_NAME.azurecr.io/kubepulse-backend:1.0.0 .
docker push $ACR_NAME.azurecr.io/kubepulse-backend:1.0.0

# Frontend
cd frontend
docker build -t $ACR_NAME.azurecr.io/kubepulse-frontend:1.0.0 .
docker push $ACR_NAME.azurecr.io/kubepulse-frontend:1.0.0
```

### 2. Update image references in deployment YAMLs

Replace `<YOUR_ACR>` in:
- `k8s/backend/deployment.yaml`
- `k8s/frontend/deployment.yaml`

### 3. Apply RBAC and namespace

```bash
kubectl apply -f k8s/rbac/namespace.yaml
kubectl apply -f k8s/rbac/serviceaccount.yaml
kubectl apply -f k8s/rbac/clusterrole.yaml
kubectl apply -f k8s/rbac/clusterrolebinding.yaml
```

### 4. Create the secret

```bash
kubectl create secret generic kubepulse-secret \
  --from-literal=username=kubepulse \
  --from-literal=password='<STRONG_PASSWORD>' \
  --from-literal=teams-webhook-url='<TEAMS_WEBHOOK_URL>' \
  -n kubepulse
```

### 5. Deploy backend and frontend

```bash
kubectl apply -f k8s/backend/deployment.yaml
kubectl apply -f k8s/backend/service.yaml
kubectl apply -f k8s/frontend/deployment.yaml
kubectl apply -f k8s/frontend/service.yaml
```

### 6. Apply ingress and network policies

```bash
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/networkpolicy.yaml
```

### 7. Verify deployment

```bash
kubectl get pods -n kubepulse
kubectl get svc -n kubepulse
kubectl get ingress -n kubepulse
kubectl logs -f deployment/kubepulse-backend -n kubepulse
```

---

## Environment Variables (Backend)

| Variable | Default | Description |
|---|---|---|
| `KUBERNETES_IN_CLUSTER` | `true` | Use in-cluster service account token |
| `SECURITY_ENABLED` | `true` | Enable HTTP Basic auth |
| `SECURITY_USERNAME` | `kubepulse` | API username |
| `SECURITY_PASSWORD` | `changeme` | API password (use secret) |
| `CORS_ALLOWED_ORIGIN` | `http://localhost:3000` | Allowed CORS origin |
| `ALERTS_ENABLED` | `false` | Enable Teams webhook alerts |
| `TEAMS_WEBHOOK_URL` | _(empty)_ | Teams incoming webhook URL |
| `SCHEDULER_INTERVAL_MS` | `10000` | WebSocket broadcast interval |

---

## Architectural Decisions

### Why Spring Boot + Kubernetes Java Client?
The official `io.kubernetes:client-java` library provides full API coverage and supports in-cluster authentication via the service account token automatically mounted by Kubernetes. Spring Boot 3 on Java 17 brings a mature, observable, and enterprise-ready runtime.

### Why HTTP Basic auth (not OAuth2)?
Basic auth over HTTPS is appropriate for an internal-only tool behind VPN in an enterprise environment. The architecture explicitly supports upgrading to OAuth2/OIDC (e.g., Azure AD) by swapping the `SecurityConfig` — the rest of the codebase is unaffected.

### Why polling + WebSocket (not only WebSocket)?
Polling provides simplicity and works behind any proxy. WebSocket (STOMP) is layered on top for clients that support it, enabling real-time push without the 10-second delay.

### Why ClusterRole (not Role)?
The dashboard needs to read pods across all namespaces. A namespaced Role cannot grant cluster-wide access. The ClusterRole is limited to read-only verbs only.

### Why sanitise annotations before sending to frontend?
The `kubectl.kubernetes.io/last-applied-configuration` annotation can contain sensitive data. It is stripped server-side before serialisation.

---

## Contributing

This is an internal tool. All changes must go through a pull request reviewed by a member of the Platform Engineering team. No direct pushes to `main`.
