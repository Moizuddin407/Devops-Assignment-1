---

# DevOps Assignment 1

This repository contains the implementation of DevOps principles, including CI/CD workflows, Dockerization, and application testing for a full-stack application. The project involves a Node.js backend, a React.js frontend, and integration with MongoDB. Additionally, it uses GitHub Actions for continuous integration and deployment (CI/CD) to Docker Hub.
pass=uRhAdY1cNJ2yOp3y

## Table of Contents
- [Project Overview](#project-overview)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)
- [CI/CD Workflow](#cicd-workflow)
- [Testing](#testing)
- [Dockerization](#dockerization)
- [Push to DockerHub](#push-to-dockerhub)
- [Folder Structure](#folder-structure)
- [Contributors](#contributors)

## Project Overview
This project is designed to demonstrate the use of DevOps practices in a full-stack application. It includes:
- A backend built with Node.js and Express.
- A frontend built with React.js.
- MongoDB as the database.
- Docker for containerization.
- GitHub Actions for CI/CD, including automatic deployment to Docker Hub.

## Technologies Used
- **Node.js**: Backend development with Express.js.
- **React.js**: Frontend framework.
- **MongoDB**: Database for storing messages.
- **Docker**: Containerizing the application.
- **GitHub Actions**: For CI/CD to automate testing and deployment.
- **Jest**: For testing the React frontend.
- **Axios**: HTTP client used in React to interact with the backend.

## Setup Instructions

### Clone the repository
To set up the project on your local machine, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/Devops-Assignment-1.git
   ```

2. Navigate to the project directory:
   ```bash
   cd Devops-Assignment-1
   ```

3. Install dependencies for the backend:
   ```bash
   cd backend
   npm install
   ```

4. Install dependencies for the frontend:
   ```bash
   cd ../frontend
   npm install
   ```

5. Run the application:
   - For the backend: 
     ```bash
     cd backend
     npm start
     ```
   - For the frontend:
     ```bash
     cd frontend
     npm start
     ```

6. The app should now be running locally at:
   - Backend: `http://localhost:3000`
   - Frontend: `http://localhost:3001`

## CI/CD Workflow

### GitHub Actions Workflow
The CI/CD pipeline is automated using GitHub Actions. The workflow is triggered on each push or pull request to the `main` branch. The workflow does the following:
- **Install Dependencies**: Install dependencies for both frontend and backend.
- **Run Tests**: Executes Jest tests for the React frontend.
- **Build Docker Images**: Builds Docker images for the frontend and backend.
- **Push to DockerHub**: Pushes the built images to Docker Hub.

The workflow is defined in `.github/workflows/ci.yml` and looks like this:

```yaml
name: CI Workflow

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '14'

      - name: Install dependencies for frontend and backend
        run: |
          cd frontend
          npm install
          cd ../backend
          npm install

      - name: Run frontend tests
        run: |
          cd frontend
          npm test -- --coverage --ci --silent

      - name: Build Docker images
        run: |
          docker build -t moizz407/devops-assignment-frontend ./frontend
          docker build -t moizz407/devops-assignment-backend ./backend

      - name: Log in to DockerHub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Push frontend image to DockerHub
        run: |
          docker push moizz407/devops-assignment-frontend

      - name: Push backend image to DockerHub
        run: |
          docker push moizz407/devops-assignment-backend
```

## Testing

### Frontend Tests
We have set up tests for the frontend using Jest and React Testing Library. These tests are run in GitHub Actions using the following command:

```bash
npm test -- --coverage --ci --silent
```

- **Test Coverage**: The tests include coverage information that is generated and can be viewed in the workflow logs.
- **CI Mode**: The tests run in CI mode to ensure they run correctly in the GitHub Actions environment.

### Backend Tests
Currently, there are no backend tests implemented, but this can be extended using Jest and Supertest to test API routes.

## Dockerization

### Dockerfile for Backend
The backend is containerized using Docker. The Dockerfile for the backend looks like this:

```dockerfile
FROM node:14

WORKDIR /app

COPY ./package.json ./package-lock.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Dockerfile for Frontend
The frontend is also containerized with a similar Dockerfile:

```dockerfile
FROM node:14

WORKDIR /app

COPY ./package.json ./package-lock.json ./
RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
```

### Build and Run Docker Containers Locally
To build and run the Docker containers locally, you can use the following commands:

1. **Build Docker Images**:
   ```bash
   docker build -t devops-assignment-frontend ./frontend
   docker build -t devops-assignment-backend ./backend
   ```

2. **Run Docker Containers**:
   ```bash
   docker run -p 3000:3000 devops-assignment-backend
   docker run -p 3001:3001 devops-assignment-frontend
   ```

### Push to DockerHub
The Docker images are pushed to DockerHub using the `docker push` command within the CI/CD pipeline:

```bash
docker push moizz407/devops-assignment-frontend
docker push moizz407/devops-assignment-backend
```

## Folder Structure

```
Devops-Assignment-1/
├── .github/
│   └── workflows/
│       └── ci.yml
├── backend/
│   └── Dockerfile
│   └── package.json
│   └── index.js
├── frontend/
│   └── Dockerfile
│   └── package.json
│   └── App.js
├── README.md
└── docker-compose.yml
```

## Contributors

- **Moizuddin407** - Moiz Uddin M. Abdullah
- **psdcoderr** - Areesha Faisal
- **AliSHAHZAD-007** - Ali Shahzad

---
