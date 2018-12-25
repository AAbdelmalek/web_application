USE web_app_dev;

SELECT * FROM artists
INNER JOIN Gibi_ASMR
ON artists.artist = Gibi_ASMR.artist;

SELECT artists.ARTIST, JOINED, SUBSCRIBERS, TOTAL_VIEWS, Gibi_ASMR.PUBLISHED, Gibi_ASMR.TITLE, Gibi_ASMR.CATEGORY , Gibi_ASMR.DURATION, Gibi_ASMR.VIEWS,
Gibi_ASMR.LIKES, Gibi_ASMR.DISLIKES, Gibi_ASMR.PAID, Gibi_ASMR.FAMILY_FRIENDLY, Gibi_ASMR.URL FROM artists
INNER JOIN Gibi_ASMR
ON artists.artist = Gibi_ASMR.artist;

ALTER TABLE artists
ADD ARTIST_IMAGE VARCHAR(255) CHARACTER SET UTF8MB4;

ALTER TABLE artists
ADD TOTAL_VIDEOS INT;

ALTER TABLE artists
ADD ARTIST_CODE VARCHAR(255) CHARACTER SET UTF8MB4;

ALTER TABLE artists
DROP ARTIST_URL;

ALTER TABLE artists
DROP INDEX TABLE_NAME;

DELETE  FROM artists 
WHERE Artist = "kul";

SELECT * FROM artists;

SELECT * FROM requests;

SELECT * FROM gibi_asmr;

SELECT * FROM tingting_asmr;

SELECT * FROM mars_phobos;

SELECT * FROM Die_Antwoord;

SELECT * FROM asmr_glow;

SELECT * FROM diddly_asmr;

SELECT * FROM Ariana_Grande;

SELECT * FROM RaffyTaphyASMR;

SELECT * FROM Avicii;

SELECT * FROM Michael_Vongsa;


SELECT artists.artist, Ariana_Grande.URL;

SELECT * FROM REQUESTS ORDER BY ID DESC LIMIT 3;

SELECT * FROM requests;

SELECT * FROM bad_requests;

SELECT * FROM Nitiphon_Singhasiri;


DELETE  FROM artists 
WHERE Artist = "Mars Phobos";

DELETE  FROM requests 
WHERE Artist = "Mars Phobos";

DELETE  FROM requests 
WHERE Artist = "kul";

DROP TABLE bad_requests;

DROP TABLE requests;

DROP TABLE Avicii;

DROP TABLE video_data;

DROP TABLE artist_info;

DROP TABLE artists;

DROP TABLE mars_phobos;

DROP TABLE asmr_glow;

DROP TABLE diddly_asmr;

DROP TABLE gibi_asmr;

DROP TABLE tingting_asmr;

DROP TABLE Ariana_Grande;

DROP TABLE MIchael_Vongsa;

DROP TABLE tingting_asmr;

DROP DATABASE web_app_dev;

SELECT * from artists 
INNER JOIN Mars_Phobos
ON artists.artist = Mars_Phobos.artist;
