# 📦 Inventory Management System

A full-stack Inventory Management System built with **Java Spring Boot** (backend) and **React** (frontend), using **MySQL** as the database.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.2, Spring Data JPA |
| Database | MySQL 8 |
| Frontend | React 18, Axios |
| Build Tool | Maven |

## ✨ Features

- **CRUD Operations** — Add, view, edit, delete products
- **Restock** — Quick restock action per product
- **Low Stock Alerts** — Automatically flag products below threshold
- **Search & Filter** — By name and category
- **Dashboard Stats** — Total products, inventory value, low stock count
- **Data Seeding** — Auto-populates sample data on first run

## 📁 Project Structure

```
inventory-app/
├── backend/                          # Spring Boot app
│   ├── src/main/java/com/inventory/
│   │   ├── InventoryApplication.java # Entry point
│   │   ├── DataSeeder.java           # Sample data on startup
│   │   ├── model/Product.java        # JPA Entity
│   │   ├── repository/               # Spring Data JPA Repository
│   │   ├── service/ProductService.java
│   │   └── controller/ProductController.java
│   ├── src/main/resources/
│   │   └── application.properties    # DB config
│   └── pom.xml
│
└── frontend/                         # React app
    ├── src/
    │   ├── App.jsx                   # Main UI component
    │   └── index.js
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

- Java 17+
- MySQL 8+
- Node.js 18+
- Maven

### 1. Database Setup

```sql
CREATE DATABASE inventory_db;
```

### 2. Configure Backend

Edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/inventory_db
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

### 3. Run Backend

```bash
cd backend
mvn spring-boot:run
```

Backend runs on `http://localhost:8080`

### 4. Run Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/{id}` | Get product by ID |
| POST | `/api/products` | Create product |
| PUT | `/api/products/{id}` | Update product |
| DELETE | `/api/products/{id}` | Delete product |
| GET | `/api/products/search?name=x` | Search by name |
| GET | `/api/products/category/{cat}` | Filter by category |
| GET | `/api/products/low-stock` | Get low stock items |
| GET | `/api/products/stats` | Dashboard statistics |
| PATCH | `/api/products/{id}/restock?quantity=n` | Restock product |

## 🐞 Challenges & Solutions

### Challenge: React State Sync After Edit

**Problem:** After updating a product, the UI was showing stale data because I was mutating local state directly instead of re-fetching from the server.

**Solution:** Refactored to always call `fetchAll()` after any mutation (create/update/delete/restock), ensuring the UI reflects the actual database state. This also handles concurrent updates gracefully.

### Challenge: Low Stock Query

**Problem:** Needed a dynamic threshold per product (not a global constant) for the low stock check.

**Solution:** Used a custom JPQL query: `SELECT p FROM Product p WHERE p.quantity <= p.lowStockThreshold` — this lets each product define its own threshold while keeping the query efficient.

## 📸 Screenshots

> Add screenshots of the running app here after deployment.

## 👩‍💻 Author

**Madhuri Nallabothula**  
B.Tech CSE, JNTUH Hyderabad  
[LinkedIn](#) | [GitHub](#)
