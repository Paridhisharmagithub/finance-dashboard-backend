# 💰 Finance Dashboard Backend

## 🚀 Overview

This project is a **role-based financial management backend system** designed for organizations to track, manage, and analyze financial transactions efficiently.

It supports multiple user roles with controlled access and provides secure APIs for handling financial data, ensuring both **data integrity and security**.

---

## 🎯 Problem Statement

Organizations often struggle with:

* Scattered financial records
* Lack of access control
* Difficulty in analyzing financial data

This system solves these problems by:

* Centralizing financial data
* Enforcing role-based access control
* Providing analytical insights

---

## 👥 User Roles & Access Control

| Role       | Permissions                          |
| ---------- | ------------------------------------ |
| 👑 Admin   | Full access (CRUD + user management) |
| 📊 Analyst | View & analyze financial data        |
| 👀 Viewer  | Dashboard-only access                |

### 🔐 Concept Used: Role-Based Access Control (RBAC)

RBAC ensures that:

* Only authorized users can perform sensitive actions
* System remains secure and scalable

---

## 🔐 Authentication & Security

### Features:

* JWT-based authentication
* Protected routes
* Role validation middleware
* Rate limiting for auth endpoints
* Secure headers using Helmet

### 🔑 Concepts:

* **JWT (JSON Web Token)** → Stateless authentication
* **Middleware chaining** → Request validation pipeline
* **Rate limiting** → Prevent brute force attacks

---

## 💰 Transaction Management

### Features:

* Create, update, delete transactions (Admin)
* View transactions (Analyst/Admin)
* Soft delete implementation
* Pagination support
* Advanced filtering

### 🔍 Filtering Capabilities:

* By type (income/expense)
* By category
* By date range
* Search (category + notes)

### 🧠 Concepts:

* **Soft Delete** → Data recovery + audit trail
* **Query-based filtering** → Dynamic MongoDB queries
* **Pagination** → Efficient data handling

---

## 📊 Dashboard Analytics

### Features:

* Total income
* Total expenses
* Net balance
* Category-wise breakdown

### 🧠 Concepts:

* **Aggregation pipelines (MongoDB)**
* **Data summarization**
* **Business insights generation**

---

## 👨‍💼 User Management (Admin Panel)

### Features:

* View all users
* Change roles dynamically
* Controlled access system

### 🧠 Concept:

* **Dynamic role assignment**
* **Centralized user governance**

---

## ⚠️ Error Handling

### Features:

* Centralized error handler
* Proper HTTP status codes
* Validation errors handled
* JWT & DB errors handled

### 🧠 Concept:

* **Middleware-based error handling**
* **Consistent API response structure**

---

## 📦 API Structure

### Auth Routes

* `POST /api/auth/register`
* `POST /api/auth/login`
* `GET /api/auth/me`

### Transactions

* `GET /api/transactions`
* `POST /api/transactions`
* `PUT /api/transactions/:id`
* `DELETE /api/transactions/:id`

### Dashboard

* `GET /api/dashboard/summary`
* `GET /api/dashboard/category`

### Users

* `GET /api/users`
* `PATCH /api/users/:id/role`

---

## ⚙️ Tech Stack

* **Node.js**
* **Express.js**
* **MongoDB Atlas**
* **Mongoose**
* **JWT (jsonwebtoken)**
* **bcrypt**
* **Helmet**
* **Morgan**
* **Express Rate Limit**

---

## 🌐 Deployment

* Backend deployed on **Render**
* MongoDB hosted on **MongoDB Atlas**

---

## 🧪 Testing

* Tested using Postman
* Verified all endpoints with role-based access

---

## 🧠 Key Learnings

* Implementing secure authentication systems
* Designing scalable backend architecture
* Handling real-world financial data workflows
* Managing role-based permissions

---

## 🚀 Future Improvements

* Export transactions (CSV/PDF)
* Activity logs
* Advanced analytics (graphs, trends)
* Notification system

---

## 📌 Conclusion

This project demonstrates a **production-level backend system** with:

* Security
* Scalability
* Clean architecture
* Real-world usability

---

⭐ If you like this project, consider giving it a star!
