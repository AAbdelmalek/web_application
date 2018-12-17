USE web_app_dev;

SELECT * FROM artists
INNER JOIN Gibi_ASMR
ON artists.artist = Gibi_ASMR.artist;

SELECT artists.ARTIST, JOINED, SUBSCRIBERS, TOTAL_VIEWS, Gibi_ASMR.PUBLISHED, Gibi_ASMR.TITLE, Gibi_ASMR.CATEGORY , Gibi_ASMR.DURATION, Gibi_ASMR.VIEWS,
Gibi_ASMR.LIKES, Gibi_ASMR.DISLIKES, Gibi_ASMR.PAID, Gibi_ASMR.FAMILY_FRIENDLY, Gibi_ASMR.URL FROM artists
INNER JOIN Gibi_ASMR
ON artists.artist = Gibi_ASMR.artist;

SELECT * FROM artists;

SELECT * FROM tingting_asmr;

SELECT * FROM mars_phobos;

SELECT * FROM asmr_glow;

SELECT * FROM diddly_asmr;







DROP TABLE artists;

DROP TABLE mars_phobos;

DROP TABLE asmr_glow;

DROP TABLE diddly_asmr;

DROP TABLE gibi_asmr;

DROP TABLE tingting_asmr;
