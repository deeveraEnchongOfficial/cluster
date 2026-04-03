# Cluster - Laravel Inertia MongoDB Application

A modern full-stack application built with Laravel 12, Inertia.js, React, MongoDB, and Tailwind CSS.

## Features

- **Backend**: Laravel 12 with MongoDB integration
- **Frontend**: React with Inertia.js for SPA-like experience
- **UI**: Tailwind CSS with shadcn/ui components
- **Authentication**: Laravel Breeze with Inertia.js
- **Database**: MongoDB with Laravel MongoDB package
- **Styling**: Modern, responsive design with Tailwind CSS

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- PHP (v8.2+)
- Composer
- MongoDB (local or cloud instance)

### Installation

1. **Clone and setup the project**
```bash
cd cluster
```

2. **Install PHP dependencies**
```bash
composer install
```

3. **Install Node dependencies**
```bash
npm install --legacy-peer-deps
```

4. **Environment setup**
```bash
cp .env.example .env
php artisan key:generate
```

5. **Configure MongoDB connection in `.env`**
```env
DB_CONNECTION=mongodb
DB_DSN=mongodb://localhost:27017
DB_DATABASE=cluster
DB_USERNAME=
DB_PASSWORD=
```

6. **Run migrations**
```bash
php artisan migrate:fresh
```

7. **Build assets**
```bash
npm run build
```

### Development

1. **Start the development server**
```bash
php artisan serve
```

2. **Start Vite development server** (in another terminal)
```bash
npm run dev
```

3. **Visit the application**
```
http://localhost:8000
```

## Project Structure

```
cluster/
├── app/
│   ├── Http/Controllers/
│   │   ├── ProjectController.php
│   │   └── ...
│   └── Models/
│       ├── Project.php
│       └── User.php
├── resources/
│   ├── js/
│   │   ├── Components/
│   │   │   └── ui/          # Reusable UI components
│   │   ├── Layouts/
│   │   │   └── DashboardLayout.jsx
│   │   └── Pages/
│   │       ├── Projects/     # CRUD pages
│   │       └── ...
│   └── css/
│       └── app.css
├── database/
│   └── migrations/
├── routes/
│   └── web.php
└── ...
```

## Available Features

### Authentication
- User registration and login
- Password reset
- Email verification
- Profile management

### Project Management (Example CRUD)
- Create, read, update, delete projects
- Project status tracking
- Budget and date management
- User-specific project filtering

### UI Components
- Button, Card, Input, Label components
- Responsive dashboard layout
- Navigation with active states
- Form validation and error handling

## Usage

### Creating a Project
1. Navigate to `/projects`
2. Click "Create Project"
3. Fill in project details
4. Save to create the project

### Managing Projects
- View all projects on the dashboard
- Edit project details
- Update project status
- Delete unwanted projects

## Development Commands

```bash
# Run migrations
php artisan migrate

# Create a new model with migration
php artisan make:model ModelName -m

# Create a new controller
php artisan make:controller ControllerName --resource

# Build assets for production
npm run build

# Start development server
npm run dev
```

## Database Schema

### Projects Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  status: String, // active, completed, on_hold, cancelled
  start_date: Date,
  end_date: Date,
  budget: Decimal128,
  user_id: ObjectId,
  created_at: Date,
  updated_at: Date
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open-sourced software licensed under the MIT license.
