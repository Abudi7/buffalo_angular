# Deployment Guide

## 🚀 Deployment Overview

This guide covers deploying TimeTrac to different environments using various deployment strategies.

## 📋 Prerequisites

### Required Tools

- Docker and Docker Compose
- Kubernetes CLI (kubectl) - for Kubernetes deployment
- Helm - for Kubernetes package management
- AWS CLI - for AWS deployment
- Terraform - for infrastructure as code

### Required Accounts

- GitHub (for CI/CD)
- Docker Hub or container registry
- Cloud provider account (AWS, GCP, Azure)
- Domain name and SSL certificate

## 🏗️ Infrastructure Architecture

### Production Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │────│   Web Server    │────│   Database      │
│   (Nginx/ALB)   │    │   (Backend)     │    │   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN/Static    │    │   Frontend      │    │   Redis Cache   │
│   (CloudFront)  │    │   (Angular)     │    │   (Optional)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🐳 Docker Deployment

### Docker Compose Setup

#### Production Docker Compose

```yaml
# docker-compose.prod.yml
version: "3.8"

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: timetrac
      POSTGRES_USER: app
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      GO_ENV: production
      JWT_SECRET: ${JWT_SECRET}
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: timetrac
      DB_USER: app
      DB_PASSWORD: ${DB_PASSWORD}
    depends_on:
      - postgres
    ports:
      - "8087:8087"
    restart: unless-stopped

  frontend:
    build:
      context: ./timetrac-frontend
      dockerfile: Dockerfile
    environment:
      API_BASE: ${API_BASE}
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    ports:
      - "443:443"
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

#### Environment Variables

```bash
# .env.prod
DB_PASSWORD=your-secure-database-password
JWT_SECRET=your-jwt-secret-key
API_BASE=https://api.yourdomain.com
```

### Docker Build Scripts

#### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o timetrac-backend ./cmd/app

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/

COPY --from=builder /app/timetrac-backend .
COPY --from=builder /app/database.yml .

EXPOSE 8087
CMD ["./timetrac-backend"]
```

#### Frontend Dockerfile

```dockerfile
# timetrac-frontend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build -- --configuration=production

FROM nginx:alpine
COPY --from=builder /app/www /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Deployment Commands

```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up --build -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Scale services
docker-compose -f docker-compose.prod.yml up --scale backend=3 -d

# Update services
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## ☸️ Kubernetes Deployment

### Kubernetes Manifests

#### Namespace

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: timetrac
```

#### ConfigMap

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: timetrac-config
  namespace: timetrac
data:
  API_BASE: "https://api.timetrac.com"
  DB_HOST: "postgres-service"
  DB_PORT: "5432"
  DB_NAME: "timetrac"
```

#### Secret

```yaml
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: timetrac-secrets
  namespace: timetrac
type: Opaque
data:
  JWT_SECRET: <base64-encoded-secret>
  DB_PASSWORD: <base64-encoded-password>
```

#### PostgreSQL Deployment

```yaml
# k8s/postgres.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: timetrac
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:14
          env:
            - name: POSTGRES_DB
              value: "timetrac"
            - name: POSTGRES_USER
              value: "app"
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: timetrac-secrets
                  key: DB_PASSWORD
          ports:
            - containerPort: 5432
          volumeMounts:
            - name: postgres-storage
              mountPath: /var/lib/postgresql/data
      volumes:
        - name: postgres-storage
          persistentVolumeClaim:
            claimName: postgres-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: timetrac
spec:
  selector:
    app: postgres
  ports:
    - port: 5432
      targetPort: 5432
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: timetrac
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```

#### Backend Deployment

```yaml
# k8s/backend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: timetrac
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: timetrac/backend:latest
          ports:
            - containerPort: 8087
          env:
            - name: GO_ENV
              value: "production"
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: timetrac-secrets
                  key: JWT_SECRET
            - name: DB_HOST
              valueFrom:
                configMapKeyRef:
                  name: timetrac-config
                  key: DB_HOST
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: timetrac-secrets
                  key: DB_PASSWORD
          livenessProbe:
            httpGet:
              path: /health
              port: 8087
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 8087
            initialDelaySeconds: 5
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: timetrac
spec:
  selector:
    app: backend
  ports:
    - port: 8087
      targetPort: 8087
  type: ClusterIP
```

#### Frontend Deployment

```yaml
# k8s/frontend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: timetrac
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
        - name: frontend
          image: timetrac/frontend:latest
          ports:
            - containerPort: 80
          env:
            - name: API_BASE
              valueFrom:
                configMapKeyRef:
                  name: timetrac-config
                  key: API_BASE
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: timetrac
spec:
  selector:
    app: frontend
  ports:
    - port: 80
      targetPort: 80
  type: ClusterIP
```

#### Ingress

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: timetrac-ingress
  namespace: timetrac
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
    - hosts:
        - timetrac.com
        - api.timetrac.com
      secretName: timetrac-tls
  rules:
    - host: timetrac.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend-service
                port:
                  number: 80
    - host: api.timetrac.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: backend-service
                port:
                  number: 8087
```

### Helm Chart

#### Chart Structure

```
helm/
├── Chart.yaml
├── values.yaml
├── values.prod.yaml
├── values.staging.yaml
└── templates/
    ├── deployment.yaml
    ├── service.yaml
    ├── ingress.yaml
    ├── configmap.yaml
    └── secret.yaml
```

#### Chart.yaml

```yaml
apiVersion: v2
name: timetrac
description: TimeTrac time tracking application
type: application
version: 1.0.0
appVersion: "1.0.0"
```

#### values.yaml

```yaml
replicaCount: 1

image:
  repository: timetrac
  pullPolicy: IfNotPresent
  tag: "latest"

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - host: timetrac.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: timetrac-tls
      hosts:
        - timetrac.com

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

autoscaling:
  enabled: false
  minReplicas: 1
  maxReplicas: 100
  targetCPUUtilizationPercentage: 80
```

### Deployment Commands

```bash
# Create namespace
kubectl create namespace timetrac

# Apply manifests
kubectl apply -f k8s/

# Deploy with Helm
helm install timetrac ./helm -f ./helm/values.prod.yaml

# Upgrade deployment
helm upgrade timetrac ./helm -f ./helm/values.prod.yaml

# Check status
kubectl get pods -n timetrac
kubectl get services -n timetrac
kubectl get ingress -n timetrac
```

## ☁️ Cloud Deployment

### AWS Deployment

#### ECS with Fargate

```json
{
  "family": "timetrac-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::account:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "account.dkr.ecr.region.amazonaws.com/timetrac-backend:latest",
      "portMappings": [
        {
          "containerPort": 8087,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "GO_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:timetrac/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/timetrac",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### RDS PostgreSQL

```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier timetrac-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 14.7 \
  --master-username app \
  --master-user-password YourPassword123 \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-12345678 \
  --db-subnet-group-name timetrac-subnet-group
```

### Google Cloud Platform

#### Cloud Run

```yaml
# cloud-run.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: timetrac-backend
  annotations:
    run.googleapis.com/ingress: all
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/maxScale: "10"
        run.googleapis.com/execution-environment: gen2
    spec:
      containerConcurrency: 100
      containers:
        - image: gcr.io/PROJECT_ID/timetrac-backend:latest
          ports:
            - containerPort: 8087
          env:
            - name: GO_ENV
              value: "production"
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: timetrac-secrets
                  key: jwt-secret
          resources:
            limits:
              cpu: "1"
              memory: "512Mi"
```

### Azure

#### Container Instances

```yaml
# azure-container-instance.yaml
apiVersion: 2018-10-01
location: eastus
name: timetrac-backend
properties:
  containers:
    - name: backend
      properties:
        image: timetrac.azurecr.io/backend:latest
        resources:
          requests:
            cpu: 1
            memoryInGb: 1
        ports:
          - port: 8087
            protocol: TCP
        environmentVariables:
          - name: GO_ENV
            value: production
          - name: JWT_SECRET
            secureValue: your-jwt-secret
  osType: Linux
  ipAddress:
    type: Public
    ports:
      - protocol: TCP
        port: 8087
  restartPolicy: Always
type: Microsoft.ContainerInstance/containerGroups
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

#### Production Deployment

```yaml
# .github/workflows/deploy-prod.yml
name: Deploy to Production

on:
  push:
    branches: [prod]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production

    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build and push backend image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: timetrac-backend
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG ./backend
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

      - name: Build and push frontend image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: timetrac-frontend
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG ./timetrac-frontend
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster timetrac-cluster \
            --service timetrac-backend \
            --force-new-deployment
```

## 🔒 Security Considerations

### SSL/TLS Configuration

```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name timetrac.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    location / {
        proxy_pass http://frontend-service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Environment Variables Security

```bash
# Use secrets management
export JWT_SECRET=$(aws secretsmanager get-secret-value --secret-id timetrac/jwt-secret --query SecretString --output text)
export DB_PASSWORD=$(aws secretsmanager get-secret-value --secret-id timetrac/db-password --query SecretString --output text)
```

## 📊 Monitoring and Logging

### Application Monitoring

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "timetrac-backend"
    static_configs:
      - targets: ["backend-service:8087"]
    metrics_path: /metrics
    scrape_interval: 5s
```

### Log Aggregation

```yaml
# logging/fluentd.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluentd-config
data:
  fluent.conf: |
    <source>
      @type tail
      path /var/log/containers/*timetrac*.log
      pos_file /var/log/fluentd-containers.log.pos
      tag kubernetes.*
      format json
    </source>

    <match kubernetes.**>
      @type elasticsearch
      host elasticsearch-service
      port 9200
      index_name timetrac-logs
    </match>
```

## 🔧 Maintenance

### Database Backups

```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://timetrac-backups/
```

### Health Checks

```bash
# Health check script
#!/bin/bash
curl -f http://localhost:8087/health || exit 1
curl -f http://localhost:80/ || exit 1
```

### Rolling Updates

```bash
# Kubernetes rolling update
kubectl set image deployment/backend backend=timetrac/backend:v2.0.0
kubectl rollout status deployment/backend
kubectl rollout undo deployment/backend  # if needed
```

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Issues

```bash
# Check database connectivity
kubectl exec -it postgres-pod -- psql -U app -d timetrac -c "SELECT 1;"

# Check network connectivity
kubectl exec -it backend-pod -- nc -zv postgres-service 5432
```

#### Application Issues

```bash
# Check application logs
kubectl logs -f deployment/backend

# Check resource usage
kubectl top pods

# Check events
kubectl get events --sort-by=.metadata.creationTimestamp
```

#### SSL Certificate Issues

```bash
# Check certificate status
kubectl describe certificate timetrac-tls

# Check cert-manager logs
kubectl logs -f deployment/cert-manager -n cert-manager
```

## 📈 Scaling

### Horizontal Pod Autoscaling

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### Database Scaling

```bash
# Read replicas for PostgreSQL
aws rds create-db-instance-read-replica \
  --db-instance-identifier timetrac-db-read-replica \
  --source-db-instance-identifier timetrac-db
```
