CREATE TABLE if NOT EXISTS animals (
	id INT PRIMARY KEY AUTO_INCREMENT,
	recordType INT,
	recordFloat INT,
	recordText VARCHAR(50),
	prescriptIcon INT,
	originalPhotoUrl VARCHAR(100),
	resizePhotoUrl VARCHAR(100),
	createdAt VARCHAR(50),
	updatedAt VARCHAR(50),
	animalId INT,
	vetId INT,
	vet VARCHAR(50)
) DEFAULT CHARACTER SET = utf8;

/*CREATE TABLE if NOT EXISTS reviews (
	movie_id INT,
	review VARCHAR(255),
	FOREIGN KEY(movie_id) REFERENCES movies(movie_id)
) DEFAULT CHARACTER SET = utf8;
*/
INSERT INTO animals VALUES (null, 1, 0, null,1,null,null,"2017-06-01T12:30:00.000Z","2017-06-01T12:30:00.000Z",1,null,null);
INSERT INTO animals VALUES (null, 2, 0, null,1,null,null,"2017-06-01T12:30:00.000Z","2017-06-01T12:30:00.000Z",1,null,null);
INSERT INTO animals VALUES (null, 3, 0, null,1,null,null,"2017-06-01T12:30:00.000Z","2017-06-01T12:30:00.000Z",1,null,null);
INSERT INTO animals VALUES (null, 4, 9, null,1,null,null,"2017-06-01T12:30:00.000Z","2017-06-01T12:30:00.000Z",1,null,null);
INSERT INTO animals VALUES (null, 1, 8, null,1,null,null,"2017-06-01T12:30:00.000Z","2017-06-01T12:30:00.000Z",1,null,null);
INSERT INTO animals VALUES (null, 2, 100, null,1,null,null,"2017-06-01T12:30:00.000Z","2017-06-01T12:30:00.000Z",1,null,null);
INSERT INTO animals VALUES (null, 3, 1000, null,1,null,null,"2017-06-01T12:30:00.000Z","2017-06-01T12:30:00.000Z",1,null,null);
INSERT INTO animals VALUES (null, 4, 10, null,1,null,null,"2017-06-01T12:30:00.000Z","2017-06-01T12:30:00.000Z",1,null,null);