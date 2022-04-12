show databases;
DROP DATABASE IF EXISTS `library`;
CREATE DATABASE `library`;

USE `library`;
SHOW TABLES;

-- remove me after you are done generating schema
SET FOREIGN_KEY_CHECKS = 0; 

DROP TABLE IF EXISTS item;
DROP TABLE IF EXISTS copy_of_item;
DROP TABLE IF EXISTS book;
DROP TABLE IF EXISTS movies;
DROP TABLE IF EXISTS movie_genre;
DROP TABLE IF EXISTS director;
DROP TABLE IF EXISTS actor;
DROP TABLE IF EXISTS actor_acts;
DROP TABLE IF EXISTS director_directs;
DROP TABLE IF EXISTS author;
DROP TABLE IF EXISTS writes;
DROP TABLE IF EXISTS library_user;
DROP TABLE IF EXISTS librarian;
-- DROP TABLE IF EXISTS library_customer;
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS signed_out;
DROP TABLE IF EXISTS coordinates;
DROP TABLE IF EXISTS hosts_event;
DROP TABLE IF EXISTS registers;
DROP TABLE IF EXISTS lib_events;
DROP TABLE IF EXISTS branch;
DROP TABLE IF EXISTS has_for_branch_and_item;
DROP TABLE IF EXISTS places_hold;

CREATE TABLE item (
	item_id INT AUTO_INCREMENT PRIMARY KEY, 
	release_date DATE, 
	item_desc VARCHAR(1000), -- may need in increase this value
	item_name VARCHAR(255), 
	item_availability BOOL -- changed name from availability
);

CREATE TABLE copy_of_item (
	item_barcode INT PRIMARY KEY, -- used to be INT(13), but changed to get rid of error; replace with checking ranges later
	item_id INT,
	CONSTRAINT ic_item_id FOREIGN KEY (item_id)
	references item(item_id)
);

CREATE TABLE movies (
	item_id INT,
	production_company VARCHAR(50), 
	imdb_id VARCHAR(20) PRIMARY KEY,
	duration int,
	CONSTRAINT item_id FOREIGN KEY (item_id)
		references item(item_id)
);
    
CREATE TABLE movie_genre (
	imdb_id VARCHAR(20),
	CONSTRAINT genre_imdb_id FOREIGN KEY (imdb_id) 
		references movies(imdb_id),
	genre VARCHAR(20),
    item_id INT,
	CONSTRAINT genre_item_id FOREIGN KEY (item_id)
		references item(item_id),
	CONSTRAINT pk_movie_genre PRIMARY KEY (imdb_id, genre, item_id)
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
		references item(item_id),
	CONSTRAINT pk_actor_acts PRIMARY KEY (actor_id,imdb_id,item_id)
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
		references item(item_id),
	CONSTRAINT pk_director_directs PRIMARY KEY (director_id,imdb_id,item_id)
);

CREATE TABLE author (
	author_id INT AUTO_INCREMENT PRIMARY KEY,
  	author_name VARCHAR(50)
);

CREATE TABLE book (
	item_id INT,
	isbn VARCHAR(10) PRIMARY KEY,
	publisher_name VARCHAR(255),
	book_type VARCHAR(25)
);

CREATE TABLE writes(
	author_id INT,
  	isbn VARCHAR(10),
	CONSTRAINT w_author_id FOREIGN KEY (author_id)
		references author(author_id),
	CONSTRAINT w_isbn FOREIGN KEY (isbn)
		references book(isbn),
	item_id INT,
	CONSTRAINT writes_item_id FOREIGN KEY (item_id)
		references item(item_id),
	CONSTRAINT pk_writes PRIMARY KEY (author_id,isbn,item_id)
);

CREATE TABLE library_user (
    card_no VARCHAR(36) PRIMARY KEY, -- card_no is VARCHAR for now; does it make sense as an INT
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(50),
    user_password VARCHAR(50),
		isLibrarian BOOLEAN
);

-- CREATE TABLE library_customer (
-- 	card_no VARCHAR(36) NOT NULL,-- PRIMARY KEY,
-- 	CONSTRAINT lc_card_no FOREIGN KEY (card_no)
-- 		REFERENCES library_user(card_no)
-- );

CREATE TABLE librarian (
	card_no VARCHAR(36) NOT NULL,
	CONSTRAINT l_card_no FOREIGN KEY (card_no)
		REFERENCES library_user(card_no),
	staff_id INT NOT NULL,
    staff_start_date DATE,
    salary FLOAT,
    CONSTRAINT PK_librarian PRIMARY KEY (card_no, staff_id) 
);


CREATE TABLE feedback (
	card_no VARCHAR(36),
    CONSTRAINT f_card_no FOREIGN KEY (card_no)
		REFERENCES library_user(card_no),
	feedback_id VARCHAR(36) NOT NULL,
	CONSTRAINT pk_feedback PRIMARY KEY (feedback_id, card_no, item_id),
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
	u_comment VARCHAR(500) NOT NULL,
    item_id INT,
	CONSTRAINT uc_item_id FOREIGN KEY (item_id)
		references item(item_id),
	CONSTRAINT pk_user_comments PRIMARY KEY (card_no, feedback_id, u_comment, item_id)
);

CREATE TABLE library_record (
	card_no VARCHAR(36) NOT NULL, -- PRIMARY KEY,
	CONSTRAINT lr_card_no FOREIGN KEY (card_no)
		REFERENCES library_user(card_no),
    fines INT
);

CREATE TABLE signed_out (
	card_no VARCHAR(36),
	CONSTRAINT so_card_no FOREIGN KEY (card_no)
		REFERENCES library_user(card_no),
    item_id INT NOT NULL, -- PRIMARY KEY,
    CONSTRAINT so_item_id FOREIGN KEY (item_id)
		REFERENCES item(item_id),
	item_barcode INT,
	CONSTRAINT so_item_barcode FOREIGN KEY (item_barcode)
    REFERENCES copy_of_item(item_barcode),
	CONSTRAINT pk_signed_out PRIMARY KEY (card_no, item_id, item_barcode),
	
    checkout_date DATE,
    return_date DATE
);



CREATE TABLE coordinates ( 
	card_no VARCHAR(36) NOT NULL, -- INT, -- AUTO_INCREMENT,
	staff_id INT NOT NULL, -- AUTO_INCREMENT, 
    event_id INT NOT NULL, -- AUTO_INCREMENT,
   
    -- CONSTRAINT coord_staff_id FOREIGN KEY (staff_id)
    -- REFERENCES librarian(staff_id),
    
    -- CONSTRAINT coord_card_no FOREIGN KEY (card_no)
    -- REFERENCES library_user(card_no),
	
	CONSTRAINT card_staff_FK FOREIGN KEY (card_no, staff_id) REFERENCES librarian (card_no, staff_id),
    
    CONSTRAINT coord_event_id FOREIGN KEY (event_id)
    REFERENCES lib_events(event_id),
	
	CONSTRAINT PK_coordinates PRIMARY KEY (card_no, staff_id, event_id)
);

CREATE TABLE hosts_event (
	event_id INT, -- AUTO_INCREMENT,
    branch_id INT , -- AUTO_INCREMENT,
    CONSTRAINT PK_hosts_event PRIMARY KEY (event_id, branch_id),
   
	CONSTRAINT hosts_event_id FOREIGN KEY (event_id)
    REFERENCES lib_events(event_id),
    
    CONSTRAINT hosts_branch_id FOREIGN KEY (branch_id)
    REFERENCES branch(branch_id)
);

CREATE TABLE registers (
	event_id INT,
    card_no VARCHAR(36),
    CONSTRAINT PK_registers PRIMARY KEY (event_id, card_no),
    
	CONSTRAINT registers_event_id FOREIGN KEY (event_id)
    REFERENCES lib_events(event_id),
    
    CONSTRAINT registers_card_no FOREIGN KEY (card_no)
    REFERENCES library_user(card_no)
);

CREATE TABLE lib_events (
	event_id INT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(100), -- 100 for now
    event_start_date DATE,
    end_date DATE, 
    start_time TIME, 
    end_time TIME
);

CREATE TABLE event_location (
	event_id INT,
    e_location VARCHAR(50),
    CONSTRAINT PK_event_location PRIMARY KEY (event_id, e_location),
    
    CONSTRAINT event_location_id FOREIGN KEY (event_id)
    REFERENCES lib_events(event_id)
);

CREATE TABLE branch (
	branch_id INT AUTO_INCREMENT PRIMARY KEY,
    branch_name VARCHAR(100),
    branch_address VARCHAR(100)
);

CREATE TABLE has_for_branch_and_item (
	branch_id INT,
    item_id INT,   
    item_barcode INT,
	item_availability BOOLEAN,
    CONSTRAINT PK_has_for_bai PRIMARY KEY(branch_id, item_id, item_barcode),
    
    CONSTRAINT has_branch_id FOREIGN KEY (branch_id)
    REFERENCES branch(branch_id),
    
    CONSTRAINT has_item_id FOREIGN KEY (item_id)
    REFERENCES item(item_id),
    
    CONSTRAINT has_item_barcode FOREIGN KEY (item_barcode)
    REFERENCES copy_of_item(item_barcode)
);

CREATE TABLE places_hold (
	card_no VARCHAR(36), -- INT, -- AUTO_INCREMENT, 
    item_id INT , -- AUTO_INCREMENT, 
    hold_position INT,
    CONSTRAINT pk_places_hold PRIMARY KEY (card_no, item_id),
    
    CONSTRAINT hold_card_number FOREIGN KEY (card_no)
    REFERENCES library_user(card_no),
    
    CONSTRAINT hold_item_id FOREIGN KEY (item_id)
    REFERENCES item(item_id)
);


-- Real data for the database
-- card_no: 10 digits
INSERT INTO library_user (card_no, first_name, last_name, email, user_password, isLibrarian)
VALUES
(1234567890, 'Kawhi', 'Leonard', 'kawhi@hotmail.com', 'abc', 0),
(2346271619, 'Leonardo', 'Dicaprio', 'leo@gmail.com', 'abc', 0),
(7920625716, 'Margot', 'Robbie', 'margot@outlook.com', 'abc', 0),
(8426482051, 'Paul', 'George', 'paulGeorge@hotmail.com', 'abc', 0),
(6830547195, 'Lebron', 'James', 'lebron23@gmail.com', 'abc', 0),
(3461246421, 'Matthew', 'Tkachuk', 'mmtkachuk@flames.com', 'abc', 0),
(1157422742, 'Alice', 'Smith', 'anon@anonymous.com', 'abc', 0),
(9646514567, 'Joe', 'Biden', 'pres@USA.com', 'abc', 0),
(9934758123, 'Nick', 'Bosa', 'bosa97@niners.com', 'abc', 0),
(7234561552, 'Hailee', 'Steinfeld', 'hailee@hotmail.com', 'abc', 0),
(7284096754, 'James', 'Johnson', 'jamesjohnson@test.com', 'abc', 1),
(7848961666, 'Himika', 'Dastidar', 'test@test.com', 'abc', 1),
(8761346354, 'Kelly', 'Osena', 'kelly@test.com', 'abc', 1),
(8611038770, 'Eric', 'Tan', 'erictan@test.com', 'abc', 1),
(3912281595, 'Sarah', 'Silverman', 'silverman@test.com', 'abc', 1),
(2238324761, 'Test', 'Librarian', 'testlibrarian@test.com', 'abc', 1),
(6306195165, 'Fake', 'Datatype', 'datatype@test.com', 'abc', 1);

INSERT INTO librarian (card_no, staff_id, staff_start_date, salary)
VALUES
(7284096754, 111, '2000-01-02', 50000.00),
(7848961666, 222, '2014-07-01', 55000.00),
(8761346354, 333, '2009-10-01', 57500.00),
(8611038770, 444, '2011-10-01', 55750.00),
(3912281595, 555, '2012-11-11', 60000.00),
(2238324761, 666, '2013-01-01', 65000.00),
(6306195165, 777, '2014-05-08', 66700.00);


INSERT INTO book (item_id, isbn, publisher_name, book_type)
VALUES
(1, '0002005018', 'HarperFlamingo Canada', 'Novel'),
(2, '0399135782', 'Putnam Pub Group', 'Fiction'),
(3, '0440234743', 'Dell', 'Fiction'),
(4, '0452264464', 'Plume', 'Fiction'),
(5, '0609804618', 'Three Rivers Press', 'Humor'),
(6, '1841721522', 'Ryland Peter Small Ltd.', 'Cooking'),
(7, '0971880107', 'Bloomberg', 'Fiction'),
(8, '0345402871', 'Ballantine Books', 'Fiction'),
(9, '0345417623', 'Ballantine Books', 'Fiction'),
(10,'0375759778', 'Random House Trade Paperbacks', 'Fiction');

INSERT INTO author(author_id, author_name)
VALUES
(1, 'Gina Bari Kolata'),
(2, 'Amy Tan'),
(3, 'John Grisham'),
(4, 'Toni Morrison'),
(5, 'Harper Lee'),
(6, 'Celia Brooks Brown'),
(7, 'Rich Shapero'),
(8, 'Michael Chrichton'),
(10, 'Arthur Philips');


INSERT INTO writes(author_id, isbn, item_id)
VALUES
(1, '0002005018', 1),
(2, '0399135782', 2),
(3, '0440234743', 3),
(4, '0452264464', 4),
(5, '0609804618', 5),
(6, '1841721522', 6),
(7, '0971880107', 7),
(8, '0345402871', 8),
(8, '0345417623', 9),
(10,'0375759778', 10);

INSERT INTO movies (item_id, production_company, imdb_id, duration)
VALUES 
(11, 'Paramount Pictures', 'tt0068646', 177),
(12, 'Warner Bros. Pictures', 'tt0468569', 152),
(13, 'Paramount Pictures', 'tt0071562',200 ),
(14, 'Orion-Nova Productions', 'tt0050083', 96),
(15, 'Universal Pictures', 'tt0108052' ,192),
(16, 'New Line Cinema', 'tt0167260', 201),
(17, 'A Band Apart', 'tt0110912', 154),
(18, 'New Line Cinema', 'tt0120737', 178),
(19, 'United Artists', 'tt0060196', 177),
(20, 'Castle Rock Entertainment', 'tt0111161', 142);

INSERT INTO director (director_id, director_name)
VALUES
(55692,'Christopher Nolan'),
(42154,'Sidney Lumet'),
(67234, 'Steven Spielberg'),
(92355, 'Quentin Tarantino'),
(17258, 'Francis Ford Coppola'),
(74433, 'Peter Jackson'),
(88832,'Sergio Leone'),
(23412, 'Frank Darabont');

INSERT INTO director_directs (director_id, imdb_id, item_id)
VALUES
(55692, 'tt0468569', 12),
(42154, 'tt0050083', 14),
(67234, 'tt0108052', 15),
(92355, 'tt0110912', 17),
(17258, 'tt0071562', 13),
(17258, 'tt0068646', 11),
(74433, 'tt0167260', 16),
(74433, 'tt0120737', 18),
(88832, 'tt0060196', 19),
(23412, 'tt0111161', 20);

INSERT INTO item (item_id, release_date, item_desc, item_name, item_availability) 
VALUES 
(11, '1972-01-01', 'The aging patriarch of an organized crime dynasty in postwar New York City transfers control of his clandestine empire to his reluctant youngest son.', 'The Godfather', 1),
(12, '2008-01-01', 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.', 'The Dark Knight', 1),
(13, '1974-01-01', 'The early life and career of Vito Corleone in 1920s New York City is portrayed, while his son, Michael, expands and tightens his grip on the family crime syndicate.', 'The Godfather: Part II', 1),
(14, '1957-01-01', 'The jury in a New York City murder trial is frustrated by a single member whose skeptical caution forces them to more carefully consider the evidence before jumping to a hasty verdict.', '12 Angry Men', 1),
(15, '1994-01-01', 'In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.', 'Schindlers List', 0 ),
(16, '2003-01-01', 'Gandalf and Aragorn lead the World of Men against Saurons army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.', 'The Lord of the Rings: The Return of the King', 0),
(17, '1996-01-01', 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.', 'Pulp Fiction', 1),
(18, '2001-01-01', 'A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.', 'The Lord of the Rings: The Fellowship of the Ring', 1),
(19, '1966-01-01', 'A bounty hunting scam joins two men in an uneasy alliance against a third in a race to find a fortune in gold buried in a remote cemetery.', 'The Good, the Bad and the Ugly', 1),
(20, '1994-01-01', 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.', 'The Shawshank Redemption', 1), 
(1, '2001-01-01', "In a small town in Canada, Clara Callan reluctantly takes leave of her sister, 
				Nora, who is bound for New York. Its a time when the growing threat of fascism in
				Europe is a constant worry, and people escape from reality through radio and the 
				movies. Meanwhile, the two sisters -- vastly different in personality, yet inextricably
				linked by a shared past -- try to find their places within the complex web of social 
				expectations for young women in the 1930s.",
				'Clara Callan: A novel',
				1),
(2, '1991-01-01', "A Chinese immigrant who is convinced she is dying threatens to celebrate the Chinese New
				Year by unburdening herself of everybody's hidden truths, thus prompting a series of comic 
				misunderstandings",
				"The Kitchen God's Wife",
				1
				),
(3, '1999-01-01', "A suicidal billionaire, a burnt-out Washington litigator, and a woman who has forsaken 
				  technology to work in the wilds of Brazil are all brought together by an astounding 
				  mystery of the testament",
				  "The Testament",
				  1
				  ),
(4, '1994-01-01', "Staring unflinchingly into the abyss of slavery, this novel transforms history
				 into a story as powerful as Exodus and as intimate as a lulaby.",
				 "Beloved",
				 0
				 ),
(5, '1999-01-01', "The staff of The Onion presents a satirical collection of mock headlines and news stories,
				 including an account of the Pentagon's development of an A-bomb-resistant desk for 
				schoolchildren",
				"Our Dumb Century: The Onion Presents 100 Years of Headlines from America's Finest News Source",
				1),
(6, '2001-01-01', "In New Vegetarian Celia Brooks Brown presents an innovative approach to vegetarian cooking. 
				  There's practical advice on how to choose and prepare the major vegetarian ingredients, 
				  followed by 50 original, stylish recipes, all photographed by Philip Webb.",
				  "New Vegetarian: Bold and Beautiful Recipes for Every Occasion",
				  0
				  ),
(7, '2004-01-01', "Wild animus is a search for the primordial, a test of human foundations and a journey to the breaking point.",
				"Wild Animus",
				1),
(8, '1997-01-01', "A fatal mid-air collision involving a commercial airliner prompts a frantic, desperate investigation into the 
				causes of the accident, in a thriller exploring the issue of safety and security in the aircraft industry",
				"Airframe",
				1
				),
(9, '2000-01-01', "Using a quantum time machine, a group of young historians is sent back to the year 1357 to rescue their 
				  trapped project leader.",
				  "Timeline",
				  0),
(10, '2003-01-01', "Five American expatriates living in Budapest in the early 1990s seek to establish themselves and make 
				   their fortunes in a city still haunted by the tragedies of its Communist past. A first novel. Reader's
				   Guide included. Reprint. 100,000 first printing.",
				   "Prague : A Novel",
					1);

INSERT INTO branch(branch_id, branch_name, branch_address)
VALUES
(1, 'Central Library', '800 3 St SE, Calgary, AB T2G 2E7'),
(2, 'Fish Creek Library', '11161 Bonaventure Dr SE, Calgary, AB T2J 6S1'),
(3, 'Shawnessy Library', '333 Shawville Blvd SE, Calgary, AB T2Y 4H3'),
(4, 'Seton Library', '4995 Market St SE, Calgary, AB T3M 2P9'),
(5, 'Bowness Library', '6532 Bowness Rd NW, Calgary, AB T3B 0E8'),
(6, 'Nose Hill Library', '1530 Northmount Dr NW, Calgary, AB T2L 0G6'),
(7, 'Crowfoot Library', '8665 Nose Hill Dr NW, Calgary, AB T3G 5T3'),
(8, 'Louise Riley Library', '1904 14 Ave NW, Calgary, AB T2N 1M5'),
(9, 'Judith Umbach Library', '6617 Centre St N, Calgary, AB T2K 4Y5'),
(10, 'ONLINE', 'ONLINE'); -- for events only


INSERT INTO lib_events (event_id, event_name, event_start_date, end_date, start_time, end_time)
VALUES
(1234, 'Family Storytime', '2020-01-21', '2020-01-21', '14:00:00', '13:00:00'),
(1235, 'Career Basics: Interview skills', '2021-06-11', '2021-06-11', '12:00:00', '14:00:00'),
(1236, 'Creative Writing', '2022-04-13', '2022-04-13', '10:00:00', '13:00:00'),
(1237, 'Digital Literacy', '2022-04-13', '2022-04-13', '10:00:00', '13:00:00'),
(1238, 'Author Meet and Greet', '2022-04-13', '2022-04-13', '10:00:00', '13:00:00'),
(1239, 'Family Storytime', '2022-05-08', '2022-05-08', '13:00:00', '14:00:00'),
(1240, 'Drop In Drawing', '2023-02-10', '2023-02-10', '15:00:00', '18:00:00'),
(1241, 'Drop in Drawing', '2023-02-11', '2023-02-11', '15:00:00', '18:00:00'),
(1242, 'Book Discussion: The Lord Of the Rings', '2022-08-03', '2022-08-03', '17:00:00', '21:00:00'),
(1243, 'Making Comics: Getting Started', '2024-04-27', '2024-04-27', '16:00:00', '19:00:00');



INSERT INTO event_location (event_id, e_location)
VALUES
(1234, 'Central Library'),
(1235, 'ONLINE'),
(1236, 'Fish Creek Library'),
(1237, 'Shawnessy Library'),
(1238, 'Bowness Library'),
(1239, 'Nose Hill Library'),
(1240, 'Seton Library'),
(1241, 'Crowfoot Library'),
(1242, 'Louise Riley Library'),
(1243, 'Judith Umbach Library');


INSERT INTO has_for_branch_and_item (branch_id, item_id, item_barcode, item_availability)
VALUES
(4, 1, 0683516687, FALSE),
(4, 1, 0683516686, TRUE),
(4, 1, 0683516688, FALSE),
(5, 1, 1133029791, TRUE),
(5, 1, 1133029792, FALSE),
(5, 1, 1133029793, TRUE),
(6, 1, 210865974, TRUE),
(6, 1, 2130865975, TRUE),
(6, 1, 2130865976, TRUE),
(7, 2, 2111793638, TRUE),
(8, 2, 2111793639, TRUE),
(8, 3, 2126976686, TRUE),
(9, 3, 2126976687, FALSE),
(9, 4, 215123547, FALSE),
(1, 5, 0887611864, TRUE),
(1, 6, 0255725324, FALSE),
(2, 7, 0841637857, TRUE),
(3, 8, 0108948855, TRUE),
(7, 9, 0163971279, FALSE), --
(8, 11, 0114406247, TRUE),
(9, 12, 0758177142, FALSE),
(2, 13, 0426113066, FALSE),
(1, 14, 0495393437, TRUE),
(2, 15, 0227217727, FALSE),
(3, 16, 0227247797, FALSE),
(1, 17, 10000, TRUE),
(1, 18, 10001, TRUE),
(1, 19, 10002, TRUE),
(2, 20, 10003, TRUE),
(2, 8, 10004, FALSE),
(3, 9, 10005, FALSE),
(3, 10, 10006, TRUE),
(4, 11, 10007, TRUE),
(4, 12, 10008, TRUE),
(5, 2, 10009, TRUE),
(5, 2, 10010, TRUE),
(6, 3, 10011, TRUE),
(6, 3, 10012, TRUE),
(7, 4, 10013, FALSE),
(7, 5, 10014, TRUE),
(8, 6, 10015, FALSE),
(8, 7, 10016, TRUE),
(9, 8, 10017, TRUE),
(9, 9, 10018, FALSE),
(8, 11, 10019, TRUE),
(3, 12, 10020, TRUE),
(7, 13, 10021, TRUE),
(1, 14, 10022, TRUE),
(2, 15, 10023, FALSE),
(3, 16, 10024, FALSE);



INSERT into copy_of_item(item_id, item_barcode)
VALUES
(1, 0683516687),
(1, 0683516686),
(1, 0683516688),
(1, 1133029791),
(1, 1133029792),
(1, 1133029793),
(1, 210865974),
(1, 2130865975),
(1, 2130865976),
(2, 2111793638),
(2, 2111793639),
(3, 2126976686),
(3, 2126976687),
(4, 215123547),
(5, 0887611864),
(6, 0255725324),
(7, 0841637857),
(8, 0108948855),
(9, 0163971279),
(11, 0114406247),
(12, 0758177142),
(13, 0426113066),
(14, 0495393437),
(15, 0227217727),
(16, 0227247797),
(17, 10000),
(18, 10001),
(19, 10002),
(20, 10003),
(8, 10004),
(9, 10005),
(10, 10006),
(11, 10007),
(12, 10008),
(2, 10009),
(2, 10010),
(3, 10011),
(3, 10012),
(4, 10013),
(5, 10014),
(6, 10015),
(7, 10016),
(8, 10017),
(9, 10018),
(11, 10019),
(12, 10020),
(13, 10021),
(14, 10022),
(15, 10023),
(16, 10024);

INSERT INTO hosts_event(event_id, branch_id)
VALUES 
(1234, 1), 
(1235, 10),
(1236, 2), 
(1237, 3), 
(1240, 4), 
(1238, 5), 
(1239, 6), 
(1241, 7), 
(1242, 8), 
(1243, 9);

INSERT INTO coordinates(card_no, staff_id, event_id)
VALUES
(2238324761, 666, 1234),
(2238324761, 666, 1235),
(3912281595, 555, 1236),
(6303195165, 777, 1237),
(7284096754, 111, 1240),
(8611038770, 444, 1238),
(8761346354, 333, 1239),
(8761346354, 333, 1241),
(8761346354, 333, 1242),
(8761346354, 333, 1243);


INSERT INTO places_hold(card_no, item_id, hold_position)
VALUES
(1234567890, 9, 1),
(1234567890, 4, 2),
(2346271619, 9, 2),
(2346271619, 4, 1),
(6830547195, 6, 1),
(1157422742, 16, 1),
(7234561552, 16, 2),
(7234561552, 15, 1),
(7920625716, 15, 2);

INSERT INTO signed_out(card_no, item_id, item_barcode, checkout_date, return_date)
VALUES
(9646514567, 9, 0163971279, '2022-04-03', '2022-05-04'),
(8426482051, 13, 0426113066, '2022-03-24', '2022-04-24'),
(7920625716, 6, 0255725324, '2022-04-04', '2022-05-05'),
(7234561552, 3, 2126976687, '2022-04-03', '2022-05-04'),
(6830547195, 16, 0227247797, '2022-03-20', '2022-04-20'),
(3461246421, 15, 0227217727, '2022-03-19', '2022-04-19'),
(9646514567, 1, 0683516687, '2022-04-04', '2022-05-05'),
(8426482051, 1, 0683516688, '2022-04-04', '2022-05-05'),
(7920625716, 1, 1133029792, '2022-04-04', '2022-05-05');

INSERT INTO registers (event_id, card_no)
VALUES
(1234,7920625716),
(1235,7920625716),
(1235,9646514567),
(1242,9646514567),
(1243,9646514567),
(1234, 2346271619);