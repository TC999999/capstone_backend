DROP DATABASE IF EXISTS market_deploy;

CREATE DATABASE market_deploy;

\c market_deploy;

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS purchases;
DROP TABLE IF EXISTS item_types;
DROP TABLE IF EXISTS items_to_types;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS reports;

CREATE TABLE users(
    username TEXT NOT NULL UNIQUE PRIMARY KEY,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE CHECK (position('@' IN email) > 1),
    address TEXT NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    city TEXT NOT NULL,
    region_or_state TEXT NOT NULL,
    country TEXT NOT NULL,
    latitude TEXT,
    longitude TEXT,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    is_flagged BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE items(
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    image_url TEXT,
    initial_price INTEGER CHECK (initial_price >= 0) NOT NULL,
    condition TEXT NOT NULL,
    description TEXT NOT NULL,
    seller_username TEXT NOT NULL REFERENCES users ON DELETE CASCADE,
    is_sold BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE purchases(
    id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL UNIQUE REFERENCES items,
    username TEXT NOT NULL REFERENCES users,
    final_price INTEGER CHECK (final_price >= 0) NOT NULL,
    exchange_method TEXT NOT NULL,
    sale_made timestamp with time zone NOT NULL
);

CREATE TABLE item_types(
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE items_to_types(
    id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES items,
    type_id INTEGER NOT NULL REFERENCES item_types 
);

CREATE TABLE messages(
    id SERIAL PRIMARY KEY,
    to_username TEXT NOT NULL REFERENCES users,
    from_username TEXT NOT NULL REFERENCES users,
    item_id INTEGER NOT NULL REFERENCES items,
    body TEXT NOT NULL,
    sent_at timestamp with time zone NOT NULL
);

CREATE TABLE reviews(
    id SERIAL PRIMARY KEY,
    reviewed_username TEXT NOT NULL REFERENCES users,
    reviewer_username TEXT NOT NULL REFERENCES users,
    rating INTEGER NOT NULL,
    body TEXT NOT NULL,
    made_at timestamp with time zone NOT NULL
);

CREATE TABLE reports(
    id SERIAL PRIMARY KEY,
    reported_username TEXT NOT NULL REFERENCES users,
    reporter_username TEXT NOT NULL REFERENCES users,
    body TEXT NOT NULL,
    made_at timestamp with time zone NOT NULL,
    is_cleared BOOLEAN NOT NULL DEFAULT FALSE

);

INSERT INTO users 
(username, password, first_name, last_name, email, address, zip_code,
city, region_or_state, country, latitude, longitude, is_admin, is_flagged)
VALUES
('testadmin', '$2b$12$EGmCkmgZsSh38Of610hVUuamBaEgfnXLOR6/SIQTCkrVd8soAOb0y', 'test', 'admin',
'testadmin@gmail.com', '4445 Main Street', '12345', 'Los Angeles', 'California', 'United States of America', '34.74648', '-92.28959',
TRUE, FALSE);



INSERT INTO item_types (name) VALUES 
('electronics'),
('music'),
('books'),
('games'),
('automobiles'),
('toys'),
('infant care'),
('lawn care'),
('furniture'),
('movies'),
('cooking'),
('clothing'),
('art');