# NestJS Boilerplate 🚀

[![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white)](https://swagger.io/)

A robust and scalable NestJS boilerplate with PostgreSQL, Prisma ORM, and comprehensive API documentation. This project provides a solid foundation for building modern backend applications with TypeScript.

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Requirements](#-requirements)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Database Setup](#-database-setup)
- [Development](#-development)
- [Testing](#-testing)
- [API Documentation](#-api-documentation)
- [Health Check](#-health-check)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## ⚡ Quick Start

Get up and running:

### Prerequisites Check

```bash
# Check if Node.js is installed (requires v18+ or v20+)
node --version

# Check if PostgreSQL is running
psql --version
```

### 1. Clone and Install

```bash
git clone <repository-url>
cd nestjs-boilerplate
npm install
```

### 2. Database Setup

```bash
# Create a new PostgreSQL database
createdb nestjs_boilerplate

# Copy environment file
cp .env.example .env
```

### 3. Configure Environment

Edit `.env` file with your database credentials:

```env
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/nestjs_boilerplate
```

### 4. Initialize Database

```bash
# Generate Prisma client and run migrations
npm run prisma:generate
npm run prisma:migrate
```

### 5. Start Development Server

```bash
npm run dev
```

🎉 **That's it!** Your app is running at `http://localhost:3000`

- **API Documentation**: `http://localhost:3000/docs`
- **Health Check**: `http://localhost:3000/api/v1/health`

---

## 🛠 Requirements

Before getting started, ensure you have the following installed:

- **[Volta](https://volta.sh/)** for Node.js version management
- **[PostgreSQL v16](https://www.postgresql.org/)** or higher
- **npm** (comes with Node.js)
- **Git** for version control

### Optional Tools

- **[Docker](https://www.docker.com/)** for containerized development
- **[Postman](https://www.postman.com/)** or similar API testing tool

## ✨ Features

- 🏗️ **NestJS Framework** - Progressive Node.js framework
- 🗃️ **PostgreSQL** - Robust relational database
- 🔍 **Prisma ORM** - Type-safe database client
- 📚 **Swagger/OpenAPI** - Interactive API documentation
- 🧪 **Testing Setup** - Unit and integration tests
- 🔧 **Environment Configuration** - Flexible environment management
- 📊 **Health Check** - Application monitoring endpoint
- 🚀 **Production Ready** - Optimized for deployment

## 📁 Project Structure

```
├── src/
│   ├── common/                     # Shared utilities and decorators
│   ├── config/                     # Configuration modules
│   ├── database/                   # Database module
│   │   ├── migrations/               # Database migration files
│   │   ├── schema.prisma             # Database schema definition
│   │   └── prisma.service.ts/        # Prisma Service File
│   ├── modules/                    # Feature modules
│   │   ├── auth/                     # Authentication module
│   │   └── users/                    # User management module
│   ├── core/                       # Core utilities and decorators
│   │   ├── class/                    # Base classes and abstract implementations
│   │   ├── decorators/               # Custom decorators for enhanced functionality
│   │   ├── guards/                   # Authentication and Authorization guards
│   │   ├── interceptors/             # Request/response transformation interceptors
│   │   ├── interfaces/               # Typescript interfaces for type safety
│   │   └── middleware/               # Custom middleware functions
│   ├── guards/                     # Authentication & authorization guards
│   ├── interceptors/               # Request/response interceptors
│   ├── pipes/                      # Validation pipes
│   ├── filters/                    # Exception filters
│   ├── app.module.ts               # Root application module
│   └── main.ts                     # Application entry point
├── test/                         # Test files (e2e, unit)
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore rules
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # Project documentation
```

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd nestjs-boilerplate
```

### 2. Install Dependencies

```bash
npm install
```

**Note**: If you have Volta installed, the correct Node.js and npm versions will be automatically selected when you enter the project directory.

### 3. Environment Configuration

Create a `.env` file in the root directory and copy the contents from `.env.example`:

```bash
cp .env.example .env
```

Update the environment variables in `.env` file according to your setup:

```env
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public

# JWT (if using authentication)
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Other configurations...
```

### 4. Local Development Setup

#### Option A: Using Local PostgreSQL

1. **Install PostgreSQL** (if not already installed):

   ```bash
   # macOS with Homebrew
   brew install postgresql@16
   brew services start postgresql@16

   # Ubuntu/Debian
   sudo apt-get install postgresql-16
   sudo systemctl start postgresql

   # Windows - Download from https://www.postgresql.org/download/windows/
   ```

2. **Create Database**:

   ```bash
   # Connect to PostgreSQL
   psql postgres

   # Create database and user
   CREATE DATABASE nestjs_boilerplate;
   CREATE USER nestjs_user WITH ENCRYPTED PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE nestjs_boilerplate TO nestjs_user;
   \q
   ```

3. **Update .env file**:

   ```env
   DATABASE_URL=postgresql://nestjs_user:your_password@localhost:5432/nestjs_boilerplate?schema=public
   ```

#### Option B: Using Docker (Alternative)

```bash
# Start PostgreSQL with Docker
docker run --name nestjs-postgres \
  -e POSTGRES_DB=nestjs_boilerplate \
  -e POSTGRES_USER=nestjs_user \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:16

# Update .env file
DATABASE_URL=postgresql://nestjs_user:your_password@localhost:5432/nestjs_boilerplate?schema=public
```

### 5. Verify Your Setup

After completing the setup, verify everything is working:

```bash
# Check database connection
npm run prisma:studio

# Run health check
curl http://localhost:3000/api/v1/health

# Test API endpoints
curl http://localhost:3000/api/v1/users
```

### 🔧 Troubleshooting

#### Common Issues and Solutions

1. **Database Connection Error**:

   ```bash
   # Check if PostgreSQL is running
   brew services list | grep postgresql  # macOS
   sudo systemctl status postgresql      # Linux

   # Check connection manually
   psql $DATABASE_URL
   ```

2. **Port Already in Use**:

   ```bash
   # Find process using port 3000
   lsof -i :3000

   # Kill the process or change PORT in .env
   PORT=3001
   ```

3. **Prisma Client Not Generated**:

   ```bash
   npm run prisma:generate
   ```

4. **Migration Issues**:

   ```bash
   # Reset database (⚠️ This deletes all data)
   npm run db:reset

   # Or create a new migration
   npm run prisma:migrate
   ```

### 🌟 Next Steps

Once your local environment is running:

1. **Explore the API**: Visit `http://localhost:3000/docs` for Swagger documentation
2. **Run Tests**: Execute `npm run test` to ensure everything works
3. **Start Coding**: Check out the project structure and start building features
4. **Database Management**: Use `npm run prisma:studio` for a visual database editor

## 🗄️ Database Setup

### Prerequisites

Ensure PostgreSQL is running and you have created a database for the project.

### 1. Configure Database Connection

Add your database connection string to the `.env` file:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/your_database_name?schema=public
```

### 2. Run Database Migrations

Generate and apply database tables:

```bash
npm run prisma:migrate
```

### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

## 📊 Database Migration Commands

### Creating New Migrations

1. **Update the schema**: Modify `prisma/schema.prisma`
2. **Generate migration**:

   ```bash
   npm run prisma:migrate
   ```

### Available Migration Commands

| Command                   | Description                          |
| ------------------------- | ------------------------------------ |
| `npm run prisma:migrate`  | Create and apply new migration       |
| `npm run prisma:deploy`   | Deploy migrations in production      |
| `npm run prisma:generate` | Generate Prisma client               |
| `npm run prisma:studio`   | Open Prisma Studio (Database GUI)    |
| `npm run db:reset`        | ⚠️ Reset database (deletes all data) |
| `npm run db:seed`         | Seed database with initial data      |

### Production Deployment

```bash
npm run prisma:deploy
```

## 🔧 Development

### Start Development Server

```bash
npm run dev
```

The application will start on `http://localhost:3000` (or the port specified in your `.env` file).

### Available Scripts

| Script               | Description                              |
| -------------------- | ---------------------------------------- |
| `npm run dev`        | Start development server with hot reload |
| `npm run build`      | Build the application for production     |
| `npm run start`      | Start production server                  |
| `npm run start:prod` | Start production server (optimized)      |
| `npm run lint`       | Run ESLint                               |
| `npm run lint:fix`   | Fix ESLint issues automatically          |
| `npm run format`     | Format code with Prettier                |

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode for development
npm run test:watch
```

### Testing Strategy

- **Unit Tests**: Test individual components and services
- **Integration Tests**: Test module interactions
- **E2E Tests**: Test complete API endpoints

### Writing Tests

Follow these conventions when writing tests:

```typescript
// Unit test example
describe('UserService', () => {
  it('should create a user', async () => {
    // Test implementation
  });
});

// E2E test example
describe('Users (e2e)', () => {
  it('/users (POST)', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send(createUserDto)
      .expect(201);
  });
});
```

## 📖 API Documentation

### Swagger Documentation

Access the interactive API documentation:

```
http://localhost:{PORT}/docs
```

### API Endpoints

| Method   | Endpoint            | Description    |
| -------- | ------------------- | -------------- |
| `GET`    | `/api/v1/health`    | Health check   |
| `GET`    | `/api/v1/users`     | Get all users  |
| `POST`   | `/api/v1/users`     | Create user    |
| `GET`    | `/api/v1/users/:id` | Get user by ID |
| `PUT`    | `/api/v1/users/:id` | Update user    |
| `DELETE` | `/api/v1/users/:id` | Delete user    |

### Using Swagger

1. Start the development server
2. Navigate to `http://localhost:{PORT}/docs`
3. Explore and test API endpoints directly in the browser

## 🏥 Health Check

### Health Check Endpoint

Monitor application health:

```bash
curl http://localhost:3000/api/v1/health
```

Expected response:

```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    }
  }
}
```

### Health Check Features

- Database connectivity check
- Memory usage monitoring
- Disk space monitoring
- Custom health indicators

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run start:prod
```

### Environment Variables for Production

Ensure the following environment variables are set:

```env
NODE_ENV=production
DATABASE_URL=your-production-database-url
JWT_SECRET=your-production-jwt-secret
```

### Deployment Platforms

This boilerplate is ready for deployment on:

- **Heroku**
- **Vercel**
- **AWS**
- **DigitalOcean**
- **Docker containers**

## 🤝 Contributing

### Development Guidelines

1. **Code Style**: Follow the existing code style and use Prettier for formatting
2. **Commit Messages**: Use conventional commit messages
3. **Testing**: Write tests for new features and bug fixes
4. **Documentation**: Update documentation for API changes

### Folder Structure Conventions

When adding new features:

1. **Modules**: Create new modules in `src/modules/`
2. **DTOs**: Place data transfer objects in module-specific folders
3. **Guards**: Add authentication guards in `src/guards/`
4. **Interceptors**: Add interceptors in `src/interceptors/`
5. **Tests**: Mirror the source structure in `test/` directory

### Example Module Structure

```
src/modules/example/
├── dto/
│   ├── create-example.dto.ts
│   └── update-example.dto.ts
├── messages/
│   ├── success.message.ts
│   ├── error.message.ts
│   └── index.ts
├── example.repository.ts
├── example.repository.spec.ts
├── example.controller.ts
├── example.controller.spec.ts
├── example.service.ts
├── example.service.spec.ts
└── example.module.ts
```

## 📝 Future Enhancements

This boilerplate can be extended with:

- **Authentication & Authorization** (JWT, OAuth2)
- **Rate Limiting**
- **Caching** (Redis)
- **File Upload** (AWS S3, Cloudinary)
- **Email Service** (SendGrid, Nodemailer)
- **Background Jobs** (Bull Queue)
- **WebSocket Support**
- **Microservices Architecture**
- **API Versioning**
- **Logging & Monitoring** (Winston, Prometheus)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

If you encounter any issues or have questions:

1. Check the [documentation](#-table-of-contents)
2. Search existing [issues](link-to-issues)
3. Create a new issue with detailed information

---
