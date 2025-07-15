# Backend

All the apis were built using [Nest js](https://github.com/nestjs/nest) framework.

## Requirements :

- [Volta](https://volta.sh/) for Node.js version management (or Node v22.15.0)
- [PostgreSQL v16](https://www.postgresql.org/)

## Pre-requisites :

- Install [Volta](https://volta.sh/) for automatic Node.js version management, or manually install Node.js v22.15.0
- Create a postgreSQL Database and setup the database.

**Note**: If you have Volta installed, the correct Node.js and npm versions will be automatically selected when you enter the project directory.

## Getting Started :

### API Repository Setup :

- Clone the repository :

  ```bash
  $ git clone <Repository Path>

  $ cd <Repository Path>
  ```

- Installation :

  ```bash
  $ npm install
  ```

- Setup/Create **.env** file in the root directory of the project with all the mentioned variables in the [`.example.env`](.example.env) file.

### Setup Database

- Add Database specific environment variables into **.env** file:
  ```
  DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
  ```

- Run following command to create database tables:
  ```bash
  npm run prisma:migrate
  ```

- How to create new migrations:
  - Update the model in `prisma/schema.prisma`
  - Generate migration file based on schema changes:
    ```bash
    npm run prisma:migrate
    ```
  - The migration will be applied automatically. To deploy migrations in production:
    ```bash
    npm run prisma:deploy
    ```

- To reset database (Warning: This will delete all data):
  ```bash
  npm run db:reset
  ```

- To open Prisma Studio (database GUI):
  ```bash
  npm run prisma:studio
  ```

### Start Development Environment

- Run following command to start dev environment.
  ```bash
  $ npm run dev
  ```

### Try It :

- Invoke the example of REST endpoints via swagger `http://localhost:{PORT}/docs`
- Access the health check api `curl http://localhost:{PORT}/api/v1/healthCheck`
