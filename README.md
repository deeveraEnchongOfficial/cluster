# Cluster - System Integration Platform

## Overview
Cluster is a backend system built with Laravel 12 that enables seamless integration between databases and third-party APIs. It provides features like data synchronization, automation, monitoring, and batch processing, structured as an API gateway.

## Features
- API Gateway for system integration
- Supports databases and third-party APIs
- Data synchronization and automation
- Batch processing capabilities
- Secure JWT authentication using `firebase/php-jwt`
- Dockerized environment for easy deployment

## Installation

### Prerequisites
- PHP 8.2+
- Composer
- Docker & Docker Compose
- MySQL or MongoDB

### Setup Instructions

1. **Clone the Repository**
   ```sh
   git clone https://github.com/your-repo/cluster.git
   cd cluster
   ```

2. **Install Dependencies**
   ```sh
   composer install
   ```

3. **Copy and Configure Environment File**
   ```sh
   cp .env.example .env
   ```
   Modify the `.env` file as per your database and application settings.

4. **Generate Application Key**
   ```sh
   php artisan key:generate
   ```

5. **Run Migrations**
   ```sh
   php artisan migrate
   ```

6. **Start the Application**
   ```sh
   ./dev.sh up
   ```

## JWT Authentication

### Install JWT Package
```sh
composer require firebase/php-jwt
```

### Configure JWT
Add a secret key in `.env`:
```ini
JWT_SECRET=your-secret-key
JWT_ALGO=HS256
```

### Authentication Endpoints

#### Register
```http
POST /api/register
```
Payload:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password",
  "password_confirmation": "password"
}
```

#### Login
```http
POST /api/login
```
Payload:
```json
{
  "email": "john@example.com",
  "password": "password"
}
```

#### Get Authenticated User
```http
GET /api/me
Authorization: Bearer {your_jwt_token}
```

#### Logout
```http
POST /api/logout
Authorization: Bearer {your_jwt_token}
```

## Docker Setup (`dev.sh` Commands)

- Start services: `./dev.sh up`
- Stop services: `./dev.sh down`
- Run Artisan commands: `./dev.sh artisan <command>`

## License
MIT License

