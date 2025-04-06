# DevOps Assignment 2: Advanced Deployment Strategies

This repository contains the work for DevOps Assignment 2, extending the containerized application from Assignment 1 by deploying it to Kubernetes using advanced strategies including Kustomize for configuration management, Istio Service Mesh for traffic control and security, and Argo CD for GitOps continuous deployment.

**Argo CD Initial Admin Password:** `uRhAdY1cNJ2yOp3y`
*(Retrieve dynamically if needed: `kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo`)*

---

## Table of Contents

* [Project Overview](#project-overview)
* [Prerequisites & Installation Guidelines](#prerequisites--installation-guidelines)
* [Final File Structure](#final-file-structure)
* [Application Workflow](#application-workflow)
* [Task 1: Kubernetes Deployment (via Kustomize)](#task-1-kubernetes-deployment-via-kustomize)
* [Task 2: Kustomize Packaging](#task-2-kustomize-packaging)
* [Task 3: Service Mesh Integration (Istio)](#task-3-service-mesh-integration-istio)
* [Task 4: GitOps with Argo CD](#task-4-gitops-with-argo-cd)
* [Security Practices Implemented](#security-practices-implemented)
* [GitOps Workflow Explanation](#gitops-workflow-explanation)
* [Service Mesh Features Utilized](#service-mesh-features-utilized)
* [Maintenance Considerations](#maintenance-considerations)

---

## Project Overview

This project demonstrates deploying a containerized application (React frontend, Node.js/Express backend, MongoDB database) to a Kubernetes cluster running locally via Docker Desktop. Key DevOps practices implemented include:

* **Infrastructure as Code (IaC):** Kubernetes manifests define the desired state.
* **Configuration Management:** Kustomize manages environment-specific configurations (`dev` vs. `prod`).
* **Service Mesh:** Istio provides mTLS security, traffic splitting, and observability.
* **GitOps:** Argo CD automates deployment to the `prod` environment based on Git commits.
* **Containerization:** Docker images for frontend and backend components.

---

## Prerequisites & Installation Guidelines

Ensure the following tools are installed and configured before proceeding:

1.  **Docker Desktop:** With Kubernetes enabled.
    * Download: [Docker Website](https://www.docker.com/products/docker-desktop/)
    * Enable Kubernetes: Settings -> Kubernetes -> Check "Enable Kubernetes". Wait for green status.
2.  **kubectl:** The Kubernetes command-line tool.
    * Install Guide: [Install Tools | Kubernetes](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
    * Verify: `kubectl version --client`
    * Set Context: `kubectl config use-context docker-desktop`
3.  **Git & GitHub Repository:**
    * Install Git: [Git Downloads](https://git-scm.com/downloads)
    * Clone this repository: `git clone https://github.com/Moizuddin407/Devops-Assignment-1.git`
    * Checkout the correct branch: `git checkout Ali's-Branch`
4.  **Istio (`istioctl` CLI):**
    * Download: Find the release for your OS (e.g., `-win.zip`) from [Istio Releases](https://github.com/istio/istio/releases/).
    * Extract the archive.
    * Add the extracted `bin` directory to your system's PATH environment variable. **Open a new terminal after updating PATH.**
    * Verify CLI: `istioctl version`
    * Install Istio Control Plane (Demo Profile):
        ```bash
        # Install Istio control plane (demo profile includes Kiali, Grafana, etc.)
        istioctl install --set profile=demo -y
        # Verify installation
        kubectl get pods -n istio-system
        ```
5.  **Argo CD:**
    * Install Argo CD Components:
        ```bash
        kubectl create namespace argocd
        kubectl apply -n argocd -f [https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml](https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml)
        # Verify installation (wait for pods to be Running)
        kubectl get pods -n argocd -w
        ```
    * Access UI (run in a separate terminal):
        ```bash
        kubectl port-forward svc/argocd-server -n argocd 8080:443
        # Access via https://localhost:8080 (accept self-signed cert warning)
        ```
    * Get Initial Password (PowerShell example):
        ```powershell
        kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | foreach { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_)) }; echo
        ```
        (Username: `admin`)

---

## Final File Structure

The key directories and files created/used for Assignment 2:

```text
Devops-Assignment-1/
├── argocd/
│   └── application.yaml        # Argo CD Application manifest
├── backend/
│   ├── Dockerfile
│   ├── package.json           # Includes mongoose, cors
│   ├── package-lock.json
│   ├── server.js              # Includes /health endpoint
│   └── ...
├── frontend/
│   ├── Dockerfile             # Multi-stage build with Nginx
│   ├── nginx.conf             # Nginx config for SPA serving
│   ├── package.json
│   ├── src/
│   │   └── App.js             # Uses relative /api path
│   └── ...
├── kustomize/
│   ├── base/                  # Base Kubernetes & Istio manifests
│   │   ├── backend-destinationrule.yaml
│   │   ├── backend-service.yaml
│   │   ├── backend-v1-deployment.yaml # Renamed, includes version: v1 label
│   │   ├── backend-v2-deployment.yaml # New, includes version: v2 label
│   │   ├── backend-virtualservice.yaml
│   │   ├── frontend-deployment.yaml   # Includes imagePullPolicy
│   │   ├── frontend-service.yaml      # Actual name likely 'frontend.yaml'
│   │   ├── ingress.yaml               # Includes ingressClassName
│   │   ├── kustomization.yaml         # Lists all base resources
│   │   ├── mongo-secret.yaml
│   │   ├── mongo-service.yaml
│   │   ├── mongo-statefulset.yaml
│   │   └── peerauthentication.yaml
│   └── overlays/              # Environment-specific configurations
│       ├── dev/
│       │   └── kustomization.yaml     # Sets namespace: dev
│       └── prod/
│           ├── backend-v1-patch.yaml  # Patches backend-v1 resources/replicas
│           ├── backend-v2-patch.yaml  # Patches backend-v2 resources/replicas
│           ├── frontend-deployment-patch.yaml # Patches frontend resources/replicas
│           └── kustomization.yaml     # Sets namespace: prod, lists patches
└── README.md # This file


Application Workflow
Local Development: Code changes are made locally in frontend/ and backend/.
Containerization: Docker images are built using the Dockerfiles in each respective directory. Using meaningful tags (like semantic versions or commit hashes) is recommended over :latest.
# In backend directory (example with version tag)
docker build -t Moizuddin407/devops-assignment2-backend:v1.0.0 .
# In frontend directory (example with version tag)
docker build -t Moizuddin407/devops-assignment-frontend:v1.0.0 .


Push to Registry: Built images are pushed to a container registry (Docker Hub in this case).
docker login
docker push Moizuddin407/devops-assignment2-backend:v1.0.0
docker push Moizuddin407/devops-assignment-frontend:v1.0.0


Configuration Update (IaC): Changes to Kubernetes/Istio configurations (e.g., updating image tags, environment variables, Istio rules) are made to the YAML files within the kustomize/ directory structure.
Git Commit & Push: All code and configuration changes are committed to Git and pushed to the target branch (Ali's-Branch) on GitHub, providing version control and an audit trail.
Argo CD Sync (GitOps): Argo CD automatically detects the new commit pushed to the monitored branch and path.
Kustomize Build: Argo CD runs kustomize build kustomize/overlays/prod to generate the final production manifests.
Kubernetes Apply: Argo CD applies the generated manifests to the prod namespace, reconciling the cluster state to match the state defined in Git.
Istio Service Mesh: Istio sidecars intercept traffic, enforcing policies (PeerAuthentication, VirtualService, DestinationRule) for security and traffic control.
Task 1: Kubernetes Deployment (via Kustomize)
Goal: Define Kubernetes resources for the application stack (frontend, backend, database) and deploy them, managing environment differences using Kustomize. The core manifests created here form the Kustomize base.
File Structure Reference: kustomize/base/
Key Features Implemented:
Deployments: frontend, backend-v1, backend-v2 manage application pods. Configured with:
Readiness/Liveness Probes (/ for frontend, /health for backend) for automated health checks.
imagePullPolicy: IfNotPresent to use local images if available, otherwise pull from registry.
Image paths pointing to Docker Hub repositories.
StatefulSet: mongo StatefulSet provides stable identity and persistent storage (volumeClaimTemplates requesting a PersistentVolume) for MongoDB.
Services: frontend, backend, mongo Services provide stable internal DNS names and load balancing.
Secret: mongo-secret stores base64-encoded database credentials, injected into relevant pods.
Ingress: app-ingress uses ingressClassName: nginx and rules to route external traffic based on host (localhost) and path (/ -> frontend, /api -> backend).
Namespaces: dev and prod namespaces provide logical separation (configured in Kustomize overlays).
Deployment Commands (using Kustomize):
# Ensure Namespaces Exist (Run once)
kubectl create namespace dev
kubectl create namespace prod

# Deploy/Update Development Environment
kubectl apply -k kustomize/overlays/dev

# Deploy/Update Production Environment
# Note: For Task 4, this is handled automatically by Argo CD
kubectl apply -k kustomize/overlays/prod


Task 2: Kustomize Packaging
Goal: Utilize Kustomize to declaratively manage Kubernetes configurations across different environments (dev, prod).
File Structure Reference: kustomize/ directory tree (base/, overlays/dev/, overlays/prod/).
Key Features Implemented:
Base: Common manifests (kustomize/base/) define the core application structure.
Overlays: Environment-specific directories (kustomize/overlays/) contain kustomization.yaml files that reference the base and apply customizations.
Patches: YAML files in kustomize/overlays/prod/ (e.g., backend-v1-patch.yaml) use strategic merge patches to modify specific fields (like resources.limits, replicas) for the production environment without duplicating the base manifests.
Deployment Commands:
(See Task 1 - using kubectl apply -k <overlay-path>)
Task 3: Service Mesh Integration (Istio)
Goal: Integrate the Istio service mesh to enhance traffic management, security, and observability.
File Structure Reference: Istio Custom Resources (DestinationRule, VirtualService, PeerAuthentication) added to kustomize/base/.
Key Commands for Setup & Verification:
# Enable Istio sidecar injection (run once per namespace)
kubectl label namespace dev istio-injection=enabled --overwrite
kubectl label namespace prod istio-injection=enabled --overwrite

# Restart pods to inject sidecar (run after labeling)
kubectl delete pods --all -n dev
kubectl delete pods --all -n prod

# Apply Kustomize config (includes Istio resources)
# For dev:
kubectl apply -k kustomize/overlays/dev
# For prod (handled by Argo CD in Task 4):
# kubectl apply -k kustomize/overlays/prod

# Check pod status (look for READY 2/2)
kubectl get pods -n dev
kubectl get pods -n prod

# Access Kiali Dashboard
istioctl dashboard kiali &


Key Features Implemented:
Automatic Sidecar Injection: Istio Envoy proxies injected into application pods via namespace labels.
Mutual TLS (mTLS): Namespace-wide PeerAuthentication policy set to STRICT mode enforces encrypted and authenticated service-to-service communication. Verified via lock icons in Kiali.
Traffic Splitting: VirtualService and DestinationRule implemented to route 90% of backend traffic to v1 pods and 10% to v2 pods, enabling canary testing patterns.
Observability: Kiali dashboard utilized for visualizing mesh topology, real-time traffic flow, error rates, and security policy enforcement. Screenshots captured for deliverables.
Task 4: GitOps with Argo CD
Goal: Automate deployment to the prod environment using GitOps principles with Argo CD, ensuring the cluster state mirrors the configuration defined in Git.
File Structure Reference: argocd/application.yaml
Key Commands for Setup:
# Install Argo CD (see Prerequisites)
# Access Argo CD UI via port-forward (see Prerequisites)
# Get initial admin password (see Prerequisites)

# Apply the Application definition to Argo CD's namespace
kubectl apply -f argocd/application.yaml -n argocd


GitOps Workflow Explanation:
Source of Truth: The Ali's-Branch branch in the https://github.com/Moizuddin407/Devops-Assignment-1.git repository is the definitive source for the production configuration.
Declarative State: The desired state is defined by the Kustomize overlay found at kustomize/overlays/prod.
Monitoring: Argo CD monitors this Git path for changes.
Automated Reconciliation: Upon detecting changes (new commits), Argo CD automatically:
Builds the Kustomize overlay (kustomize build ...).
Applies the resulting manifests to the prod namespace in the target cluster (https://kubernetes.default.svc).
Uses selfHeal: true to automatically correct any drift detected between the live state and the Git state.
Uses prune: true to remove resources from the cluster if they are removed from the Git configuration.
Auditing: All changes to the production environment are traceable through Git commit history.
Rollback Simulation:
A simulated failure was introduced by pushing a commit with an invalid image tag to Git.
Argo CD detected the change, attempted to sync, and reported a Degraded status due to the resulting pod errors (ImagePullBackOff).
The Argo CD UI's "History and Rollback" feature was used to select the last known good Git commit and revert the live cluster state, successfully restoring the application.
Deliverable: The argocd/application.yaml file defines the Argo CD application managing this GitOps workflow.
Security Practices Implemented
Kubernetes Secrets: Database credentials are stored securely using Kubernetes Secrets (mongo-secret) and injected into pods as environment variables, avoiding exposure in code or Git.
Istio Mutual TLS (mTLS): A PeerAuthentication policy enforces STRICT mTLS mode within the dev and prod namespaces (once applied via Kustomize). This ensures all pod-to-pod communication within the mesh is automatically encrypted using Istio-managed certificates and mutually authenticated, preventing unauthorized access and eavesdropping. This is visible via lock icons in the Kiali dashboard.
Maintenance Considerations
Application Updates (Rolling Deployments):
Build/push new Docker image with a unique tag (e.g., semantic version).
Update the image: tag in the corresponding base Deployment YAML (kustomize/base/).
Commit & Push to Git (Ali's-Branch).
Argo CD automatically detects and syncs the change, triggering a Kubernetes rolling update in prod. Monitor via Argo CD UI or kubectl rollout status ... -n prod.
Configuration Changes: Modify base manifests or overlay patches (e.g., environment variables, Istio rules, resource limits) -> Commit & Push -> Argo CD automatically syncs the changes to prod.
Tool Upgrades: Follow official documentation for upgrading kubectl, Istio (istioctl upgrade), and Argo CD (applying new manifests). Always test upgrades in a non-production environment (dev) first and check release notes for compatibility issues or breaking changes.
Monitoring: Regularly use observability tools:
Argo CD UI: Check application sync status, health, and sync errors.
Kiali Dashboard: Visualize mesh topology, traffic metrics (RPS, latency, error rates), and mTLS status.
Grafana (if installed): Monitor detailed resource utilization (CPU/Memory), application-specific metrics, and Istio metrics. Consider setting up alerts.
Kubernetes: Use kubectl get events -n <namespace> and kubectl logs ... for troubleshooting pod-level issues. Check Istio sidecar logs (-c istio-proxy) for mesh
