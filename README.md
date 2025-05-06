# Backend

All the apis were built using [Nest js](https://github.com/nestjs/nest) framework.

## Requirements :

- [Node v22.15.0](https://nodejs.org/en/download)
- [PostgreSQL v16](https://www.postgresql.org/)
- [pnpm v8.15.4](https://pnpm.io/installation)

## Pre-requisites :

- Install Node.js v22.15.0 and enable pnpm using corepack:
  ```bash
  corepack enable pnpm
  ```
- Create a postgreSQL Database and setup the database.

## Getting Started :

### API Repository Setup :

- Clone the repository :

  ```bash
  $ git clone <Repository Path>

  $ cd <Repository Path>
  ```

- Installation :

  ```bash
  $ pnpm install
  ```

- Setup/Create **.env** file in the root directory of the project with all the mentioned variables in the [`.example.env`](.example.env) file.

### Setup Database

- Add Database specific environment variables into **.env** file:
  ```
  DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
  ```

- Run following command to create database tables:
  ```bash
  pnpm prisma:migrate
  ```

- How to create new migrations:
  - Update the model in `prisma/schema.prisma`
  - Generate migration file based on schema changes:
    ```bash
    pnpm prisma:migrate
    ```
  - The migration will be applied automatically. To deploy migrations in production:
    ```bash
    pnpm prisma:deploy
    ```

- To reset database (Warning: This will delete all data):
  ```bash
  pnpm db:reset
  ```

- To open Prisma Studio (database GUI):
  ```bash
  pnpm prisma:studio
  ```

### Start Development Environment

- Run following command to start dev environment.
  ```bash
  $ pnpm dev
  ```

### Try It :

- Invoke the example of REST endpoints via swagger `http://localhost:{PORT}/docs`
- Access the health check api `curl http://localhost:{PORT}/api/v1/healthCheck`
