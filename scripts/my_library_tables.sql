show databases;
# additions: - KellyO
DROP DATABASE IF EXISTS `library`;
CREATE DATABASE `library`;

USE `library`;
SHOW TABLES;

-- remove me after you are done generating schema
SET FOREIGN_KEY_CHECKS = 0; 

# i commented this out cause we only 'DROP TABLE' a database not the tables in the database - KellyO
-- DROP TABLE if exists item, copy_of_item, book, movies, movie_genre, production_company, director, actor, actor_acts, director_directs, author, writes;

CREATE TABLE item (
	item_id INT AUTO_INCREMENT PRIMARY KEY, 
	release_date DATE, 
	item_desc VARCHAR(255), 
	item_name VARCHAR(255), 
	availability BOOL
);

CREATE TABLE copy_of_item(
	item_barcode INT(13) PRIMARY KEY,
	item_id INT,
	CONSTRAINT ic_item_id FOREIGN KEY (item_id)
		references item(item_id)
);

CREATE TABLE movies (
	item_id INT,
  pCompany VARCHAR(50), -- production company
	imdb_id VARCHAR(20) PRIMARY KEY,
	duration int,
	CONSTRAINT item_id FOREIGN KEY (item_id)
		references item(item_id)
);
    
CREATE TABLE movie_genre (
	imdb_id VARCHAR(20),
	CONSTRAINT imdb_id FOREIGN KEY (imdb_id) 
		references movies(imdb_id),
	genre VARCHAR(20) PRIMARY KEY
);

CREATE TABLE actor (
	actor_id INT AUTO_INCREMENT PRIMARY KEY,
  actor_name VARCHAR(50)
);

CREATE TABLE director(
	director_id INT AUTO_INCREMENT PRIMARY KEY,
  director_name VARCHAR(50)
);

CREATE TABLE actor_acts(
	actor_id INT,
  	imdb_id VARCHAR(13),
	CONSTRAINT a_actor_id FOREIGN KEY (actor_id)
		references actor(actor_id),
  	CONSTRAINT a_imdb_id FOREIGN KEY (imdb_id)
		references movies(imdb_id)
);

CREATE TABLE director_directs(
	director_id INT,
	imdb_id VARCHAR(13),
  	CONSTRAINT d_imdb_id FOREIGN KEY (imdb_id)
		references movies(imdb_id)
);

CREATE TABLE author (
	author_id INT AUTO_INCREMENT PRIMARY KEY,
  	author_name VARCHAR(50)
);

CREATE TABLE book (
	item_id INT,
	isbn VARCHAR(13) PRIMARY KEY,
	author_id INT,
	CONSTRAINT b_item_id FOREIGN KEY (item_id) 
		references item(item_id),
	num_pages INT,
	publisher_name VARCHAR(255),
	author_name VARCHAR(255),
	CONSTRAINT b_author_id FOREIGN KEY (author_id)
		references author(author_id)
);

CREATE TABLE writes(
	author_id INT,
  	isbn VARCHAR(13),
	CONSTRAINT w_author_id FOREIGN KEY (author_id)
		references author(author_id),
	CONSTRAINT w_isbn FOREIGN KEY (isbn)
		references book(isbn)
);


##### KELLY'S SECTION #####
-- check lengths of IDs; i have it set to 36
-- check lengths of user names; i have it set to 50
-- check length of comments; i have it set to 400

CREATE TABLE library_user (
    card_no VARCHAR(36) PRIMARY KEY, -- card_no is VARCHAR for now
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(50),
    user_password VARCHAR(20)
);

CREATE TABLE library_customer (
	card_no VARCHAR(36) PRIMARY KEY,
	CONSTRAINT lc_card_no FOREIGN KEY (card_no)
		REFERENCES library_user(card_no)
);

CREATE TABLE librarian (
	card_no VARCHAR(36),
	CONSTRAINT l_card_no FOREIGN KEY (card_no)
		REFERENCES library_user(card_no),
	staff_id INT,
    start_date VARCHAR(50),
    salary INT,
    PRIMARY KEY (card_no, staff_id)
);


CREATE TABLE feedback (
	card_no VARCHAR(36),
    CONSTRAINT f_card_no FOREIGN KEY (card_no)
		REFERENCES library_user(card_no),
	feedback_id VARCHAR(36),
	PRIMARY KEY (feedback_id, card_no),
    user_rating INT,
    user_comment VARCHAR(400),
    item_id INT,
    CONSTRAINT f_item_id FOREIGN KEY (item_id)
		REFERENCES item(item_id)
);

CREATE TABLE user_comments ( 
	card_no VARCHAR(36),
    CONSTRAINT uc_card_no FOREIGN KEY (card_no)
		REFERENCES library_user(card_no),
    feedback_id VARCHAR(36),
	CONSTRAINT uc_feedback_id FOREIGN KEY (feedback_id)
		REFERENCES feedback(feedback_id),
	u_comment VARCHAR(400),
	PRIMARY KEY (card_no, feedback_id, u_comment)
);

CREATE TABLE library_record (
	card_no VARCHAR(36) PRIMARY KEY,
	CONSTRAINT lr_card_no FOREIGN KEY (card_no)
		REFERENCES library_user(card_no),
    fines INT
);

CREATE TABLE signed_out (
	card_no VARCHAR(36),
	CONSTRAINT so_card_no FOREIGN KEY (card_no)
		REFERENCES library_user(card_no),
    item_id INT,
    CONSTRAINT so_item_id FOREIGN KEY (item_id)
		REFERENCES item(item_id),
	PRIMARY KEY (card_no, item_id),
    checkout_date VARCHAR(50),
    return_date VARCHAR(50)
);