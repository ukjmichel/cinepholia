# Environment Configuration

This project uses environment variables for configuration. Create a `.env` file in the root directory with the following variables:

t ### Required Environment Variables

The application requires the following environment variables to be set in your `.env` file:

```
# Application Environment
NODE_ENV=development    # Use 'production' for production environment
PORT=3000               # Port the Node.js application will listen on

# Database Configuration
DB_HOST=mysql           # Database host (use 'mysql' for Docker setup)
DB_PORT=3306            # Database port inside the container
DB_USER=root            # Database user
DB_PASSWORD=root_password  # Database password (change this in production!)
DB_NAME=mysql_db        # Database name

# MySQL Configuration
MYSQL_ROOT_PASSWORD=root_password  # Must match DB_PASSWORD
MYSQL_DATABASE=mysql_db            # Must match DB_NAME

# External Ports (for host machine)
HOST_APP_PORT=3000      # Port exposed on host for the application
HOST_MYSQL_PORT=3312    # Port exposed on host for MySQL
```

### Environment Configurations for Different Environments

You can maintain different environment configurations for different environments:

1. **Development**: Use the values shown above
2. **Testing**: Create a `.env.test` file with appropriate test values
3. **Production**: Create a `.env.prod` file with secure passwords and appropriate settings

**Example for production:**

```
NODE_ENV=production
PORT=3000
DB_HOST=mysql
DB_PORT=3306
DB_USER=production_user
DB_PASSWORD=strong_secure_password
DB_NAME=production_db
MYSQL_ROOT_PASSWORD=strong_secure_password
MYSQL_DATABASE=production_db
HOST_APP_PORT=80
HOST_MYSQL_PORT=3306
```

### Using Environment Variables

The application uses the `dotenv` package to load these variables. You don't need to modify any code to use them - just reference them in your code via `process.env.VARIABLE_NAME`.

### Security Notes

- Never commit your `.env` file to version control
- Use different passwords for different environments
- In production, use long, complex passwords
- Consider using a secrets management system for production deployments

# Docker and Docker Compose Commands Reference

## NPM Commands

| Command                                   | Description                 |
| ----------------------------------------- | --------------------------- |
| `docker compose exec app npm run build`   | Build the project           |
| `docker compose exec app npm run start`   | Start the project           |
| `docker compose exec app npm run deploy`  | Build and start the project |
| `docker compose exec app npm run test`    | Run tests                   |
| `docker compose exec app npm run dev`     | Start in dev mode           |
| `docker compose exec app npm run restart` | Restart dev server          |
| `docker compose exec app npm run clean`   | Clean pm2 process           |

## Basic Commands

| Command                     | Description                                       |
| --------------------------- | ------------------------------------------------- |
| `docker compose up`         | Start containers defined in docker-compose.yml    |
| `docker compose up -d`      | Start containers in detached (background) mode    |
| `docker compose up --build` | Start containers after building/rebuilding images |
| `docker compose down`       | Stop and remove containers, networks, and volumes |
| `docker compose logs`       | View output from all containers                   |
| `docker compose logs -f`    | Follow log output from all containers             |
| `docker compose logs app`   | View logs for only the app service                |
| `docker compose stop`       | Stop containers without removing them             |
| `docker compose start`      | Start previously stopped containers               |
| `docker compose restart`    | Restart all services                              |
| `docker compose ps`         | List containers and their status                  |

## Container Execution

| Command                                      | Description                                |
| -------------------------------------------- | ------------------------------------------ |
| `docker compose exec app sh`                 | Open a shell in the app container          |
| `docker compose exec mysql sh`               | Open a shell in the MySQL container        |
| `docker compose exec app node -v`            | Check Node.js version in the app container |
| `docker compose exec mysql mysql -u root -p` | Access MySQL CLI                           |

## PM2 Management via Docker

| Command                                   | Description                                           |
| ----------------------------------------- | ----------------------------------------------------- |
| `docker compose exec app pm2 list`        | List all PM2 processes                                |
| `docker compose exec app pm2 show api`    | Show detailed information about the API process       |
| `docker compose exec app pm2 logs`        | Show PM2 logs                                         |
| `docker compose exec app pm2 logs api`    | Show logs for the API process only                    |
| `docker compose exec app pm2 restart all` | Restart all PM2 processes                             |
| `docker compose exec app pm2 stop all`    | Stop all PM2 processes                                |
| `docker compose exec app pm2 start all`   | Start all PM2 processes                               |
| `docker compose exec app pm2 reload all`  | Zero-downtime reload of all processes                 |
| `docker compose exec app pm2 monit`       | Monitor PM2 processes (requires interactive terminal) |

## Docker Image Management

| Command                           | Description                            |
| --------------------------------- | -------------------------------------- |
| `docker images`                   | List all Docker images                 |
| `docker rmi node_base_config-app` | Remove the app image                   |
| `docker compose build app`        | Build only the app service             |
| `docker compose pull`             | Pull the latest versions of all images |

## Volume Management

| Command                                             | Description                                 |
| --------------------------------------------------- | ------------------------------------------- |
| `docker volume ls`                                  | List all volumes                            |
| `docker volume inspect node_base_config_mysql_data` | Show details about the MySQL data volume    |
| `docker volume rm node_base_config_mysql_data`      | Remove the MySQL data volume (destructive!) |

## Development Workflow

| Command                                           | Description                             |
| ------------------------------------------------- | --------------------------------------- |
| `docker compose up -d`                            | Start the environment in the background |
| `docker compose exec app npm install new-package` | Install a new npm package               |
| `docker compose exec app npm run build`           | Run the build script                    |
| `docker compose exec app npm test`                | Run tests                               |
| `docker compose exec app npm run dev`             | Run the dev script                      |
