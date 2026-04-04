# Finance Dashboard Backend

A clean backend for a finance dashboard system with role-based access control, transaction management, analytics, validation, and soft delete support.

## What this backend covers

- User registration and login
- JWT authentication
- Role-based access control
- User management by admin
- Transaction CRUD with filtering and pagination
- Dashboard analytics:
  - total income
  - total expense
  - net balance
  - category breakdown
  - recent activity
  - monthly or weekly trends
- Validation and centralized error handling
- Soft delete for transactions
- Rate limiting on auth endpoints

## Roles

- **Viewer**: can only view dashboard summary
- **Analyst**: can view transactions and analytics
- **Admin**: full access to users and transactions

## Setup

### 1. Install dependencies
```bash
npm install