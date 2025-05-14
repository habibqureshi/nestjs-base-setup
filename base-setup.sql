-- -- Converted PostgreSQL schema

-- -- Drop tables if they exist
-- DROP TABLE IF EXISTS role_permission;
-- DROP TABLE IF EXISTS user_roles;
-- DROP TABLE IF EXISTS permissions;
-- DROP TABLE IF EXISTS roles;
-- DROP TABLE IF EXISTS users;

-- -- Table: users
-- CREATE TABLE users (
--   id SERIAL PRIMARY KEY,
--   name VARCHAR(100),
--   email VARCHAR(100) NOT NULL UNIQUE,
--   enable BOOLEAN DEFAULT TRUE,
--   deleted BOOLEAN DEFAULT FALSE,
--   password VARCHAR(100) NOT NULL
-- );

-- -- Table: roles
-- CREATE TABLE roles (
--   id SERIAL PRIMARY KEY,
--   name VARCHAR(100) NOT NULL UNIQUE,
--   enable BOOLEAN DEFAULT TRUE,
--   deleted BOOLEAN DEFAULT FALSE
-- );

-- -- Table: permissions
-- CREATE TABLE permissions (
--   id SERIAL PRIMARY KEY,
--   name VARCHAR(100) NOT NULL UNIQUE,
--   url VARCHAR(200) NOT NULL UNIQUE
-- );

-- -- Table: role_permission
-- CREATE TABLE role_permission (
--   id SERIAL PRIMARY KEY,
--   role_id INT NOT NULL,
--   permission_id INT NOT NULL,
--   FOREIGN KEY (role_id) REFERENCES roles(id),
--   FOREIGN KEY (permission_id) REFERENCES permissions(id)
-- );

-- -- Table: user_roles
-- CREATE TABLE user_roles (
--   id SERIAL PRIMARY KEY,
--   role_id INT NOT NULL,
--   user_id INT NOT NULL,
--   FOREIGN KEY (role_id) REFERENCES roles(id),
--   FOREIGN KEY (user_id) REFERENCES users(id)
-- );


-- -- Insert into permissions
-- INSERT INTO permissions (id, name, url)
-- VALUES (1, 'root', '*');

-- -- Insert into roles
-- INSERT INTO roles (id, name, enable, deleted)
-- VALUES (1, 'root', TRUE, FALSE);

-- -- Insert into role_permission
-- INSERT INTO role_permission (id, role_id, permission_id)
-- VALUES (1, 1, 1);

-- -- Insert into users
-- INSERT INTO users (id, name, email, enable, deleted, password)
-- VALUES (1, 'admin', 'admin@example.com', TRUE, FALSE, '$2b$10$Ajmy2rO83s7er2lM5.NlweY9P8UsNrPgBEOidKiauRyAyHRAXsKoS');

-- -- Insert into user_roles
-- INSERT INTO user_roles (id, role_id, user_id)
-- VALUES (1, 1, 1);
