# Import Dependencies
from flask import Flask
from flask import render_template
from flask import url_for
from flask import request
from bs4 import BeautifulSoup as bs
import requests
import numpy as np
import pandas as pd
from datetime import datetime
import time
from sqlalchemy import create_engine
import pymysql
import time
from numpy import random
pymysql.install_as_MySQLdb()

# Initialize Flask
app = Flask(__name__)

# Home Page
@app.route("/")
def home():
	# Set Variables, Render Home Page
	json_data = []
	json_data_1 = []
	analytics_base_url = "#"
	analytics_base_url_1 = "#"
	return render_template("index.html", data = json_data, data_1 = json_data_1,\
	analytics_base_url=analytics_base_url, analytics_base_url_1=analytics_base_url_1)

# Query String
@app.route("/query")
def search():
	# try:
	# Start Clock, Set Variables
	start = time.time()
	json_data = []
	json_data_1 = []
	cache = ""
	percent_complete_str = "0"

	# Get Search Key Value
	name_key = request.args['name']
	input_name = '''{}'''.format(name_key)

	# Get Analytics Key Value
	name_key = request.args.get('analytics')
	input_analytics = '''{}'''.format(name_key)

	# Get Scrape Date
	scrape_date = datetime.now().strftime("%Y-%m-%d")
	scrape_datetime = datetime.utcnow()

	# Connect to Database Server
	connection = create_engine('mysql://root:Mars@127.0.0.1')

	# Creating database if not exists
	connection.execute("CREATE DATABASE IF NOT EXISTS web_app_dev")
	connection.execute("USE web_app_dev")

	# Convert Date from Jan 1, 1999 format to datetime object
	converted_date = ""
	raw_months = {"Jan": 1, "Feb": 2, "Mar" : 3, "Apr" : 4, 
				"May" : 5, "Jun" : 6, "Jul" : 7, "Aug" : 8,
				"Sep" : 9, "Oct" : 10, "Nov" : 11, "Dec" : 12}

	def convertDate(raw_date):
		
		try:
			converted_date = ""
			number_month = raw_months.get(raw_date[0])
			date_str = (str(number_month) + "/" + raw_date[1] + "/" + raw_date[2]).replace(",", "")
			converted_date = datetime.strptime(date_str, '%m/%d/%Y')
			return converted_date
			
		except:
			print(f"{raw_date} Convert function date is not valid.")

	# Get Youtuber's Name
	converted_input_date = datetime.strptime("1944-06-06", '%Y-%m-%d')
	
	list_name = input_name.split()
	converted_name = input_name

	if len(list_name) > 1:    
		converted_name = ""
		
		for i in range(len(list_name)):
			converted_name = converted_name + list_name[i]
			
			if i != len(list_name)-1:
				converted_name = converted_name + "+"

	search_name = converted_name
	start_url = "https://www.youtube.com/results?search_query=" + search_name

	print(start_url)

	get_youtube_url_response = requests.get(start_url)
	youtube_name_soup = bs(get_youtube_url_response.text, "lxml")
	raw_youtube_name_link = youtube_name_soup.find_all("div", class_="yt-lockup-byline")[0].a.get("href")
	videos_link = "https://www.youtube.com" + raw_youtube_name_link + "/videos"
	about_link = "https://www.youtube.com" + raw_youtube_name_link + "/about"

	print(videos_link)
	print(about_link)

	# Get About Information
	about_html = requests.get(about_link)

	# Parse HTML
	about_soup = bs(about_html.text, "lxml")

	# Artist Information
	try:
		artist_name = about_soup.find("meta", property="og:title").get("content")

		artist_image = about_soup.find("img", class_="channel-header-profile-image").get("src")

		subscribers = about_soup.find_all("span", class_="about-stat")[0].text
		subscribers_str = subscribers.split(" ")[0]
		
		try:
			subscribers_int = int(subscribers.split(" ")[0].replace(",",""))

		except:
			subscribers_int = "Not available"

		total_views = about_soup.find_all("span", class_="about-stat")[1].text
		total_views_str = total_views[3:len(total_views)].split(" ")[0]
		
		try:
			total_views_int = int(total_views[3:len(total_views)].split(" ")[0].replace(",",""))
			joined = about_soup.find_all("span", class_="about-stat")[2].text
			joined_temp = joined.split(" ")[1:4]
			joined_convert = convertDate(joined_temp)
			joined_str = str(joined_convert).split(" ")[0]

		except:
			total_views = about_soup.find_all("span", class_="about-stat")[0].text
			total_views_str = total_views[3:len(total_views)].split(" ")[0]
			total_views_int = int(total_views[3:len(total_views)].split(" ")[0].replace(",",""))
			
			joined = about_soup.find_all("span", class_="about-stat")[1].text
			joined_temp = joined.split(" ")[1:4]
			joined_convert = convertDate(joined_temp)
			joined_str = str(joined_convert).split(" ")[0]

		print(f"Artist: {artist_name}")
		print(f"Subscribers: {subscribers_int}")
		print(f"Views: {total_views_int}")
		print(f"Joined: {joined_convert}")

	except:
		print("Something went wrong getting artist information..")

	# Replacing spaces with underscores for new table name
	artist_db_name = artist_name.replace(" ","_").replace("`","")

	# Checking Database to See if Data was Previously Scraped
	df_cache = []
	artist_1_table = []
	artist_2_table = []
	try:
		# Searching for input Artist
		df_cache = pd.read_sql(f"SELECT artists.ARTIST, artists.SCRAPE_DATE, artists.SEARCH_NAME, JOINED, SUBSCRIBERS, TOTAL_VIEWS, \
		{artist_db_name}.PUBLISHED_STR, artists.TOTAL_VIDEOS, artists.TABLE_NAME, \
		{artist_db_name}.TITLE, {artist_db_name}.CATEGORY , {artist_db_name}.DURATION, {artist_db_name}.VIEWS, \
		{artist_db_name}.LIKES, {artist_db_name}.DISLIKES, {artist_db_name}.PAID, {artist_db_name}.FAMILY_FRIENDLY, \
		{artist_db_name}.URL, artists.ARTIST_IMAGE FROM artists \
		INNER JOIN {artist_db_name} \
		ON artists.artist = {artist_db_name}.artist", connection)

		# Getting Last Artists to also Display on Home Page	
		artists_table = pd.read_sql("SELECT * FROM REQUESTS ORDER BY ID DESC LIMIT 2", connection) 

		artist_1 = artists_table.loc[1,"TABLE_NAME"]
		artist_2 = artists_table.loc[0,"TABLE_NAME"]

		# Get Artist 1 Info
		artist_1_table = pd.read_sql(f"SELECT artists.ARTIST, artists.SCRAPE_DATE, artists.SEARCH_NAME, JOINED, SUBSCRIBERS, TOTAL_VIEWS, \
		{artist_1}.PUBLISHED_STR, artists.TOTAL_VIDEOS, \
		{artist_1}.TITLE, {artist_1}.CATEGORY , {artist_1}.DURATION, {artist_1}.VIEWS, \
		{artist_1}.LIKES, {artist_1}.DISLIKES, {artist_1}.PAID, {artist_1}.FAMILY_FRIENDLY, \
		{artist_1}.URL, artists.ARTIST_IMAGE FROM artists \
		INNER JOIN {artist_1} \
		ON artists.artist = {artist_1}.artist", connection)

		# Get Artist 2 Info	
		artist_2_table = pd.read_sql(f"SELECT artists.ARTIST, artists.SCRAPE_DATE, artists.SEARCH_NAME, JOINED, SUBSCRIBERS, TOTAL_VIEWS, \
		{artist_2}.PUBLISHED_STR, artists.TOTAL_VIDEOS, \
		{artist_2}.TITLE, {artist_2}.CATEGORY , {artist_2}.DURATION, {artist_2}.VIEWS, \
		{artist_2}.LIKES, {artist_2}.DISLIKES, {artist_2}.PAID, {artist_2}.FAMILY_FRIENDLY, \
		{artist_2}.URL, artists.ARTIST_IMAGE FROM artists \
		INNER JOIN {artist_2} \
		ON artists.artist = {artist_2}.artist", connection)

	except:
		print("Not found in database")

	if len(df_cache) != 0:
		# Search Result Information
		print(f"A cached scrape ({scrape_date} UTC) has been found...")
		scrape_date = df_cache.loc[0,"SCRAPE_DATE"]
		cache = f"{scrape_date} scrape"
		json_data = df_cache.to_json(orient="records")
		scrape_date_str = str(scrape_date).split(" ")[0]
		total_videos_str = str(df_cache.loc[0,"TOTAL_VIDEOS"]) + " Videos"
		number_scraped = int(len(df_cache))
		analytics_base_url = "/query?name=" + input_name + "&analytics=base"
		table_name_search = df_cache.loc[0,"TABLE_NAME"]
		search_table_name = df_cache.loc[0, "SEARCH_NAME"]
		original_name = df_cache.loc[0,"ARTIST"]

		# Inserting Request into Database
		connection.execute(f"INSERT INTO requests \
		(SCRAPE_DATE, TABLE_NAME, SEARCH_NAME, ARTIST)\
		VALUES ('{scrape_date}', '{table_name_search}','{search_table_name}', '{original_name}')")

		# Artist 1 Information
		scrape_date_1 = artist_1_table.loc[0,"SCRAPE_DATE"]
		cache_1 = f"{scrape_date_1} scrape"
		json_data_1 = artist_1_table.to_json(orient="records")
		scrape_date_1 = artist_1_table.loc[0,"SCRAPE_DATE"]
		scrape_date_str_1 = str(scrape_date_1).split(" ")[0]
		total_videos_str_1 = str(artist_1_table.loc[1,"TOTAL_VIDEOS"]) + " Videos"
		number_scraped_1 = int(len(artist_1_table))
		artist_1_name = artist_1_table.loc[0,"ARTIST"]
		analytics_base_url_1 = "/query?name=" + artist_1_name + "&analytics=base"
		subscribers_1 = artist_1_table.loc[0,"SUBSCRIBERS"]
		joined_1 = artist_1_table.loc[0,"JOINED"]
		total_views_1 = artist_1_table.loc[0,"TOTAL_VIEWS"]
		artist_image_1 = artist_1_table.loc[0,"ARTIST_IMAGE"]

		# Artist 2 Information
		scrape_date_2 = artist_2_table.loc[0,"SCRAPE_DATE"]
		cache_2 = f"{scrape_date_2} scrape"
		json_data_2 = artist_2_table.to_json(orient="records")
		scrape_date_2 = artist_2_table.loc[0,"SCRAPE_DATE"]
		scrape_date_str_2 = str(scrape_date_2).split(" ")[0]
		total_videos_str_2 = str(artist_2_table.loc[1,"TOTAL_VIDEOS"]) + " Videos"
		number_scraped_2 = int(len(artist_2_table))
		artist_2_name = artist_2_table.loc[0,"ARTIST"]
		analytics_base_url_2 = "/query?name=" + artist_2_name + "&analytics=base"
		subscribers_2 = artist_2_table.loc[0,"SUBSCRIBERS"]
		joined_2 = artist_2_table.loc[0,"JOINED"]
		total_views_2 = artist_2_table.loc[0,"TOTAL_VIEWS"]
		artist_image_2 = artist_2_table.loc[0,"ARTIST_IMAGE"]

		if input_analytics == "base":
			return render_template("analytics_base.html", data=json_data, cache=scrape_date_str,\
			progress=percent_complete_str, artist_name=artist_name,\
			subscribers = f"{subscribers_str} Subscribers",\
			total_views=f"{total_views_str} All-Time Views", joined=f"Joined {joined_str}",\
			artist_image=artist_image,\
			total_videos = total_videos_str, number_scraped=number_scraped)
		
		else:
			return render_template("index.html", data=json_data, cache=scrape_date_str,\
			artist_name=artist_name,\
			subscribers = f"{subscribers_str} Subscribers",\
			total_views=f"{total_views_str} All-Time Views", joined=f"Joined {joined_str}",\
			artist_image=artist_image,\
			total_videos = total_videos_str,\
			analytics_base_url=analytics_base_url,\
			data_1=json_data_1, cache_1=scrape_date_str_1,\
			artist_name_1=artist_1_name,\
			subscribers_1 = f"{subscribers_1} Subscribers",\
			total_views_1 =f"{total_views_1} All-Time Views", joined_1=f"Joined {joined_1}",\
			artist_image_1 = artist_image_1,\
			total_videos_1 = total_videos_str_1,\
			analytics_base_url_1=analytics_base_url_1,\
			data_2=json_data_2, cache_2=scrape_date_str_2,\
			artist_name_2=artist_2_name,\
			subscribers_2 = f"{subscribers_2} Subscribers",\
			total_views_2 =f"{total_views_2} All-Time Views", joined_2=f"Joined {joined_2}",\
			artist_image_2 = artist_image_2,\
			total_videos_2 = total_videos_str_2,\
			analytics_base_url_2=analytics_base_url_2)
			
	else:

		try:
			# Convert User Name to UU Format
			youtube_code = raw_youtube_name_link.split("/")[2]

			if youtube_code[0:2] == "UC":

				youtube_code = raw_youtube_name_link.split("/")[2]
				playlist_link = "https://www.youtube.com" + "/playlist?list=UU" + youtube_code[2:] 

			elif youtube_code[0:2] != "UC":

				youtube_code_raw = about_soup.find("link", rel="canonical").get("href")
				youtube_code = youtube_code_raw.split("/")[4]
				playlist_link = "https://www.youtube.com" + "/playlist?list=UU" + youtube_code[2:]  

			print(playlist_link)

			# Get Playlist Response
			playlist_response = requests.get(playlist_link)

			# Create Playlist Soup Object
			playlist_soup = bs(playlist_response.text, 'lxml')

			# Get First Video URL as Starting Point
			first_video = "https://www.youtube.com" + playlist_soup.find_all("a", class_="pl-video-title-link")[0].get("href").split("&")[0]
			first_video_within_playlist = first_video + "&" + playlist_link.split("?")[1]

			print(first_video_within_playlist)

			# Create Soup Object for First Video Inside Playlist
			playlist_inside_request = requests.get(first_video_within_playlist) 

			playlist_inside_soup = bs(playlist_inside_request.text, "lxml")

			urls_all = []
			total_videos_in_playlist = int(playlist_inside_soup.find("span", id="playlist-length").text.replace(" videos","").replace(",",""))
			print(f"Total videos: {total_videos_in_playlist}")
			number_of_videos_in_page = len(playlist_inside_soup.find_all("span", class_="index")) 
			last_video_index = int(playlist_inside_soup.find_all("span", class_="index")[-1].text.replace("\n        ","").replace("\n    ",""))
			last_shown_link = playlist_inside_soup.find_all("span", class_="index")[-1].find_next("a").get("href")
			link_fix = "https://www.youtube.com" + last_shown_link

			print("Getting urls...")

			for i in range(total_videos_in_playlist):   

				if i == 0:       
					first_link = playlist_inside_soup.find("span", class_="index", text=f"\n        ▶\n    ")
					url = "https://www.youtube.com" + first_link.find_next("a").get("href")
					original_url = url.split("&")[0]
					urls_all.append(original_url)
					next_link = first_link

				elif i == last_video_index:       
					playlist_inside_request = requests.get(link_fix)
					playlist_inside_soup = bs(playlist_inside_request.text, "lxml")
					last_shown_link = playlist_inside_soup.find_all("span", class_="index")[-1].find_next("a").get("href")
					link_fix = "https://www.youtube.com" + last_shown_link
					last_video_index = int(playlist_inside_soup.find_all("span", class_="index")[-1].text.replace("\n        ","").replace("\n    ",""))
					first_link = playlist_inside_soup.find("span", class_="index", text=f"\n        {i+1}\n    ")

					if first_link is None:           
						next_link = playlist_inside_soup.find("span", class_="index", text=f"\n        ▶\n    ")

					else:          
						next_link = first_link

					next_url = "https://www.youtube.com" + next_link.find_next("a").get("href")
					original_url = next_url.split("&")[0]
					urls_all.append(original_url)
					number_of_videos_in_page = len(playlist_inside_soup.find_all("span", class_="index")) - 1

				else:

					if i == 1:
						first_link = playlist_inside_soup.find("span", class_="index", text=f"\n        ▶\n    ")

					elif playlist_inside_soup.find("span", class_="index", text=f"\n        {i}\n    ") is None:
						first_link = playlist_inside_soup.find("span", class_="index", text=f"\n        ▶\n    ")

					else:
						first_link = playlist_inside_soup.find("span", class_="index", text=f"\n        {i}\n    ")

					next_link = first_link
					next_link = next_link.find_next("span", class_="index")
					next_url = "https://www.youtube.com" + next_link.find_next("a").get("href")
					original_url = next_url.split("&")[0]
					urls_all.append(original_url)

				request_duration = time.time() - start
				if request_duration >  1000:
					json_data = []
					reason = "The request took too long to complete."
					return render_template("uh-oh.html", data = json_data, reason=reason)
		
		except:
			print("Something went wrong getting video urls..")

		# Going to Each Video and Extracting Data
		published_on = []
		published_on_str = []
		raw_published_on = []
		views = []
		date = []
		duration_videos = []
		likes = []
		dislikes = []
		title_videos = []
		categories = []
		paid_list = []
		family_friendly = []
		bump = 0

		for i in range(len(urls_all)):
			try:
				video_url = urls_all[i]
				video_response = requests.get(video_url)
				video_soup = bs(video_response.text, 'lxml')

				# Publish Date
				raw_publish_date = video_soup.find("div", id="watch-uploader-info").text
				raw_published_on.append(raw_publish_date)

				# Handle All Raw Dates "Premiered", ""Published", "Streamed", "X Hours Ago"
				publish_date_format = raw_publish_date.split(" ")[len(raw_publish_date.split(" "))-3:len(raw_publish_date.split(" "))]

				if publish_date_format[1] == "hours":
					publish_date_convert = datetime.strptime(scrape_date, '%Y-%m-%d')

				else:
					publish_date_convert = convertDate(publish_date_format)

				# Break if Date Less than Input Date Range
				if publish_date_convert < converted_input_date:
					break

				else:
					published_on.append(publish_date_convert)
					published_on_str.append(str(publish_date_convert).split(" ")[0])

				# Title
				title = video_soup.find("title").text.replace(" - YouTube", "")
				title_videos.append(title)

				# Views
				string_views = video_soup.find("div", id="watch7-views-info").text.replace(" views", "").replace(",","").replace("\n","")
				int_views = int(string_views)
				views.append(int_views)

				#Duration
				duration = video_soup.find("meta", itemprop="duration").get("content").replace("PT","").split("M")
				duration_mins = int(video_soup.find("meta", itemprop="duration").get("content").replace("PT","").split("M")[0])
				duration_secs = int(duration[1].replace("S",""))
				total_duration = round(duration_mins + duration_secs/60,2)
				duration_videos.append(total_duration)

				# Likes
				string_likes = video_soup.find("button", title="I like this").text
				if string_likes != "":
					int_likes = int(string_likes.replace(",",""))
					likes.append(int_likes)
				else:
					likes.append(0)

				# Dislikes
				string_dislikes = video_soup.find("button", title="I dislike this").text
				if string_dislikes != "":
					int_dislikes = int(string_dislikes.replace(",",""))
					dislikes.append(int_dislikes)
				else:
					dislikes.append(0)

				# Category
				category = video_soup.find("h4", class_="title", text="\n      Category\n    ").find_next("a").text
				categories.append(category)

				# Paid
				paid = video_soup.find("meta", itemprop="paid").get("content")
				paid_list.append(paid)

				# Family Friendly
				family = video_soup.find("meta", itemprop="isFamilyFriendly").get("content")
				family_friendly.append(family)

				percent_complete = round(((i+1) / (len(urls_all)))*100,0)

				percent_complete_str = str(percent_complete)

				print(f"{percent_complete}% complete...")

				request_duration = time.time() - start
				if request_duration >  1000:
					json_data = []
					reason = "The request took too long to complete."
					return render_template("uh-oh.html", data = json_data, reason=reason)

			# Remove any data apended to lists during an exception, account for smaller list size after removal vs. i
			except:
				print(f"Skipped {video_url}...")
				try:
					published_on.pop(i-bump)
				except:
					pass            
				try:
					raw_published_on.pop(i-bump)
				except:
					pass            
				try:
					views.pop(i-bump)
				except:
					pass            
				try:
					date.pop(i-bump)
				except:
					pass            
				try:
					duration_videos.pop(i-bump)
				except:
					pass            
				try:
					likes.pop(i-bump)
				except:
					pass
				try:
					dislikes.pop(i-bump)
				except:
					pass
				try:
					title_videos.pop(i-bump)
				except:
					pass
				try:
					categories.pop(i-bump)
				except:
					pass
				try:
					paid_list.pop(i-bump)
				except:
					pass
				try:    
					family_friendly.pop(i-bump)
				except:
					pass
				try:
					urls_all.pop(i-bump)
				except:
					pass
				try:
					published_on_str.pop(i-bump)
				except:
					pass
				bump = bump + 1
				continue
				
		urls_to_date = urls_all[0:len(published_on)]

		# Create DataFrame
		df = pd.DataFrame({"ARTIST" : artist_name,
						"SCRAPE_DATE" : scrape_datetime,
						"SEARCH_NAME" : input_name,
						"TOTAL_VIDEOS" : total_videos_in_playlist,
						"JOINED" : joined_convert,
						"SUBSCRIBERS" : subscribers_int,
						"TOTAL_VIEWS" : total_views_int,
						"PUBLISHED": published_on,
						"PUBLISHED_STR" : published_on_str,
						"TITLE" : title_videos,
						"CATEGORY" : categories,
						"DURATION" : duration_videos,
						"VIEWS" : views,
						"LIKES" : likes,
						"DISLIKES" : dislikes,
						"PAID" : paid_list,
						"FAMILY_FRIENDLY" : family_friendly,
						"URL" : urls_to_date,
						"ARTIST_IMAGE": artist_image,
						})

		df = df.sort_values("PUBLISHED",ascending=False)
		
		# Saving to CSV
		#df.to_csv(f"{artist_name}_scrape.csv")

		# Saving to JSON
		json_data = df.to_json(orient="records")

		# Insert Data into Database
		print("Inserting data into database...")
		# Creating table for videos
		connection.execute(f"\
		CREATE TABLE IF NOT EXISTS {artist_db_name} (\
		ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,\
		SCRAPE_DATE DATETIME,\
		SEARCH_NAME VARCHAR(355) CHARACTER SET UTF8MB4,\
		ARTIST VARCHAR(255) CHARACTER SET UTF8MB4,\
		PUBLISHED DATE,\
		PUBLISHED_STR VARCHAR(255),\
		TITLE VARCHAR(255) CHARACTER SET UTF8MB4,\
		CATEGORY VARCHAR(255) CHARACTER SET UTF8MB4,\
		DURATION FLOAT,\
		VIEWS INT,\
		LIKES INT,\
		DISLIKES INT,\
		COMMENTS INT,\
		PAID VARCHAR(255) CHARACTER SET UTF8MB4,\
		FAMILY_FRIENDLY VARCHAR(255) CHARACTER SET UTF8MB4,\
		URL VARCHAR(255) CHARACTER SET UTF8MB4\
		)")

		# Creating Table for Artist data
		connection.execute("\
		CREATE TABLE IF NOT EXISTS artists(\
		ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,\
		SCRAPE_DATE DATETIME,\
		TABLE_NAME VARCHAR(255)CHARACTER SET UTF8MB4,\
		SEARCH_NAME VARCHAR(355) CHARACTER SET UTF8MB4,\
		ARTIST VARCHAR(255) CHARACTER SET UTF8MB4,\
		TOTAL_VIDEOS INT,\
		JOINED DATE,\
		SUBSCRIBERS INT,\
		TOTAL_VIEWS BIGINT,\
		ARTIST_IMAGE VARCHAR(255) CHARACTER SET UTF8MB4\
		)")

		# Creating Table for Requests
		connection.execute("\
		CREATE TABLE IF NOT EXISTS requests(\
		ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,\
		SCRAPE_DATE DATETIME,\
		TABLE_NAME VARCHAR(255)CHARACTER SET UTF8MB4,\
		SEARCH_NAME VARCHAR(355) CHARACTER SET UTF8MB4,\
		ARTIST VARCHAR(255) CHARACTER SET UTF8MB4\
		)")

		# Getting df values and inserting into appropriate tables
		for i in range(len(df)):
			scrape_date = df.loc[i,"SCRAPE_DATE"]
			search_name = df.loc[i,"SEARCH_NAME"]
			table_name = artist_db_name
			artist = df.loc[i,"ARTIST"].replace("`","")
			joined = df.loc[i,"JOINED"]
			subscribers = df.loc[i,"SUBSCRIBERS"]
			total_views = df.loc[i,"TOTAL_VIEWS"]
			published = df.loc[i,"PUBLISHED"]
			published_str = df.loc[i,"PUBLISHED_STR"]
			title = df.loc[i,"TITLE"].replace("'","").replace('"',"").replace(']',"")\
			.replace('[',"").replace('\\',"").replace("%","").replace("`","")
			category = df.loc[i,"CATEGORY"]
			duration = df.loc[i,"DURATION"]
			views = df.loc[i,"VIEWS"]
			likes = df.loc[i,"LIKES"]
			dislikes = df.loc[i,"DISLIKES"]
			paid = df.loc[i,"PAID"]
			family_friendly = df.loc[i,"FAMILY_FRIENDLY"]
			url =  df.loc[i,"URL"]

			connection.execute(f"INSERT INTO {artist_db_name}\
			(SCRAPE_DATE, SEARCH_NAME, ARTIST, PUBLISHED, PUBLISHED_STR, TITLE, CATEGORY , DURATION,\
			VIEWS, LIKES, DISLIKES, PAID, FAMILY_FRIENDLY, URL)\
			VALUES ('{scrape_date}','{search_name}', '{artist}', '{published}', \
			'{published_str}','{title}', '{category}',\
			'{duration}', '{views}', '{likes}', '{dislikes}', '{paid}',\
			'{family_friendly}', '{url}')")

		if subscribers == "Not available":
			connection.execute(f"INSERT INTO artists \
			(SCRAPE_DATE, TABLE_NAME, SEARCH_NAME, ARTIST, TOTAL_VIDEOS, JOINED, SUBSCRIBERS, TOTAL_VIEWS, ARTIST_IMAGE)\
			VALUES ('{scrape_date}', '{table_name}','{search_name}', '{artist}', '{total_videos_in_playlist}', \
			'{joined}', NULL,\
			'{total_views}','{artist_image}')")

			connection.execute(f"INSERT INTO requests \
			(SCRAPE_DATE, TABLE_NAME, SEARCH_NAME, ARTIST)\
			VALUES ('{scrape_date}', '{table_name}','{search_name}', '{artist}')")
		
		else:
			connection.execute(f"INSERT INTO artists \
			(SCRAPE_DATE, TABLE_NAME, SEARCH_NAME, ARTIST, TOTAL_VIDEOS, JOINED, SUBSCRIBERS, TOTAL_VIEWS, ARTIST_IMAGE)\
			VALUES ('{scrape_date}', '{table_name}','{search_name}', '{artist}', '{total_videos_in_playlist}',\
			'{joined}', '{subscribers}', '{total_views}','{artist_image}')")

			connection.execute(f"INSERT INTO requests \
			(SCRAPE_DATE, TABLE_NAME, SEARCH_NAME, ARTIST)\
			VALUES ('{scrape_date}', '{table_name}','{search_name}', '{artist}')")
			

		print("Inserted data into database successfully...")

		scrape_date_str = str(scrape_date).split(" ")[0]
		#  + " " + str(scrape_date).split(" ")[1] + " UTC"

		cache = f"As of: {scrape_date} UTC"

		total_videos_str = str(total_videos_in_playlist) + " Videos"
		number_scraped = int(len(df))
		analytics_base_url = "/query?name=" + input_name + "&analytics=base"

		return render_template("index.html", cache = scrape_date_str, data = json_data,\
		artist_name = artist_name,\
		subscribers = f"{subscribers_str} Subscribers",\
		total_views=f"{total_views_str} All-Time Views",\
		joined=f"Joined {joined_str}", artist_image=artist_image,\
		total_videos = total_videos_str,\
		analytics_base_url=analytics_base_url)

	# except:
	# 	# Creating Bad Requests Table
	# 	connection.execute("\
	# 	CREATE TABLE IF NOT EXISTS bad_requests(\
	# 	ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,\
	# 	SCRAPE_DATE DATETIME,\
	# 	SEARCH_NAME VARCHAR(355) CHARACTER SET UTF8MB4\
	# 	)")

	# 	connection.execute(f"INSERT INTO bad_requests \
	# 	(SCRAPE_DATE, SEARCH_NAME) \
	# 	VALUES ('{scrape_date}','{search_name}')")

	# 	# Generating Error Reason
	# 	json_data = []

	# 	eight_ball=["It is certain",
	# 				"It is decidedly so",
	# 				"Without a doubt",
	# 				"Yes - definitely",
	# 				"You may rely on it",
	# 				"As I see it, yes",
	# 				"Most likely",
	# 				"Outlook good",
	# 				"Yes",
	# 				"Signs point to yes",
	# 				"Reply hazy, try again",
	# 				"Ask again later",
	# 				"Better not tell you now",
	# 				"Cannot predict now",
	# 				"Concentrate and ask again",
	# 				"Don't count on it",
	# 				"My reply is no",
	# 				"My sources say no",
	# 				"Outlook not so good",
	# 				"Very doubtful"]

	# 	random_int = random.randint(0,19)
	# 	reason = 'Magic 8-ball says, "' + eight_ball[random_int] + '."'
	# 	return render_template("uh-oh.html", data = json_data, reason=reason)
		
if __name__ == "__main__":
	app.run()


