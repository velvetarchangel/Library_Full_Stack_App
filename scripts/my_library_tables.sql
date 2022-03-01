show databases;
-- additions: - KellyO
DROP DATABASE IF EXISTS `library`;
CREATE DATABASE `library`;

USE `library`;
SHOW TABLES;

-- remove me after you are done generating schema
SET FOREIGN_KEY_CHECKS = 0; 

-- i commented this out cause we only 'DROP TABLE' a database not the tables in the database - KellyO
-- DROP TABLE if exists item, copy_of_item, book, movies, movie_genre, production_company, director, actor, actor_acts, director_directs, author, writes;

CREATE TABLE item (
	item_id INT AUTO_INCREMENT PRIMARY KEY, 
	release_date DATE, 
	item_desc VARCHAR(255), -- may need in increase this value
	item_name VARCHAR(255), 
	availability BOOL
);

CREATE TABLE copy_of_item(
	item_barcode INT PRIMARY KEY, -- used to be INT(13), but changed to get rid of error; replace with checking ranges later
	item_id INT,
	CONSTRAINT ic_item_id FOREIGN KEY (item_id)
		references item(item_id)
);

CREATE TABLE movies (
	item_id INT,
	productionCompany VARCHAR(50), 
	imdb_id VARCHAR(20) PRIMARY KEY,
	duration int,
	CONSTRAINT item_id FOREIGN KEY (item_id)
		references item(item_id)
);
    
CREATE TABLE movie_genre (
	imdb_id VARCHAR(20),
	CONSTRAINT genre_imdb_id FOREIGN KEY (imdb_id) 
		references movies(imdb_id),
	genre VARCHAR(20) PRIMARY KEY,
    item_id INT,
	CONSTRAINT genre_item_id FOREIGN KEY (item_id)
		references item(item_id)
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
  	imdb_id VARCHAR(20),
	CONSTRAINT a_actor_id FOREIGN KEY (actor_id)
		references actor(actor_id),
  	CONSTRAINT a_imdb_id FOREIGN KEY (imdb_id)
		references movies(imdb_id),
	item_id INT,
	CONSTRAINT acts_item_id FOREIGN KEY (item_id)
		references item(item_id)
);

CREATE TABLE director_directs(
	director_id INT,
    CONSTRAINT d_director_id FOREIGN KEY (director_id)
		REFERENCES director(director_id),
	imdb_id VARCHAR(20),
  	CONSTRAINT d_imdb_id FOREIGN KEY (imdb_id)
		references movies(imdb_id),
	item_id INT,
	CONSTRAINT directs_item_id FOREIGN KEY (item_id)
		references item(item_id)
);

CREATE TABLE author (
	author_id INT AUTO_INCREMENT PRIMARY KEY,
  	author_name VARCHAR(50)
);

CREATE TABLE book (
	item_id INT,
	isbn VARCHAR(13) PRIMARY KEY,
	num_pages INT,
	publisher_name VARCHAR(255),
	book_type VARCHAR(25)
);

CREATE TABLE writes(
	author_id INT,
  	isbn VARCHAR(13),
	CONSTRAINT w_author_id FOREIGN KEY (author_id)
		references author(author_id),
	CONSTRAINT w_isbn FOREIGN KEY (isbn)
		references book(isbn),
	item_id INT,
	CONSTRAINT writes_item_id FOREIGN KEY (item_id)
		references item(item_id)
);


-- KELLY'S SECTION #####
-- check lengths of IDs; i have it set to 36
-- check lengths of user names; i have it set to 50
-- check length of comments; i have it set to 400

CREATE TABLE library_user (
    card_no VARCHAR(36) PRIMARY KEY, -- card_no is VARCHAR for now; does it make sense as an INT
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(50),
    user_password VARCHAR(50)
);

CREATE TABLE library_customer (
	card_no VARCHAR(36),-- PRIMARY KEY,
	CONSTRAINT lc_card_no FOREIGN KEY (card_no)
		REFERENCES library_user(card_no)
);

CREATE TABLE librarian (
	card_no VARCHAR(36),
	CONSTRAINT l_card_no FOREIGN KEY (card_no)
		REFERENCES library_user(card_no),
	staff_id INT PRIMARY KEY,
    start_date DATE,
    salary INT
  --  PRIMARY KEY (card_no, staff_id) removing card_no as a primary key. 
);


CREATE TABLE feedback (
	card_no VARCHAR(36),
    CONSTRAINT f_card_no FOREIGN KEY (card_no)
		REFERENCES library_user(card_no),
	feedback_id VARCHAR(36) PRIMARY KEY,
	-- PRIMARY KEY (feedback_id, card_no), removing card_no as a primary key
    user_rating INT,
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
	u_comment VARCHAR(500) PRIMARY KEY,
    item_id INT,
	CONSTRAINT uc_item_id FOREIGN KEY (item_id)
		references item(item_id)
	 -- PRIMARY KEY (card_no, feedback_id, u_comment) removing card_no, feedback_id as primary key
);

CREATE TABLE library_record (
	card_no VARCHAR(36), -- PRIMARY KEY,
	CONSTRAINT lr_card_no FOREIGN KEY (card_no)
		REFERENCES library_user(card_no),
    fines INT
);

CREATE TABLE signed_out (
	card_no VARCHAR(36),
	CONSTRAINT so_card_no FOREIGN KEY (card_no)
		REFERENCES library_user(card_no),
    item_id INT, -- PRIMARY KEY,
    CONSTRAINT so_item_id FOREIGN KEY (item_id)
		REFERENCES item(item_id),
	-- PRIMARY KEY (card_no, item_id), removing card_no as primary key
    checkout_date DATE,
    return_date DATE
);


-- Eric's stuff

CREATE TABLE coordinates ( 
	staff_id INT, -- AUTO_INCREMENT, 
    card_no VARCHAR(36), -- INT, -- AUTO_INCREMENT,
    event_id INT , -- AUTO_INCREMENT,
   -- PRIMARY KEY (staff_id, card_no, event_id),
   
    CONSTRAINT coord_staff_id FOREIGN KEY (staff_id)
    REFERENCES librarian(staff_id),
    
    CONSTRAINT coord_card_no FOREIGN KEY (card_no)
    REFERENCES library_user(card_no),
    
    CONSTRAINT coord_event_id FOREIGN KEY (event_id)
    REFERENCES lib_events(event_id)
);

CREATE TABLE hosts_event (
	event_id INT, -- AUTO_INCREMENT,
    branch_id INT , -- AUTO_INCREMENT,
   -- PRIMARY KEY (event_id, branch_id),
   
	CONSTRAINT hosts_event_id FOREIGN KEY (event_id)
    REFERENCES lib_events(event_id),
    
    CONSTRAINT hosts_branch_id FOREIGN KEY (branch_id)
    REFERENCES branch(branch_id)
);

CREATE TABLE registers (
	event_id INT, -- AUTO_INCREMENT, 
    card_no VARCHAR(36), -- INT , AUTO_INCREMENT,
  --  PRIMARY KEY (event_id, card_no),
    
	CONSTRAINT registers_event_id FOREIGN KEY (event_id)
    REFERENCES lib_events(event_id),
    
    CONSTRAINT registers_card_no FOREIGN KEY (card_no)
    REFERENCES library_user(card_no)
);

CREATE TABLE lib_events (
	event_id INT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(50), -- 50 for now
    start_date DATE,
    end_date DATE, 
    start_time TIME, 
    end_time TIME
);

CREATE TABLE event_location (
	event_id INT, -- AUTO_INCREMENT,
    location VARCHAR(50) PRIMARY KEY,
    -- PRIMARY KEY (event_id, location),
    
    CONSTRAINT event_location_id FOREIGN KEY (event_id)
    REFERENCES lib_events(event_id)
);

CREATE TABLE branch (
	branch_id INT AUTO_INCREMENT PRIMARY KEY,
    branch_name VARCHAR(50), -- 50 is a temp value
    address VARCHAR(50) -- 50 is a temp value
);

CREATE TABLE has_for_branch_and_item (
	branch_id INT, -- AUTO_INCREMENT,
    item_id INT , -- AUTO_INCREMENT,   
    item_quantity INT,
   -- PRIMARY KEY(branch_id, item_id),
    
    CONSTRAINT has_branch_id FOREIGN KEY (branch_id)
    REFERENCES branch(branch_id),
    
    CONSTRAINT has_item_id FOREIGN KEY (item_id)
    REFERENCES item(item_id)
);

CREATE TABLE places_hold (
	card_no VARCHAR(36), -- INT, -- AUTO_INCREMENT, 
    item_id INT , -- AUTO_INCREMENT, 
    hold_position INT,
    -- PRIMARY KEY (card_no, item_id),
    
    CONSTRAINT hold_card_number FOREIGN KEY (card_no)
    REFERENCES library_user(card_no),
    
    CONSTRAINT hold_item_id FOREIGN KEY (item_id)
    REFERENCES item(item_id)
);