# Base setup for NestJs

This is a base project for Kiss Loyalty it includes following features

## Features

- Authentication with JWT
- Authorization
- githooks pre and post / eslinter
- Rate limiter
- User / Role / Permission crud
- Custom logger
- Docker file

## Run Locally

Clone the project

```bash
  git clone https://github.com/techbucks/loyalty-backend.git
```

Go to the project directory

```bash
  cd loyalty-backend
```

Node Version : `v23.5.0`
NestJs Version : `10.4.5`

Install [Docker](https://docs.docker.com/engine/install/ubuntu/)

Run Server

```bash
  docker compose up -d
```

SQL schema

```bash
 use base-setup.sql file
```

## Custom logger output

<img width="1281" alt="image" src="https://github.com/user-attachments/assets/ac098d60-93f7-4e49-9a5b-cc5443f3df2f" />

## Folder structure

<img width="255" alt="image" src="https://github.com/user-attachments/assets/737ac482-39e3-4bc0-81e3-f8e5bffb3f21" />

## Environment Variables

All environment variables are defined in app.config.js with default values. These variables will be exported and consistently used throughout the application. This approach eliminates the need to remember variable names and ensures uniformity across the app.

`DB_TYPE`

`MYSQL_HOST`

`MYSQL_USER`

`MYSQL_DB_NAME`

`DB_URL`

`JWT_SECRET`

`JWT_EXPIRY`

`RL_TTL`

`RL_LIMIT`

## Authors

- [@habibqureshi](https://github.com/habibqureshi)
