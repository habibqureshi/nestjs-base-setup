# Base setup for fastapi

This is a base project for nestjs it includes following features

## Features

- Authentication with JWT
- Authorization
- Rate limiter
- User / Role / Permission crud
- Custom logger
- Docker file

## Run Locally

Clone the project

```bash
  git clone https://github.com/habibqureshi/nestjs-base-setup.git
```

Go to the project directory

```bash
  cd nestjs-base-setup
```

Python Version : `v23.5.0`
NestJs Version : `10.4.5`

Install dependencies

```bash
  npm i
```


Start the server

```bash
  npm run start:dev 
```

SQL schema

```bash
 use base-setup.sql file
```

## Running on Docker

Build image

```bash
   docker build -t nestjsbase .
```

Run container

```bash
  docker run -p 3000:3000 nestjsbase
```

Run container in background

```bash
  docker run -d -p 3000:3000 nestjsbase
```

Run container in background with env

```bash
  docker run -e VARIABLE=VALUE -d -p 3000:3000 nestjsbase
```

## Custom logger output

<img width="1025" alt="image" src="https://github.com/user-attachments/assets/0fa3311e-bf40-4074-95cd-2c980f3ebe0c" />


## Folder structure

![image](https://github.com/user-attachments/assets/090782e1-acc7-490b-9266-551b97c84884)

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
