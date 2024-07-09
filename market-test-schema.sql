DROP DATABASE IF EXISTS market_test;

CREATE DATABASE market_test;

\c market_test;

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
    item_id INTEGER NOT NULL UNIQUE REFERENCES items ON DELETE CASCADE,
    username TEXT NOT NULL REFERENCES users ON DELETE CASCADE,
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
    item_id INTEGER NOT NULL REFERENCES items ON DELETE CASCADE,
    type_id INTEGER NOT NULL REFERENCES item_types ON DELETE CASCADE
);

CREATE TABLE messages(
    id SERIAL PRIMARY KEY,
    to_username TEXT NOT NULL REFERENCES users ON DELETE CASCADE,
    from_username TEXT NOT NULL REFERENCES users ON DELETE CASCADE,
    item_id INTEGER NOT NULL REFERENCES items ON DELETE CASCADE,
    body TEXT NOT NULL,
    sent_at timestamp with time zone NOT NULL
);

CREATE TABLE reviews(
    id SERIAL PRIMARY KEY,
    reviewed_username TEXT NOT NULL REFERENCES users ON DELETE CASCADE,
    reviewer_username TEXT NOT NULL REFERENCES users ON DELETE CASCADE,
    rating INTEGER NOT NULL,
    body TEXT NOT NULL,
    made_at timestamp with time zone NOT NULL
);

CREATE TABLE reports(
    id SERIAL PRIMARY KEY,
    reported_username TEXT NOT NULL REFERENCES users ON DELETE CASCADE,
    reporter_username TEXT NOT NULL REFERENCES users ON DELETE CASCADE,
    body TEXT NOT NULL,
    made_at timestamp with time zone NOT NULL,
    is_cleared BOOLEAN NOT NULL DEFAULT FALSE

);

