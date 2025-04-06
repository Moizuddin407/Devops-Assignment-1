# DevOps Assignment 2: Advanced Deployment Strategies

This repository contains the work for DevOps Assignment 2, extending the containerized application from Assignment 1 by deploying it to Kubernetes using advanced strategies including Kustomize for configuration management, Istio Service Mesh for traffic control and security, and Argo CD for GitOps continuous deployment.

**Argo CD Initial Admin Password:** `uRhAdY1cNJ2yOp3y` (Retrieve dynamically if needed: `kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo`)

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

## Project Overview

This project demonstrates deploying a containerized application (React frontend, Node.js/Express backend, MongoDB database) to a Kubernetes cluster running locally via Docker Desktop. Key DevOps practices implemented include:

* **Infrastructure as Code (IaC):** Kubernetes manifests define the desired state.
* **Configuration Management:** Kustomize manages environment-specific configurations (`dev` vs. `prod`).
* **Service Mesh:** Istio provides mTLS security, traffic splitting, and observability.
* **GitOps:** Argo CD automates deployment to the `prod` environment based on Git commits.
* **Containerization:** Docker images for frontend and backend components.

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
        istioctl install --set profile=demo -y
        kubectl get pods -n istio-system # Verify pods are Running
        ```
5.  **Argo CD:**
    * Install Argo CD Components:
        ```bash
        kubectl create namespace argocd
        kubectl apply -n argocd -f [https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml](https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml)
        kubectl get pods -n argocd -w # Wait for pods to be Running
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

## Final File Structure

The key directories and files created/used for Assignment 2:



Devops-Assignment-1/
├── argocd/
│ └── application.yaml # Argo CD Application manifest
├── backend/
│ ├── Dockerfile
│ ├── package.json # Includes mongoose, cors
│ ├── package-lock.json
│ ├── server.js # Includes /health endpoint
│ └── ...
├── frontend/
│ ├── Dockerfile # Multi-stage build with Nginx
│ ├── nginx.conf # Nginx config for SPA serving
│ ├── package.json
│ ├── src/
│ │ └── App.js # Uses relative /api path
│ └── ...
├── kustomize/
│ ├── base/ # Base Kubernetes & Istio manifests
│ │ ├── backend-destinationrule.yaml
│ │ ├── backend-service.yaml
│ │ ├── backend-v1-deployment.yaml # Renamed, includes version: v1 label
│ │ ├── backend-v2-deployment.yaml # New, includes version: v2 label
│ │ ├── backend-virtualservice.yaml
│ │ ├── frontend-deployment.yaml # Includes imagePullPolicy
│ │ ├── frontend-service.yaml # Actual name likely 'frontend.yaml'
│ │ ├── ingress.yaml # Includes ingressClassName
│ │ ├── kustomization.yaml # Lists all base resources
│ │ ├── mongo-secret.yaml
│ │ ├── mongo-service.yaml
│ │ ├── mongo-statefulset.yaml
│ │ └── peerauthentication.yaml
│ └── overlays/ # Environment-specific configurations
│ ├── dev/
│ │ └── kustomization.yaml # Sets namespace: dev
│ └── prod/
│ ├── backend-v1-patch.yaml # Patches backend-v1 resources/replicas
│ ├── backend-v2-patch.yaml # Patches backend-v2 resources/replicas
│ ├── frontend-deployment-patch.yaml # Patches frontend resources/replicas
│ └── kustomization.yaml # Sets namespace: prod, lists patches
└── README.md # This file
## Application Workflow

1.  **Local Development:** Code changes are made locally in `frontend/` and `backend/`.
2.  **Containerization:** Docker images are built using `Dockerfile`s in each directory. It's recommended to use semantic versioning or commit-hash based tags (e.g., `v1.1.0`, `g<commit_hash>`) rather than just `:latest` for better traceability.
    ```bash
    # In backend directory (example with version tag)
    docker build -t Moizuddin407/devops-assignment2-backend:v1.0.0 .
    # In frontend directory (example with version tag)
    docker build -t Moizuddin407/devops-assignment-frontend:v1.0.0 .
    ```
3.  **Push to Registry:** Images are pushed to a container registry like Docker Hub.
    ```bash
    docker login
    docker push Moizuddin407/devops-assignment2-backend:v1.0.0
    docker push Moizuddin407/devops-assignment-frontend:v1.0.0
    ```
4.  **Configuration Update (IaC):** Kubernetes/Istio manifest changes (e.g., updating the `image:` tag in a deployment, modifying environment variables in a ConfigMap/Secret defined in the base, adjusting Istio routing rules) are made within the files managed by Kustomize (`kustomize/base/` or `kustomize/overlays/`).
5.  **Git Commit & Push:** Changes are committed to Git and pushed to the designated branch (`Ali's-Branch` for this project) on GitHub. This provides an auditable history of all configuration changes.
6.  **Argo CD Sync (GitOps):** Argo CD, constantly monitoring the repository and path, detects the new commit on the specified branch.
7.  **Kustomize Build:** Argo CD invokes `kustomize build kustomize/overlays/prod` internally to generate the final Kubernetes manifests specific to the production environment.
8.  **Kubernetes Apply:** Argo CD applies these generated manifests to the `prod` namespace in the target Kubernetes cluster (`https://kubernetes.default.svc`), reconciling the live state with the desired state defined in Git.
9.  **Istio Service Mesh:** Once pods are running with sidecars, Istio intercepts and manages network traffic according to the defined `VirtualService`, `DestinationRule`, and `PeerAuthentication` policies, providing security and traffic control.

## Task 1: Kubernetes Deployment (via Kustomize)

**Goal:** Define Kubernetes resources for the application stack and deploy them, separating `dev` and `prod` configurations. This task's manifests form the Kustomize base.

**File Structure Reference:** `kustomize/base/` (contains the core manifests)

**Key Features Implemented:**

* **Deployments:** `frontend`, `backend-v1`, `backend-v2` Deployments manage application pods, configured with readiness/liveness probes for health checking and `imagePullPolicy: IfNotPresent` to utilize local images when available but pull from registry otherwise. Image paths point to Docker Hub.
* **StatefulSet:** `mongo` StatefulSet ensures stable network identity and persistent storage for the MongoDB database using `volumeClaimTemplates` to request PersistentVolumes.
* **Services:** `frontend`, `backend`, `mongo` Services provide stable internal DNS names and load balancing for accessing the application pods.
* **Secrets:** `mongo-secret` securely stores base64-encoded database credentials, injected into database and backend pods as environment variables.
* **Ingress:** `app-ingress` uses `ingressClassName: nginx` to specify the controller and defines rules for routing external traffic (e.g., from `localhost`) to the appropriate services based on paths (`/` for frontend, `/api` for backend).
* **Persistence:** MongoDB data persists across pod restarts thanks to the PersistentVolumeClaim managed by the StatefulSet.
* **Namespaces:** `dev` and `prod` namespaces provide logical separation and resource quota domains (configured via Kustomize overlays).

**Deployment Commands (using Kustomize):**

```bash
# Ensure Namespaces Exist (Run once or handle via other means)
kubectl create namespace dev
kubectl create namespace prod

# Deploy/Update Development Environment (Applies base + dev overlay)
kubectl apply -k kustomize/overlays/dev

# Deploy/Update Production Environment (Applies base + prod overlay/patches)
kubectl apply -k kustomize/overlays/prod


(Note: For Task 4, deployment to prod is handled automatically by Argo CD).
Task 2: Kustomize Packaging
Goal: Use Kustomize to manage Kubernetes configurations declaratively, enabling environment-specific overrides on a common base set of manifests.
File Structure Reference: kustomize/ directory tree, including base/, overlays/dev/, overlays/prod/.
Key Features Implemented:
Base Configuration: All common Kubernetes and Istio YAML manifests are stored as the foundation in kustomize/base/. This promotes DRY (Don't Repeat Yourself).
Overlays: Separate directories (kustomize/overlays/dev/, kustomize/overlays/prod/) contain configurations specific to each environment.
kustomization.yaml: Each directory (base, overlays/dev, overlays/prod) has a kustomization.yaml. The overlay files reference the base and specify their target namespace. The prod overlay also lists patches.
Patches: Specific YAML files within kustomize/overlays/prod/ (e.g., backend-v1-patch.yaml) define targeted modifications using strategic merge patches. This allows changing specific fields like resources.limits, resources.requests, or replicas for production without duplicating the entire Deployment manifest.
Deployment Commands:
(See Task 1 - using kubectl apply -k <overlay-path>)
Task 3: Service Mesh Integration (Istio)
Goal: Integrate the Istio service mesh to leverage its capabilities for enhanced traffic management, security hardening, and improved observability across services.
File Structure Reference: Istio Custom Resources (DestinationRule, VirtualService, PeerAuthentication) are defined in YAML files within kustomize/base/ and referenced in the base kustomization.yaml.
Key Commands for Setup & Verification:
# Enable Istio automatic sidecar injection for target namespaces (run once per namespace)
kubectl label namespace dev istio-injection=enabled --overwrite
kubectl label namespace prod istio-injection=enabled --overwrite

# Restart existing application pods to trigger sidecar injection
# (Ensure this is done AFTER labeling the namespace)
kubectl delete pods --all -n dev
kubectl delete pods --all -n prod

# Apply Kustomize configurations (which now include Istio resources)
# For dev:
kubectl apply -k kustomize/overlays/dev
# For prod (handled by Argo CD in Task 4):
# kubectl apply -k kustomize/overlays/prod

# Check pod status (confirm READY column shows 2/2 for injected pods)
kubectl get pods -n dev
kubectl get pods -n prod

# Access the Kiali observability dashboard (runs in foreground or background)
istioctl dashboard kiali &


Key Features Implemented:
Automatic Sidecar Injection: Istio's Envoy proxies are automatically injected alongside each application container within labeled namespaces (dev, prod), intercepting all network traffic without requiring application code changes.
Mutual TLS (mTLS): A namespace-wide PeerAuthentication policy with mode: STRICT is applied via Kustomize. This enforces that all communication between services within the mesh must use Istio-provisioned certificates for strong authentication and encryption, significantly enhancing security. Verification is done by observing lock icons on traffic edges in the Kiali dashboard.
Traffic Splitting: A VirtualService directs traffic destined for the backend service, while a corresponding DestinationRule defines v1 and v2 subsets based on pod labels. The VirtualService implements a weighted routing rule, sending 90% of requests to v1 pods and 10% to v2 pods, enabling canary releases or A/B testing scenarios.
Observability: The Kiali dashboard provides a visual graph of the service mesh topology, showing services, their connections, traffic rates (requests per second), error rates, and security status (mTLS). Required screenshots were taken from this dashboard after generating application traffic.
Task 4: GitOps with Argo CD
Goal: Implement a GitOps workflow using Argo CD to automate the deployment and lifecycle management of the application in the prod environment, ensuring the cluster state mirrors the configuration defined in Git.
File Structure Reference: argocd/application.yaml contains the definition for the Argo CD Application resource.
Key Commands for Setup:
# Install Argo CD (see Prerequisites)
# Access Argo CD UI via port-forward (see Prerequisites)
# Get initial admin password (see Prerequisites)

# Apply the Application definition (tells Argo CD what to manage)
kubectl apply -f argocd/application.yaml -n argocd


GitOps Workflow Explanation:
Single Source of Truth: The Git repository (https://github.com/Moizuddin407/Devops-Assignment-1.git, Ali's-Branch branch) serves as the single source of truth for the desired state of the production application.
Declarative Definition: The desired state is declared using Kubernetes and Istio manifests, structured for Kustomize (kustomize/overlays/prod path).
Continuous Monitoring: Argo CD continuously monitors the specified path and branch in the Git repository for any new commits.
Automated Reconciliation: When Argo CD detects a difference between the state defined in Git and the live state in the prod namespace of the Kubernetes cluster:
It runs kustomize build on the specified overlay (kustomize/overlays/prod).
It applies the generated manifests to the target cluster and namespace (https://kubernetes.default.svc, prod).
The syncPolicy.automated with selfHeal: true ensures Argo CD automatically initiates this sync process.
prune: true ensures that resources removed from the Git configuration are also automatically removed from the cluster during sync.
Drift Detection: Argo CD constantly compares the live state against the Git state and reports any discrepancies (OutOfSync status), providing visibility into configuration drift.
Rollback Simulation:
A deliberate breaking change (an invalid container image tag) was introduced into a base deployment manifest (kustomize/base/backend-v1-deployment.yaml) and pushed to the Ali's-Branch branch on GitHub.
Argo CD detected the change and attempted to automatically sync it to the prod namespace.
The sync failed because Kubernetes could not pull the invalid image, causing the relevant pods to fail (ImagePullBackOff) and the Argo CD application status changed to Degraded.
Using the "History and Rollback" feature within the Argo CD UI, the previous successful Git commit (representing the last known good state) was selected.
The "Rollback" action was initiated, instructing Argo CD to re-apply the manifests generated from that good commit.
Argo CD successfully reconciled the cluster state back to the working configuration, and the application status returned to Synced and Healthy. This demonstrated the ability to quickly recover from faulty deployments using GitOps history.
Deliverable: The argocd/application.yaml file defines the Argo CD application resource, which orchestrates this GitOps workflow.
Security Practices Implemented
Kubernetes Secrets: Sensitive information, specifically MongoDB credentials (POSTGRES_USER, POSTGRES_PASSWORD keys in the mongo-secret Secret, although the names reflect PostgreSQL from a sample, the values hold the MongoDB credentials), is stored within Kubernetes Secrets rather than being exposed in version control or container images. These are securely mounted into the necessary pods (MongoDB StatefulSet, Backend Deployment) as environment variables.
Istio Mutual TLS (mTLS): By applying a PeerAuthentication policy with mode: STRICT to the application namespaces (dev, prod), Istio enforces automatic mTLS for all communication between services that have the Istio sidecar injected. This means traffic between frontend-backend and backend-database is encrypted using certificates managed by Istio, and services mutually verify each other's identity, protecting against eavesdropping and man-in-the-middle attacks within the cluster network.
Maintenance Considerations
Application Updates: To deploy a new version of the frontend or backend:
Build the new Docker image with a unique, identifiable tag (e.g., v1.0.1, g<commit_hash>). Using semantic versioning is recommended over :latest.
Push the newly tagged image to Docker Hub.
Update the image: field in the corresponding Deployment YAML file within the kustomize/base/ directory to reference the new image tag.
Commit and push this change to the Ali's-Branch branch in Git.
Argo CD will detect the change and automatically roll out the update to the prod namespace according to the Deployment's strategy (e.g., RollingUpdate). Monitor the rollout via Argo CD UI or kubectl rollout status ... -n prod.
Configuration Changes: For non-image changes (e.g., adjusting environment variables in Secrets/ConfigMaps defined in the base, modifying Istio routing rules in VirtualService/DestinationRule, changing resource limits in prod patches):
Modify the relevant YAML file(s) within the kustomize/ structure.
Commit and push the changes to the Ali's-Branch branch.
Argo CD will detect and automatically apply the configuration changes to the prod namespace. This provides an auditable trail for all configuration adjustments.
Tool Upgrades: Upgrading core components requires careful planning:
Kubernetes (Docker Desktop): Usually updated by upgrading Docker Desktop itself. Check release notes for compatibility.
Istio: Follow the official Istio upgrade guide, typically using istioctl upgrade. Pay attention to control plane and data plane compatibility, and potential CRD updates. Test upgrades in dev first.
Argo CD: Follow the official Argo CD upgrade guide, usually involving applying the manifest for the new version (kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml or specific version URL). Check for CRD updates or breaking changes.
Monitoring: Actively monitor the deployed application and infrastructure:
Argo CD UI: Check for application sync status (Synced, Healthy, OutOfSync, Degraded) and sync errors.
Kiali Dashboard: Visualize mesh health, traffic flow (RPS, latency, error rates like 5xx), and mTLS status (lock icons).
Grafana (if installed): Use pre-built or custom dashboards to monitor resource utilization (CPU, memory) of pods and nodes, Istio metrics, etc. Set up alerts for anomalies.
Kubernetes Events & Logs: Use kubectl get events -n <namespace> and kubectl logs <pod-name> -n <namespace> to investigate specific pod failures or application errors. Check Istio sidecar logs (kubectl logs <pod-name> -c istio-proxy -n <namespace>) for mesh-related issues.
Secrets Rotation: Establish a process for updating sensitive credentials stored in the mongo-secret. This typically involves:
Updating the database with the new password.
Updating the Kubernetes Secret (kubectl edit secret mongo-secret -n <namespace> or update the base
