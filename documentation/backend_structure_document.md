# Backend Structure Document for mywebapp

This document describes the backend setup for **mywebapp** in clear, everyday language. It covers how the system is built, where it lives, and how it all works together behind the scenes.

## 1. Backend Architecture

**Overview**

- We use a **layered architecture** that separates responsibilities into:
  - **API Layer (Controllers):** Receives HTTP requests, handles input validation.
  - **Service Layer:** Contains business logic and rules.
  - **Data Access Layer (Repositories):** Reads from and writes to the database.

- The code is written in **Node.js** with the **Express** framework:
  - Express makes it easy to define routes and middleware.
  - We follow common patterns (often called MVC—Model, View, Controller) to keep code organized.

**Scalability, Maintainability, Performance**

- **Stateless Services:** Each server instance can handle any request. This makes it easy to add more servers under heavy load.
- **Modularity:** Services are broken into small, focused files. Adding features or fixing bugs is straightforward.
- **Asynchronous I/O:** Node.js handles many requests at once without blocking, keeping response times fast.

## 2. Database Management

**Technologies Used**

- Primary database: **PostgreSQL** (SQL)
- Caching layer: **Redis** (in-memory key-value store)

**Data Handling**

- **Structured Data:** User accounts, content items, and relationships are stored in PostgreSQL tables.
- **Sessions & Short-Lived Data:** Redis holds session tokens and rate-limit counters for quick reads/writes.
- **Backups & Recovery:** Automated daily backups of the PostgreSQL database. Point-in-time recovery enabled.

## 3. Database Schema

**Human-Readable Overview**

1. **Users**
   - Each user has an ID, name, email, password hash, role, and timestamps.
2. **Roles**
   - Defines user roles (e.g., Admin, Editor, Viewer) and related permissions.
3. **Content**
   - Items created by users (e.g., articles, posts) with title, body, author reference, and timestamps.
4. **Sessions**
   - Tracks active login sessions (session ID, user reference, expiry).

**SQL Schema (PostgreSQL)**

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(200) NOT NULL,
  role_id INTEGER NOT NULL REFERENCES roles(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles table
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content table
CREATE TABLE content (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  author_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 4. API Design and Endpoints

We follow **RESTful** conventions. Key endpoints include:

- **Authentication**
  - `POST /api/auth/register` – Create a new user account.
  - `POST /api/auth/login` – Sign in and receive a JSON Web Token (JWT).
  - `POST /api/auth/logout` – Invalidate the current session.

- **User Management**
  - `GET /api/users` – List all users (Admin only).
  - `GET /api/users/:id` – Fetch one user’s details.
  - `PUT /api/users/:id` – Update user profile or role.
  - `DELETE /api/users/:id` – Remove a user.

- **Content Management**
  - `GET /api/content` – List all content items.
  - `POST /api/content` – Create a new content item.
  - `GET /api/content/:id` – Retrieve a specific item.
  - `PUT /api/content/:id` – Update an item.
  - `DELETE /api/content/:id` – Delete an item.

- **Miscellaneous**
  - `GET /api/health` – Check service health (returns status OK).

Each endpoint uses standard HTTP verbs (GET, POST, PUT, DELETE) and status codes (200, 201, 400, 401, 404, 500).

## 5. Hosting Solutions

We host the backend in the **cloud** using **Amazon Web Services (AWS)**:

- **Compute:** Elastic Container Service (ECS) or EC2 instances running Docker containers.
- **Database:** Amazon RDS for PostgreSQL.
- **Cache:** Amazon ElastiCache for Redis.

**Benefits**
- **Reliability:** Managed services with built-in failover.
- **Scalability:** Auto Scaling groups adjust the number of servers as load changes.
- **Cost-Effectiveness:** Pay-as-you-go pricing; you only pay for what you use.

## 6. Infrastructure Components

- **Load Balancer (AWS ALB):** Distributes incoming traffic across multiple containers/servers.
- **Caching (Redis):** Speeds up repeated reads (e.g., session lookups).
- **Content Delivery Network (AWS CloudFront):** Serves static files (images, scripts) close to users.
- **Object Storage (AWS S3):** Stores uploads and static assets.
- **DNS (Route 53):** Routes user requests to the Load Balancer.

These parts work together to keep pages loading fast, even under heavy use.

## 7. Security Measures

- **Authentication & Authorization:**
  - JWT-based tokens stored in HTTP-only cookies.
  - Role-based access controls (RBAC) guard sensitive endpoints.
- **Encryption:**
  - All traffic over HTTPS/TLS.
  - Passwords hashed using a strong algorithm (e.g., bcrypt).
- **API Protection:**
  - Rate limiting via Redis to prevent abuse.
  - Input validation and sanitization to prevent SQL injection and XSS.
- **Compliance & Best Practices:**
  - Regular dependency scanning for vulnerabilities.
  - Secure configuration of AWS resources (least privilege IAM roles).

## 8. Monitoring and Maintenance

- **Logging:** Application logs go to a centralized service (e.g., AWS CloudWatch or ELK stack).
- **Metrics:** Track response times, error rates, and resource usage with CloudWatch or Prometheus.
- **Alerting:** Set up alerts for high error rates or CPU/memory spikes.
- **Updates:**
  - Automated security patching for OS and libraries.
  - Regular database vacuuming and indexing for optimal performance.

## 9. Conclusion and Overall Backend Summary

The **mywebapp** backend is built to be:

- **Scalable:** Handles growth by adding servers and managed services.
- **Maintainable:** Clear layers and modular code keep the system easy to understand and extend.
- **Secure:** Strong authentication, encryption, and best practices protect user data.
- **Performant:** Caching, load balancing, and CDN integration ensure fast responses.

Together, these components form a robust foundation that aligns with project goals: delivering a reliable, user-focused web application ready for future features and expansion.