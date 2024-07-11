# Librarian App

## Table of Contents

1. [Introduction](#introduction)
2. [Tech Stack](#tech-stack)
3. [ERD](#erd)
4. [Setup Instructions](#setup-instructions)
   - [Development](#development)
   - [Testing](#testing)
   - [Production](#production)
5. [Documentation](#documentation)

## Introduction

The Librarian App is a NestJS-based application designed to manage a library system, including functionalities for book borrowing, member management, and more.

## Tech Stack

- **Backend Framework**: NestJS
- **Database**: PostgreSQL (via Prisma ORM)
- **API Documentation**: Swagger
- **Testing**: Jest

## ERD


[Link to ERD Diagram](https://dbdiagram.io/d/Librarian-667bb48f9939893dae495a54)

## Setup Instructions

### Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mrdzick/librarian-backend.git
   ```
   ```
   cd librarian-backend
   ```
2. **Install dependencies***
    ```
    npm install
    ```
3. **Setup environment variables**
  
    Copy the `.env.template` file to create your own `.env` file:
    ```
    cp .env.template .env
    ```
    Then fill in the necessary environment variables in the `.env` file.
4. Create database for your development. Make sure database name is the same as you defined in your `.env` file.
5. **Run database migrations**
    ```
    npx prisma migrate dev
    ```
6. **Start the application**
    ```
    npm run start:dev
    ```

### Testing
1. Create separate database for running test cases.
2. Change the value of `.env.test` value based on your test environment.
3. Run unit test:
    ```
    npm run test
    ```
4. Run end to end test:
    ```
    npm run test:e2e
    ```

### Production
1. **Clone the repository**:
   ```bash
   git clone https://github.com/mrdzick/librarian-backend.git
   ```
   ```
   cd librarian-backend
   ```
2. **Install dependencies***
    ```
    npm install
    ```
3. **Setup environment variables**
  
    Copy the `.env.template` file to create your own `.env` file:
    ```
    cp .env.template .env
    ```
    Then fill in the necessary environment variables in the `.env` file.
4. Create database for your production. Make sure database name is the same as you defined in your `.env` file.
5. **Run database migrations**
    ```
    npx prisma migrate deploy
    ```
6. **Build and start the application**
    ```
    npm run build
    ```
    ```
    npm run start:prod
    ```
### Documentation ###
1. Make sure you defined `SWAGGER_ENABLED=true` in your `.env` file.
    ```
    SWAGGER_ENABLED=true
    ```
2. Access `/docs` endpoint. For example, if this application running in `http://localhost:3000`, it will be `http://localhost:3000/docs`