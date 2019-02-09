# Import Dependencies
from flask import Flask
from flask import render_template
from flask import url_for
from flask import request
from flask import redirect
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
from os.path import join, dirname, realpath
# import atexit
from sqlalchemy import text
pymysql.install_as_MySQLdb()
not_found_in_db = 0
youtube_code_new_scrape = ""
artist_name_new_scrape = ""
subscribers_int_new_scrape = ""
total_views_int_new_scrape = ""
joined_convert_new_scrape = ""
artist_image_new_scrape = ""
global_search_name = ""
cancel = 0
videos_to_get = 0
infinite_counter = 12
percent_complete = 100

# Initialize Flask
app = Flask(__name__)

# About Page
@app.route("/about")
def aboutPage():


	return render_template("about.html")


# Load Progress
@app.route("/loading")
def percent():
	global percent_complete
	percent_series = pd.Series({"PERCENT_COMPLETE":percent_complete})
	print(percent_series)
	percent_json = percent_series.to_json(orient="index")

	return percent_json


# Infinite Scroll
@app.route("/infiniteScroll")
def sendCard():

	connection = create_engine('mysql://root:Mars@127.0.0.1')
	connection.execute("USE web_app_dev")

	global infinite_counter
	# Get next 4 cards
	artists_table = pd.read_sql(f"SELECT ARTISTS.ARTIST_CODE, ARTISTS.ARTIST, ARTISTS.ARTIST_IMAGE FROM ARTISTS \
								  INNER JOIN REQUESTS ON REQUESTS.ARTIST_CODE = ARTISTS.ARTIST_CODE \
								  ORDER BY REQUESTS.ID DESC LIMIT 12 OFFSET {infinite_counter};", connection) 

	# artists_table = artists_table[["ARTIST","ARTIST_CODE"]]
	# artist_0 = artists_table.loc[0,"ARTIST_CODE"]
	# artist_1 = artists_table.loc[1,"ARTIST_CODE"]
	# artist_2 = artists_table.loc[2,"ARTIST_CODE"]
	# artist_3 = artists_table.loc[3,"ARTIST_CODE"]

	json_data = artists_table.to_json(orient="records")
	
	infinite_counter = infinite_counter + 12

	return json_data

# Report Bug Route
@app.route("/reportbug", methods=['POST','GET'])
def reportBug():	
	bug = request.form['reportedbug']
	page_key = request.args.get('page')
	page = 	input_name = '''{}'''.format(page_key)

	name_key = request.args.get('name')
	name = 	input_name = '''{}'''.format(name_key)

	date = datetime.now().strftime("%Y-%m-%d")
	# name = request.args["name"]
	# Connect to Database Server
	connection = create_engine('mysql://root:Mars@127.0.0.1')

	# Creating database if not exists
	connection.execute("CREATE DATABASE IF NOT EXISTS web_app_dev")
	connection.execute("USE web_app_dev")

	# Create Bugs Table
	connection.execute('CREATE TABLE IF NOT EXISTS bugs(\
	ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,\
	DATE VARCHAR(255) CHARACTER SET UTF8MB4,\
	BUG VARCHAR(255) CHARACTER SET UTF8MB4)')

	sql = text('INSERT INTO BUGS (DATE, BUG) VALUES (:date,:msg)')

	# Insert Bug
	# connection.execute(f"INSERT INTO BUGS (DATE, BUG) VALUES ('{date}','{bug}')")
	connection.execute(sql,date=date,msg=bug)
	print(bug)
	if page == "home":
		return redirect("/")

	elif page == "about":

		return redirect("/about")

	else:
		return redirect(f"/query?name={name}&analytics=base")

# Cancel Scrape Request
@app.route("/cancel")
def end_program():
	global cancel
	global percent_complete
	percent_complete = 100
	cancel = 1
	# shutdown()

	page_key = request.args.get("page")
	page = '''{}'''.format(page_key)
	name_key = request.args.get('name')
	name = '''{}'''.format(name_key)
	# analytics_key = request.args.get("page")
	# analytics = '''{}'''.format(analytics_key)
	print(f"page number is : {page}")

	# name_key = request.args.get("name")
	# name = '''{}'''.format(name_key)

	# Connect to Database Server
	connection = create_engine('mysql://root:Mars@127.0.0.1')

	# Creating database if not exists
	connection.execute("CREATE DATABASE IF NOT EXISTS web_app_dev")
	connection.execute("USE web_app_dev")

	# artists_table = pd.read_sql("SELECT * FROM SEARCHES ORDER BY ID DESC LIMIT 1", connection) 

	# artist_db_name = artists_table.loc[0,"ARTIST_CODE"]

	artist_db_name = name

	print(f"CANCEL VALUE IS {cancel}")
	if page == "3":
		
		return redirect(f'/query?name={artist_db_name}&analytics=base')

	# elif analytics == "base":

	# 	return redirect(f'/query?name={artist_db_name}&analytics=base')

	else:
		# raise ValueError("Cancelling this")
		# return home()
		return redirect("/")


def shutdown():
	global cancel
	# print(f"Cancel: {cancel}")
	# print(f"Cancel: {cancel}")
	# # newPull(cancel)
	# # return cancel
	# func = request.environ.get('werkzeug.server.shutdown')
	# func()
	# return test(cancel)
	return cancel

# Update Stale Data
@app.route("/update")
def newScrape():
	global percent_complete
	global cancel
	cancel=0
	# try:

	# Start Clock, Set Variables
	start = time.time()
	json_data = []
	json_data_1 = []
	cache = ""
	percent_complete_str = "0"

	# Connect to Database Server
	connection = create_engine('mysql://root:Mars@127.0.0.1')

	# Creating database if not exists
	connection.execute("CREATE DATABASE IF NOT EXISTS web_app_dev")
	connection.execute("USE web_app_dev")

	# Creating Table for Requests
	connection.execute("\
	CREATE TABLE IF NOT EXISTS requests(\
	ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,\
	SCRAPE_DATE DATETIME,\
	SEARCH_NAME varchar(255) CHARACTER SET UTF8MB4,\
	ARTIST VARCHAR(255) CHARACTER SET UTF8MB4,\
	ARTIST_CODE VARCHAR(255) CHARACTER SET UTF8MB4 NOT NULL\
	)")

	# Convert Date from Jan 1, 1999 format to datetime object
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

	converted_input_date = datetime.strptime("1944-06-06", '%Y-%m-%d')

	
	# Get Search Key Value
	name_key = request.args['name']
	input_name = '''{}'''.format(name_key)
	youtube_code = input_name.replace("_replaced_","-")
	#table_name = youtube_code_orig.replace("-","")
	search_name = input_name.replace("-","_replaced_")

	# Get Scrape Date
	scrape_date = datetime.now().strftime("%Y-%m-%d")
	scrape_datetime = datetime.utcnow()

	# try:
	# First Links
	videos_link = "https://www.youtube.com/channel/" + youtube_code + "/videos"
	about_link = "https://www.youtube.com/channel/" + youtube_code + "/about"

	print(videos_link)
	print(about_link)

	# Get About Information
	about_html = requests.get(about_link)

	# Parse HTML
	about_soup = bs(about_html.text, "lxml")

	# Artist Image
	artist_image = about_soup.find("img", class_="channel-header-profile-image").get("src")

	# Artist Information
	try:
		artist_name = about_soup.find("meta", property="og:title").get("content")

		subscribers = about_soup.find_all("span", class_="about-stat")[0].text
		subscribers_str = subscribers.split(" ")[0]

		try:
			subscribers_int = int(subscribers.split(" ")[0].replace(",",""))

		except:
			subscribers_int = 0

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

	# Setting Table Name
	artist_db_name = youtube_code.replace("-","_replaced_")

	# Youtube Code
	youtube_code = input_name

	# Getting ALL Playlist Names
	videos_response=requests.get(videos_link)
	videos_soup = bs(videos_response.text,"lxml")
	videos_soup.find_all("span",class_="branded-page-module-title-text")

	playlist_names_html = videos_soup.find_all("span",class_="branded-page-module-title-text")
	playlist_names = []

	for name in playlist_names_html:

		if name.text != "\nUploads\n" or name.text != "\nLiked videos\n":
			playlist_names.append(name.text.replace("\n",""))
			
	extra_playlists = videos_soup.find_all("span",class_="branded-page-module-title")
	
	playlist_names.append("Uploads")

	# Getting ALL Playlist URLS
	playlist_urls_html = videos_soup.find_all("a",class_="branded-page-module-title-link")
	playlist_urls = []
	playlist_uploads_link = "https://www.youtube.com" + "/playlist?list=UU" + youtube_code[2:]

	for playlist in playlist_urls_html:

		if "/user/" not in playlist.get("href"):
			playlist_urls.append("https://www.youtube.com" + playlist.get("href"))
			
	playlist_urls.append(playlist_uploads_link)

	print(f"Found {len(playlist_urls)} playlists:")

	for i in range(len(playlist_urls)):
		print(f"{playlist_names[i]}: {playlist_urls[i]}")

	urls_all = []
	counter = 0
	total_videos_all = 0
	for playlist_link in playlist_urls:    

		# global cancel
		# shutdown() 

		# # print(cancel)
		# if cancel == 1:
		# 	cancel = 0
		# 	percent_complete = 100
		# 	raise ValueError('A cancel request was submitted, cancelling process.')
		
		print(f"Getting {playlist_names[counter]} urls now...")

		# Get Playlist Response
		playlist_response = requests.get(playlist_link)

		# Create Playlist Soup Object
		playlist_soup = bs(playlist_response.text, 'lxml')

		# Get First Video URL as Starting Point
		try:
			first_video = "https://www.youtube.com" + playlist_soup.find_all("a", class_="pl-video-title-link")[0].get("href").split("&")[0]

		except:
			continue

		first_video_within_playlist = first_video + "&" + playlist_link.split("?")[1]

	#     print(first_video_within_playlist)

		# Create Soup Object for First Video Inside Playlist
		playlist_inside_request = requests.get(first_video_within_playlist) 

		playlist_inside_soup = bs(playlist_inside_request.text, "lxml")
		
		total_videos_in_playlist = int(playlist_inside_soup.find("span", id="playlist-length").text.replace(" videos","").replace(" video","").replace(",",""))
		print(f"Videos in playlist: {total_videos_in_playlist}")
		total_videos_all = total_videos_all + total_videos_in_playlist

		if total_videos_in_playlist == 1:
			urls_all.append(first_video)
			raise ValueError('The person only has one video.')

		else:
			number_of_videos_in_page = len(playlist_inside_soup.find_all("span", class_="index")) 
			last_video_index = int(playlist_inside_soup.find_all("span", class_="index")[-1].text.replace("\n        ","").replace("\n    ",""))
			last_shown_link = playlist_inside_soup.find_all("span", class_="index")[-1].find_next("a").get("href")
			link_fix = "https://www.youtube.com" + last_shown_link

		#     print("Getting urls...")

			for i in range(total_videos_in_playlist):  
				# shutdown() 
				# global cancel
				if cancel == 1:
					cancel = 0
					print("Cancelling this scrape...")
					raise ValueError('A cancel request was submitted, cancelling process.')

				if i == 0:       
					first_link = playlist_inside_soup.find("span", class_="index", text=f"\n        ▶\n    ")
					url = "https://www.youtube.com" + first_link.find_next("a").get("href")
					original_url = url.split("&")[0]
					if original_url not in urls_all:
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

					if original_url not in urls_all:
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
					if original_url not in urls_all:
						urls_all.append(original_url)
				
			counter += 1

#             request_duration = time.time() - start
	#         if request_duration >  1000:
	#             json_data = []
	#             reason = "The request took too long to complete."
	#             return render_template("uh-oh.html", data = json_data, reason=reason)

	# except:
	#     print("Something went wrong getting video urls..")

	# Cranberries Fix

	if len(urls_all) == 0:
		print("CRANBERRIES BUG")
		print("One of those weird artists with no uploads playlist but still has videos")
		[playlist_names_html.append(extra) for extra in extra_playlists]
		extra_urls_span = videos_soup.find_all("span", class_="contains-addto")
		extra_urls = []
		urls_all = ["http://www.youtube.com" + url.a.get('href') for url in extra_urls_span]

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

	print(f"There are {len(urls_all)} total videos to get...")
	# global cancel
	for i in range(len(urls_all)):

		# shutdown() 
		if cancel == 1:
			cancel = 0
			print("Cancelling this scrape...")
			percent_complete = 100
			raise ValueError('A cancel request was submitted, cancelling process.')
	
		# print(cancel)

		# shutdown()
		
		# if cancel == 1:

		# 	# cancel = 0
		# 	raise ValueError('A cancel request was submitted, cancelling process.')

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
			
			# Percent Complete
			
			percent_complete = round(((i+1) / (len(urls_all)))*100,0)

			percent_complete_str = str(percent_complete)

			print(f"{percent_complete}% complete...")

	#         request_duration = time.time() - start
	#         if request_duration >  1000:
	#             json_data = []
	#             reason = "The request took too long to complete."
	#             return render_template("uh-oh.html", data = json_data, reason=reason)

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
	
	youtube_code = input_name.replace("-","_replaced_")

	total_videos_all = len(urls_all)

	# Create DataFrame
	df = pd.DataFrame({"ARTIST" : artist_name,
					"SCRAPE_DATE" : scrape_datetime,
					"SEARCH_NAME" : input_name,
					"TOTAL_VIDEOS" : total_videos_all,
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
					"ARTIST_CODE" : youtube_code,
					})

	# print(df["PUBLISHED"])

	df = df.sort_values(by=["PUBLISHED"], ascending=False).reset_index()

	# print(df["PUBLISHED"])

	# Saving to CSV
	df_csv = df[["ARTIST","SCRAPE_DATE","TOTAL_VIDEOS","JOINED","SUBSCRIBERS","TOTAL_VIEWS",\
	"PUBLISHED","TITLE","CATEGORY","DURATION","VIEWS","LIKES","DISLIKES","PAID","FAMILY_FRIENDLY",\
	"URL","ARTIST_CODE"]].set_index("ARTIST")

	static_path = join(dirname(realpath(__file__)), 'static')
	df_csv.to_csv(f"{static_path}/{input_name.replace('_replaced_','-')}_scrape.csv", encoding="utf-8")

	# Saving to JSON
	json_data = df.to_json(orient="records")

	# Insert Data into Database
	print("Inserting data into database...")
	# Dropping Old Data
	connection.execute(f"\
	DROP TABLE {youtube_code}")

	# Removing Artist From Artists Table So It Can Be Updated
	connection.execute(f"DELETE FROM artists WHERE ARTIST_CODE = '{youtube_code}'")

	# Creating table for videos
	connection.execute(f"\
	CREATE TABLE IF NOT EXISTS {youtube_code} (\
	ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,\
	SCRAPE_DATE DATETIME,\
	SEARCH_NAME varchar(255) CHARACTER SET UTF8MB4,\
	ARTIST VARCHAR(255) CHARACTER SET UTF8MB4,\
	PUBLISHED DATE,\
	PUBLISHED_STR VARCHAR(255),\
	TITLE VARCHAR(255) CHARACTER SET UTF8MB4,\
	CATEGORY VARCHAR(255) CHARACTER SET UTF8MB4,\
	DURATION FLOAT,\
	VIEWS BIGINT,\
	LIKES INT,\
	DISLIKES INT,\
	COMMENTS INT,\
	PAID VARCHAR(255) CHARACTER SET UTF8MB4,\
	FAMILY_FRIENDLY VARCHAR(255) CHARACTER SET UTF8MB4,\
	URL VARCHAR(255) CHARACTER SET UTF8MB4,\
	ARTIST_CODE VARCHAR(255) CHARACTER SET UTF8MB4 NOT NULL\
	)")

	# Creating Table for Artist data
	connection.execute("\
	CREATE TABLE IF NOT EXISTS artists(\
	ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,\
	SCRAPE_DATE DATETIME,\
	SEARCH_NAME varchar(255) CHARACTER SET UTF8MB4,\
	ARTIST VARCHAR(255) CHARACTER SET UTF8MB4,\
	TOTAL_VIDEOS INT,\
	JOINED DATE,\
	SUBSCRIBERS INT,\
	TOTAL_VIEWS BIGINT,\
	ARTIST_IMAGE VARCHAR(255) CHARACTER SET UTF8MB4,\
	ARTIST_CODE VARCHAR(255) CHARACTER SET UTF8MB4 NOT NULL UNIQUE\
	)")

	# Creating Table for Requests
	connection.execute("\
	CREATE TABLE IF NOT EXISTS requests(\
	ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,\
	SCRAPE_DATE DATETIME,\
	SEARCH_NAME varchar(255) CHARACTER SET UTF8MB4,\
	ARTIST VARCHAR(255) CHARACTER SET UTF8MB4,\
	ARTIST_CODE VARCHAR(255) CHARACTER SET UTF8MB4 NOT NULL\
	)")

	# Getting df values and inserting into appropriate tables
	for i in range(len(df)):
		scrape_date = df.loc[i,"SCRAPE_DATE"]
		search_name = df.loc[i,"SEARCH_NAME"]
		table_name = artist_db_name
		artist = df.loc[i,"ARTIST"].replace("`","").replace("'"," ")
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
		artist_code =  df.loc[i,"ARTIST_CODE"]

		connection.execute(f"INSERT INTO {youtube_code}\
		(SCRAPE_DATE, SEARCH_NAME, ARTIST, PUBLISHED, PUBLISHED_STR, TITLE, CATEGORY , DURATION,\
		VIEWS, LIKES, DISLIKES, PAID, FAMILY_FRIENDLY, URL, ARTIST_CODE)\
		VALUES ('{scrape_date}','{search_name}', '{artist}', '{published}', \
		'{published_str}','{title}', '{category}',\
		'{duration}', '{views}', '{likes}', '{dislikes}', '{paid}',\
		'{family_friendly}', '{url}','{artist_code}')")

	if subscribers == "Not available":
		connection.execute(f"INSERT INTO artists \
		(SCRAPE_DATE, SEARCH_NAME, ARTIST, TOTAL_VIDEOS, JOINED, SUBSCRIBERS, TOTAL_VIEWS, ARTIST_IMAGE, ARTIST_CODE)\
		VALUES ('{scrape_date}','{search_name}', '{artist}', '{total_videos_all}', \
		'{joined}', NULL,\
		'{total_views}','{artist_image}', '{artist_code}')")

		# connection.execute(f"INSERT INTO requests \
		# (SCRAPE_DATE, SEARCH_NAME, ARTIST, ARTIST_CODE)\
		# VALUES ('{scrape_date}','{search_name}', '{artist}','{artist_code}')")

	else:
		connection.execute(f"INSERT INTO artists \
		(SCRAPE_DATE, SEARCH_NAME, ARTIST, TOTAL_VIDEOS, JOINED, SUBSCRIBERS, TOTAL_VIEWS, ARTIST_IMAGE, ARTIST_CODE)\
		VALUES ('{scrape_date}','{search_name}', '{artist}', '{total_videos_all}',\
		'{joined}', '{subscribers}', '{total_views}','{artist_image}','{artist_code}')")

		# connection.execute(f"INSERT INTO requests \
		# (SCRAPE_DATE, SEARCH_NAME, ARTIST, ARTIST_CODE)\
		# VALUES ('{scrape_date}','{search_name}', '{artist}','{artist_code}')")


	print("Inserted data into database successfully...")

	# Searching for input Artist
	df_cache = pd.read_sql(f"SELECT artists.ARTIST, {artist_db_name}.SCRAPE_DATE, artists.SEARCH_NAME, JOINED, SUBSCRIBERS, TOTAL_VIEWS, \
	{artist_db_name}.PUBLISHED_STR, artists.TOTAL_VIDEOS, artists.ARTIST_CODE, \
	{artist_db_name}.TITLE, {artist_db_name}.CATEGORY , {artist_db_name}.DURATION, {artist_db_name}.VIEWS, \
	{artist_db_name}.LIKES, {artist_db_name}.DISLIKES, {artist_db_name}.PAID, {artist_db_name}.FAMILY_FRIENDLY, \
	{artist_db_name}.URL, artists.ARTIST_IMAGE FROM artists \
	INNER JOIN {artist_db_name} \
	ON artists.ARTIST_CODE = {artist_db_name}.ARTIST_CODE", connection)

	df_cache = df_cache.sort_values(by="PUBLISHED_STR",ascending=False).reset_index()

	# Artist 0 Information
	scrape_date = df_cache.loc[0,"SCRAPE_DATE"]
	cache = f"{scrape_date} scrape"
	json_data = df_cache.to_json(orient="records")
	scrape_date = df_cache.loc[0,"SCRAPE_DATE"]
	scrape_date_str = str(scrape_date).split(" ")[0]
	total_videos_str = format(df_cache.loc[1,"TOTAL_VIDEOS"],",") + " Videos"
	number_scraped = int(len(df_cache))
	artist_name = df_cache.loc[0,"ARTIST"]
	analytics_base_url = "/query?name=" + artist_db_name + "&analytics=base"

	if df_cache.loc[0,"SUBSCRIBERS"] != 0:
		subscribers_str = format(df_cache.loc[0,"SUBSCRIBERS"],",")
	
	else:
		subscribers_str = "N/A"

	joined_str = df_cache.loc[0,"JOINED"]
	total_views_str = format(df_cache.loc[0,"TOTAL_VIEWS"],",")
	artist_image = df_cache.loc[0,"ARTIST_IMAGE"]
	csv_filepath = input_name.replace("_replaced_","-") + "_scrape.csv"
	print(f"CANCEL VALUE IS {cancel}")
	
	return redirect(f'/query?name={artist_db_name}&analytics=base')

# New Scrape Request
@app.route("/pull")
def newPull():
	global percent_complete
	global cancel
	# try:

	# Start Clock, Set Variables
	start = time.time()
	json_data = []
	json_data_1 = []
	cache = ""
	percent_complete_str = "0"

	# Connect to Database Server
	connection = create_engine('mysql://root:Mars@127.0.0.1')

	# Creating database if not exists
	connection.execute("CREATE DATABASE IF NOT EXISTS web_app_dev")
	connection.execute("USE web_app_dev")

	# Creating Table for Requests
	connection.execute("\
	CREATE TABLE IF NOT EXISTS requests(\
	ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,\
	SCRAPE_DATE DATETIME,\
	SEARCH_NAME varchar(255) CHARACTER SET UTF8MB4,\
	ARTIST VARCHAR(255) CHARACTER SET UTF8MB4,\
	ARTIST_CODE VARCHAR(255) CHARACTER SET UTF8MB4 NOT NULL\
	)")

	# Convert Date from Jan 1, 1999 format to datetime object
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

	converted_input_date = datetime.strptime("1944-06-06", '%Y-%m-%d')

	
	# Get Search Key Value
	name_key = request.args['name']
	input_name = '''{}'''.format(name_key)
	youtube_code = input_name
	#table_name = youtube_code_orig.replace("-","")
	search_name = input_name.replace("-","_replaced_")

	# Get Scrape Date
	scrape_date = datetime.now().strftime("%Y-%m-%d")
	scrape_datetime = datetime.utcnow()

	# try:
	# First Links
	videos_link = "https://www.youtube.com/channel/" + youtube_code + "/videos"
	about_link = "https://www.youtube.com/channel/" + youtube_code + "/about"

	print(videos_link)
	print(about_link)

	# Get About Information
	about_html = requests.get(about_link)

	# Parse HTML
	about_soup = bs(about_html.text, "lxml")

	# Artist Image
	artist_image = about_soup.find("img", class_="channel-header-profile-image").get("src")

	# Artist Information
	try:
		artist_name = about_soup.find("meta", property="og:title").get("content")

		subscribers = about_soup.find_all("span", class_="about-stat")[0].text
		subscribers_str = subscribers.split(" ")[0]

		try:
			subscribers_int = int(subscribers.split(" ")[0].replace(",",""))

		except:
			subscribers_int = 0

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

	# Setting Table Name
	artist_db_name = youtube_code.replace("-","_replaced_")

	# Youtube Code
	youtube_code = input_name

	# Getting ALL Playlist Names
	videos_response=requests.get(videos_link)
	videos_soup = bs(videos_response.text,"lxml")
	videos_soup.find_all("span",class_="branded-page-module-title-text")

	playlist_names_html = videos_soup.find_all("span",class_="branded-page-module-title-text")
	playlist_names = []

	for name in playlist_names_html:

		if name.text != "\nUploads\n" or name.text != "\nLiked videos\n":
			playlist_names.append(name.text.replace("\n",""))
			
	extra_playlists = videos_soup.find_all("span",class_="branded-page-module-title")
	
	playlist_names.append("Uploads")

	# Getting ALL Playlist URLS
	playlist_urls_html = videos_soup.find_all("a",class_="branded-page-module-title-link")
	playlist_urls = []
	playlist_uploads_link = "https://www.youtube.com" + "/playlist?list=UU" + youtube_code[2:]

	for playlist in playlist_urls_html:

		if "/user/" not in playlist.get("href"):
			playlist_urls.append("https://www.youtube.com" + playlist.get("href"))
			
	playlist_urls.append(playlist_uploads_link)

	print(f"Found {len(playlist_urls)} playlists:")

	for i in range(len(playlist_urls)):
		print(f"{playlist_names[i]}: {playlist_urls[i]}")

	urls_all = []
	counter = 0
	total_videos_all = 0
	for playlist_link in playlist_urls:    

		# global cancel
		# shutdown() 

		# # print(cancel)
		# if cancel == 1:
		# 	cancel = 0
		# 	percent_complete = 100
		# 	raise ValueError('A cancel request was submitted, cancelling process.')
		
		print(f"Getting {playlist_names[counter]} urls now...")

		# Get Playlist Response
		playlist_response = requests.get(playlist_link)

		# Create Playlist Soup Object
		playlist_soup = bs(playlist_response.text, 'lxml')

		# Get First Video URL as Starting Point
		try:
			first_video = "https://www.youtube.com" + playlist_soup.find_all("a", class_="pl-video-title-link")[0].get("href").split("&")[0]

		except:
			continue

		first_video_within_playlist = first_video + "&" + playlist_link.split("?")[1]

	#     print(first_video_within_playlist)

		# Create Soup Object for First Video Inside Playlist
		playlist_inside_request = requests.get(first_video_within_playlist) 

		playlist_inside_soup = bs(playlist_inside_request.text, "lxml")
		
		total_videos_in_playlist = int(playlist_inside_soup.find("span", id="playlist-length").text.replace(" videos","").replace(" video","").replace(",",""))
		print(f"Videos in playlist: {total_videos_in_playlist}")
		total_videos_all = total_videos_all + total_videos_in_playlist

		if total_videos_in_playlist == 1:
			urls_all.append(first_video)
			raise ValueError('The person only has one video.')

		else:
			number_of_videos_in_page = len(playlist_inside_soup.find_all("span", class_="index")) 
			last_video_index = int(playlist_inside_soup.find_all("span", class_="index")[-1].text.replace("\n        ","").replace("\n    ",""))
			last_shown_link = playlist_inside_soup.find_all("span", class_="index")[-1].find_next("a").get("href")
			link_fix = "https://www.youtube.com" + last_shown_link

		#     print("Getting urls...")

			for i in range(total_videos_in_playlist):  
				# shutdown() 
				# global cancel
				if cancel == 1:
					cancel = 0
					print("Cancelling this scrape...")
					raise ValueError('A cancel request was submitted, cancelling process.')

				if i == 0:       
					first_link = playlist_inside_soup.find("span", class_="index", text=f"\n        ▶\n    ")
					url = "https://www.youtube.com" + first_link.find_next("a").get("href")
					original_url = url.split("&")[0]
					if original_url not in urls_all:
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

					if original_url not in urls_all:
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
					if original_url not in urls_all:
						urls_all.append(original_url)
				
			counter += 1

#             request_duration = time.time() - start
	#         if request_duration >  1000:
	#             json_data = []
	#             reason = "The request took too long to complete."
	#             return render_template("uh-oh.html", data = json_data, reason=reason)

	# except:
	#     print("Something went wrong getting video urls..")

	# Cranberries Fix

	if len(urls_all) == 0:
		print("CRANBERRIES BUG")
		print("One of those weird artists with no uploads playlist but still has videos")
		[playlist_names_html.append(extra) for extra in extra_playlists]
		extra_urls_span = videos_soup.find_all("span", class_="contains-addto")
		extra_urls = []
		urls_all = ["http://www.youtube.com" + url.a.get('href') for url in extra_urls_span]

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

	print(f"There are {len(urls_all)} total videos to get...")
	# global cancel
	for i in range(len(urls_all)):

		# shutdown() 
		if cancel == 1:
			cancel = 0
			print("Cancelling this scrape...")
			percent_complete = 100
			raise ValueError('A cancel request was submitted, cancelling process.')
	
		# print(cancel)

		# shutdown()
		
		# if cancel == 1:

		# 	# cancel = 0
		# 	raise ValueError('A cancel request was submitted, cancelling process.')

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
			
			# Percent Complete
			
			percent_complete = round(((i+1) / (len(urls_all)))*100,0)

			percent_complete_str = str(percent_complete)

			print(f"{percent_complete}% complete...")

	#         request_duration = time.time() - start
	#         if request_duration >  1000:
	#             json_data = []
	#             reason = "The request took too long to complete."
	#             return render_template("uh-oh.html", data = json_data, reason=reason)

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
	total_videos_all = len(urls_all)
	youtube_code = input_name.replace("-","_replaced_")

	# Create DataFrame
	df = pd.DataFrame({"ARTIST" : artist_name,
					"SCRAPE_DATE" : scrape_datetime,
					"SEARCH_NAME" : input_name,
					"TOTAL_VIDEOS" : total_videos_all,
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
					"ARTIST_CODE" : youtube_code,
					})

	# print(df["PUBLISHED"])

	df = df.sort_values(by=["PUBLISHED"], ascending=False).reset_index()

	# print(df["PUBLISHED"])

	# Saving to CSV
	df_csv = df[["ARTIST","SCRAPE_DATE","TOTAL_VIDEOS","JOINED","SUBSCRIBERS","TOTAL_VIEWS",\
	"PUBLISHED","TITLE","CATEGORY","DURATION","VIEWS","LIKES","DISLIKES","PAID","FAMILY_FRIENDLY",\
	"URL","ARTIST_CODE"]].set_index("ARTIST")

	static_path = join(dirname(realpath(__file__)), 'static')
	df_csv.to_csv(f"{static_path}/{input_name}_scrape.csv", encoding="utf-8")

	# Saving to JSON
	json_data = df.to_json(orient="records")

	# Insert Data into Database
	print("Inserting data into database...")
	# Creating table for videos
	connection.execute(f"\
	CREATE TABLE IF NOT EXISTS {youtube_code} (\
	ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,\
	SCRAPE_DATE DATETIME,\
	SEARCH_NAME varchar(255) CHARACTER SET UTF8MB4,\
	ARTIST VARCHAR(255) CHARACTER SET UTF8MB4,\
	PUBLISHED DATE,\
	PUBLISHED_STR VARCHAR(255),\
	TITLE VARCHAR(255) CHARACTER SET UTF8MB4,\
	CATEGORY VARCHAR(255) CHARACTER SET UTF8MB4,\
	DURATION FLOAT,\
	VIEWS BIGINT,\
	LIKES INT,\
	DISLIKES INT,\
	COMMENTS INT,\
	PAID VARCHAR(255) CHARACTER SET UTF8MB4,\
	FAMILY_FRIENDLY VARCHAR(255) CHARACTER SET UTF8MB4,\
	URL VARCHAR(255) CHARACTER SET UTF8MB4,\
	ARTIST_CODE VARCHAR(255) CHARACTER SET UTF8MB4 NOT NULL\
	)")

	# Creating Table for Artist data
	connection.execute("\
	CREATE TABLE IF NOT EXISTS artists(\
	ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,\
	SCRAPE_DATE DATETIME,\
	SEARCH_NAME varchar(255) CHARACTER SET UTF8MB4,\
	ARTIST VARCHAR(255) CHARACTER SET UTF8MB4,\
	TOTAL_VIDEOS INT,\
	JOINED DATE,\
	SUBSCRIBERS INT,\
	TOTAL_VIEWS BIGINT,\
	ARTIST_IMAGE VARCHAR(255) CHARACTER SET UTF8MB4,\
	ARTIST_CODE VARCHAR(255) CHARACTER SET UTF8MB4 NOT NULL UNIQUE\
	)")

	# Creating Table for Requests
	connection.execute("\
	CREATE TABLE IF NOT EXISTS requests(\
	ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,\
	SCRAPE_DATE DATETIME,\
	SEARCH_NAME varchar(255) CHARACTER SET UTF8MB4,\
	ARTIST VARCHAR(255) CHARACTER SET UTF8MB4,\
	ARTIST_CODE VARCHAR(255) CHARACTER SET UTF8MB4 NOT NULL\
	)")

	# Getting df values and inserting into appropriate tables
	for i in range(len(df)):
		scrape_date = df.loc[i,"SCRAPE_DATE"]
		search_name = df.loc[i,"SEARCH_NAME"]
		table_name = artist_db_name
		artist = df.loc[i,"ARTIST"].replace("`","").replace("'"," ")
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
		artist_code =  df.loc[i,"ARTIST_CODE"]

		connection.execute(f"INSERT INTO {youtube_code}\
		(SCRAPE_DATE, SEARCH_NAME, ARTIST, PUBLISHED, PUBLISHED_STR, TITLE, CATEGORY , DURATION,\
		VIEWS, LIKES, DISLIKES, PAID, FAMILY_FRIENDLY, URL, ARTIST_CODE)\
		VALUES ('{scrape_date}','{search_name}', '{artist}', '{published}', \
		'{published_str}','{title}', '{category}',\
		'{duration}', '{views}', '{likes}', '{dislikes}', '{paid}',\
		'{family_friendly}', '{url}','{artist_code}')")

	if subscribers == "Not available":
		connection.execute(f"INSERT INTO artists \
		(SCRAPE_DATE, SEARCH_NAME, ARTIST, TOTAL_VIDEOS, JOINED, SUBSCRIBERS, TOTAL_VIEWS, ARTIST_IMAGE, ARTIST_CODE)\
		VALUES ('{scrape_date}','{search_name}', '{artist}', '{total_videos_all}', \
		'{joined}', NULL,\
		'{total_views}','{artist_image}', '{artist_code}')")

		connection.execute(f"INSERT INTO requests \
		(SCRAPE_DATE, SEARCH_NAME, ARTIST, ARTIST_CODE)\
		VALUES ('{scrape_date}','{search_name}', '{artist}','{artist_code}')")

	else:
		connection.execute(f"INSERT INTO artists \
		(SCRAPE_DATE, SEARCH_NAME, ARTIST, TOTAL_VIDEOS, JOINED, SUBSCRIBERS, TOTAL_VIEWS, ARTIST_IMAGE, ARTIST_CODE)\
		VALUES ('{scrape_date}','{search_name}', '{artist}', '{total_videos_all}',\
		'{joined}', '{subscribers}', '{total_views}','{artist_image}','{artist_code}')")

		connection.execute(f"INSERT INTO requests \
		(SCRAPE_DATE, SEARCH_NAME, ARTIST, ARTIST_CODE)\
		VALUES ('{scrape_date}','{search_name}', '{artist}','{artist_code}')")


	print("Inserted data into database successfully...")

	# Searching for input Artist
	df_cache = pd.read_sql(f"SELECT artists.ARTIST, {artist_db_name}.SCRAPE_DATE, artists.SEARCH_NAME, JOINED, SUBSCRIBERS, TOTAL_VIEWS, \
	{artist_db_name}.PUBLISHED_STR, artists.TOTAL_VIDEOS, artists.ARTIST_CODE, \
	{artist_db_name}.TITLE, {artist_db_name}.CATEGORY , {artist_db_name}.DURATION, {artist_db_name}.VIEWS, \
	{artist_db_name}.LIKES, {artist_db_name}.DISLIKES, {artist_db_name}.PAID, {artist_db_name}.FAMILY_FRIENDLY, \
	{artist_db_name}.URL, artists.ARTIST_IMAGE FROM artists \
	INNER JOIN {artist_db_name} \
	ON artists.ARTIST_CODE = {artist_db_name}.ARTIST_CODE", connection)

	df_cache = df_cache.sort_values(by="PUBLISHED_STR",ascending=False).reset_index()

	# Artist 0 Information
	scrape_date = df_cache.loc[0,"SCRAPE_DATE"]
	cache = f"{scrape_date} scrape"
	json_data = df_cache.to_json(orient="records")
	scrape_date = df_cache.loc[0,"SCRAPE_DATE"]
	scrape_date_str = str(scrape_date).split(" ")[0]
	total_videos_str = format(df_cache.loc[1,"TOTAL_VIDEOS"],",") + " Videos"
	number_scraped = int(len(df_cache))
	artist_name = df_cache.loc[0,"ARTIST"]
	analytics_base_url = "/query?name=" + artist_db_name + "&analytics=base"

	if df_cache.loc[0,"SUBSCRIBERS"] != 0:
		subscribers_str = format(df_cache.loc[0,"SUBSCRIBERS"],",")
	
	else:
		subscribers_str = "N/A"

	joined_str = df_cache.loc[0,"JOINED"]
	total_views_str = format(df_cache.loc[0,"TOTAL_VIEWS"],",")
	artist_image = df_cache.loc[0,"ARTIST_IMAGE"]
	csv_filepath = input_name.replace("_replaced_","-") + "_scrape.csv"
	print(f"CANCEL VALUE IS {cancel}")
	
	return redirect(f'/query?name={artist_db_name}&analytics=base')

	# return render_template("base_analytics.html", data=json_data, cache=scrape_date_str,\
	# artist_name=artist_name,\
	# subscribers = subscribers_str,\
	# total_views=f"{total_views_str} All-Time Views", joined=joined_str,\
	# artist_image=artist_image,\
	# total_videos = total_videos_str,\
	# analytics_base_url=analytics_base_url, number_scraped=number_scraped,\
	# youtube_code = csv_filepath,
	# scrape_date = scrape_date_str, content_creator=artist_db_name)

		
# 	except:
# 		site = "pull"
# 		# Creating Bad Requests Table
# 		connection.execute("\
# 		CREATE TABLE IF NOT EXISTS bad_requests(\
# 		ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,\
# 		SCRAPE_DATE DATETIME,\
# 		ARTIST_CODE varchar(255) CHARACTER SET UTF8MB4,\
# 		SEARCH_NAME varchar(255) CHARACTER SET UTF8MB4,\
# 		SITE varchar(255) CHARACTER SET UTF8MB4\
# 		)")

# 		connection.execute(f"INSERT INTO bad_requests \
# 		(SCRAPE_DATE, ARTIST_CODE, SEARCH_NAME, SITE) \
# 		VALUES ('{scrape_datetime}','{search_name}', '{global_search_name}', '{site}')")

# 		# Generating Error Reason
# 		json_data = []

# 		eight_ball=["It is certain",
# 					"It is decidedly so",
# 					"Without a doubt",
# 					"Yes - definitely",
# 					"You may rely on it",
# 					"As I see it, yes",
# 					"Most likely",
# 					"Outlook good",
# 					"Yes",
# 					"Signs point to yes",
# 					"Reply hazy, try again",
# 					"Ask again later",
# 					"Better not tell you now",
# 					"Cannot predict now",
# 					"Concentrate and ask again",
# 					"Don't count on it",
# 					"My reply is no",
# 					"My sources say no",
# 					"Outlook not so good",
# 					"Very doubtful"]

# 		random_int = random.randint(0,19)
# 		reason = 'Magic 8-ball says, "' + eight_ball[random_int] + '."'
# 		return render_template("uh-oh.html", data = json_data, reason=reason)

# Home Page
@app.route("/")
def home(not_found_in_db = not_found_in_db, youtube_code_new_scrape=\
youtube_code_new_scrape, artist_name_new_scrape=artist_name_new_scrape,\
subscribers_int_new_scrape=subscribers_int_new_scrape,\
total_views_int_new_scrape=total_views_int_new_scrape,\
joined_convert_new_scrape=joined_convert_new_scrape,\
artist_image_new_scrape = artist_image_new_scrape,\
cancel=cancel,videos_to_get=videos_to_get):

	print(f"CANCEL VALUE IS {cancel}")

	# Set Variables, Render Home Page
	global infinite_counter
	infinite_counter = 12
	json_data = []
	json_data_1 = []
	analytics_base_url = "#"
	analytics_base_url_1 = "#"

	# Connect to Database Server
	connection = create_engine('mysql://root:Mars@127.0.0.1')

	# Creating database if not exists
	connection.execute("CREATE DATABASE IF NOT EXISTS web_app_dev")
	connection.execute("USE web_app_dev")

	# Creating Table for Requests
	connection.execute("\
	CREATE TABLE IF NOT EXISTS requests(\
	ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,\
	SCRAPE_DATE DATETIME,\
	SEARCH_NAME varchar(255) CHARACTER SET UTF8MB4,\
	ARTIST VARCHAR(255) CHARACTER SET UTF8MB4,\
	ARTIST_CODE VARCHAR(255) CHARACTER SET UTF8MB4 NOT NULL\
	)")

	# Getting Last Artists to also Display on Home Page	
	artists_table = pd.read_sql("SELECT * FROM REQUESTS ORDER BY ID DESC LIMIT 12", connection) 

	artist_0 = artists_table.loc[0,"ARTIST_CODE"]
	artist_db_name = artists_table.loc[1,"ARTIST_CODE"]
	artist_1 = artists_table.loc[2,"ARTIST_CODE"]
	artist_2 = artists_table.loc[3,"ARTIST_CODE"]
	artist_3 = artists_table.loc[4,"ARTIST_CODE"]
	artist_4 = artists_table.loc[5,"ARTIST_CODE"]
	artist_5 = artists_table.loc[6,"ARTIST_CODE"]
	artist_6 = artists_table.loc[7,"ARTIST_CODE"]
	artist_7 = artists_table.loc[8,"ARTIST_CODE"]
	artist_8 = artists_table.loc[9,"ARTIST_CODE"]
	artist_9 = artists_table.loc[10,"ARTIST_CODE"]
	artist_10 = artists_table.loc[11,"ARTIST_CODE"]

	
	# Get Artist 0 Info
	artist_0_table = pd.read_sql(f"SELECT artists.ARTIST, {artist_0}.SCRAPE_DATE, artists.SEARCH_NAME, JOINED, SUBSCRIBERS, TOTAL_VIEWS, \
	{artist_0}.PUBLISHED_STR, artists.TOTAL_VIDEOS, artists.ARTIST_CODE, \
	{artist_0}.TITLE, {artist_0}.CATEGORY , {artist_0}.DURATION, {artist_0}.VIEWS, \
	{artist_0}.LIKES, {artist_0}.DISLIKES, {artist_0}.PAID, {artist_0}.FAMILY_FRIENDLY, \
	{artist_0}.URL, artists.ARTIST_IMAGE FROM artists \
	INNER JOIN {artist_0} \
	ON artists.ARTIST_CODE = {artist_0}.ARTIST_CODE", connection)

	# Get Artist DB Info
	df_cache = pd.read_sql(f"SELECT artists.ARTIST, {artist_db_name}.SCRAPE_DATE, artists.SEARCH_NAME, JOINED, SUBSCRIBERS, TOTAL_VIEWS, \
	{artist_db_name}.PUBLISHED_STR, artists.TOTAL_VIDEOS, artists.ARTIST_CODE, \
	{artist_db_name}.TITLE, {artist_db_name}.CATEGORY , {artist_db_name}.DURATION, {artist_db_name}.VIEWS, \
	{artist_db_name}.LIKES, {artist_db_name}.DISLIKES, {artist_db_name}.PAID, {artist_db_name}.FAMILY_FRIENDLY, \
	{artist_db_name}.URL, artists.ARTIST_IMAGE FROM artists \
	INNER JOIN {artist_db_name} \
	ON artists.ARTIST_CODE = {artist_db_name}.ARTIST_CODE", connection)

	# Get Artist 1 Info
	artist_1_table = pd.read_sql(f"SELECT artists.ARTIST, {artist_1}.SCRAPE_DATE, artists.SEARCH_NAME, JOINED, SUBSCRIBERS, TOTAL_VIEWS, \
	{artist_1}.PUBLISHED_STR, artists.TOTAL_VIDEOS, \
	{artist_1}.TITLE, {artist_1}.CATEGORY , {artist_1}.DURATION, {artist_1}.VIEWS, \
	{artist_1}.LIKES, {artist_1}.DISLIKES, {artist_1}.PAID, {artist_1}.FAMILY_FRIENDLY, \
	{artist_1}.URL, artists.ARTIST_IMAGE FROM artists \
	INNER JOIN {artist_1} \
	ON artists.artist = {artist_1}.artist", connection)

	# Get Artist 2 Info	
	artist_2_table = pd.read_sql(f"SELECT artists.ARTIST, {artist_2}.SCRAPE_DATE, artists.SEARCH_NAME, JOINED, SUBSCRIBERS, TOTAL_VIEWS, \
	{artist_2}.PUBLISHED_STR, artists.TOTAL_VIDEOS, \
	{artist_2}.TITLE, {artist_2}.CATEGORY , {artist_2}.DURATION, {artist_2}.VIEWS, \
	{artist_2}.LIKES, {artist_2}.DISLIKES, {artist_2}.PAID, {artist_2}.FAMILY_FRIENDLY, \
	{artist_2}.URL, artists.ARTIST_IMAGE FROM artists \
	INNER JOIN {artist_2} \
	ON artists.artist = {artist_2}.artist", connection)

	# Get Artist 3 Info	
	artist_3_table = pd.read_sql(f"SELECT artists.ARTIST, {artist_3}.SCRAPE_DATE, artists.SEARCH_NAME, JOINED, SUBSCRIBERS, TOTAL_VIEWS, \
	{artist_3}.PUBLISHED_STR, artists.TOTAL_VIDEOS, \
	{artist_3}.TITLE, {artist_3}.CATEGORY , {artist_3}.DURATION, {artist_3}.VIEWS, \
	{artist_3}.LIKES, {artist_3}.DISLIKES, {artist_3}.PAID, {artist_3}.FAMILY_FRIENDLY, \
	{artist_3}.URL, artists.ARTIST_IMAGE FROM artists \
	INNER JOIN {artist_3} \
	ON artists.artist = {artist_3}.artist", connection)

	# Get Artist 4 Info	
	artist_4_table = pd.read_sql(f"SELECT artists.ARTIST, {artist_4}.SCRAPE_DATE, artists.SEARCH_NAME, JOINED, SUBSCRIBERS, TOTAL_VIEWS, \
	{artist_4}.PUBLISHED_STR, artists.TOTAL_VIDEOS, \
	{artist_4}.TITLE, {artist_4}.CATEGORY , {artist_4}.DURATION, {artist_4}.VIEWS, \
	{artist_4}.LIKES, {artist_4}.DISLIKES, {artist_4}.PAID, {artist_4}.FAMILY_FRIENDLY, \
	{artist_4}.URL, artists.ARTIST_IMAGE FROM artists \
	INNER JOIN {artist_4} \
	ON artists.artist = {artist_4}.artist", connection)

	# Get Artist 5 Info	
	artist_5_table = pd.read_sql(f"SELECT artists.ARTIST, {artist_5}.SCRAPE_DATE, artists.SEARCH_NAME, JOINED, SUBSCRIBERS, TOTAL_VIEWS, \
	{artist_5}.PUBLISHED_STR, artists.TOTAL_VIDEOS, \
	{artist_5}.TITLE, {artist_5}.CATEGORY , {artist_5}.DURATION, {artist_5}.VIEWS, \
	{artist_5}.LIKES, {artist_5}.DISLIKES, {artist_5}.PAID, {artist_5}.FAMILY_FRIENDLY, \
	{artist_5}.URL, artists.ARTIST_IMAGE FROM artists \
	INNER JOIN {artist_5} \
	ON artists.artist = {artist_5}.artist", connection)

	# Get Artist 6 Info	
	artist_6_table = pd.read_sql(f"SELECT artists.ARTIST, {artist_6}.SCRAPE_DATE, artists.SEARCH_NAME, JOINED, SUBSCRIBERS, TOTAL_VIEWS, \
	{artist_6}.PUBLISHED_STR, artists.TOTAL_VIDEOS, \
	{artist_6}.TITLE, {artist_6}.CATEGORY , {artist_6}.DURATION, {artist_6}.VIEWS, \
	{artist_6}.LIKES, {artist_6}.DISLIKES, {artist_6}.PAID, {artist_6}.FAMILY_FRIENDLY, \
	{artist_6}.URL, artists.ARTIST_IMAGE FROM artists \
	INNER JOIN {artist_6} \
	ON artists.artist = {artist_6}.artist", connection)

	# Get Artist 7 Info	
	artist_7_table = pd.read_sql(f"SELECT artists.ARTIST, {artist_7}.SCRAPE_DATE, artists.SEARCH_NAME, JOINED, SUBSCRIBERS, TOTAL_VIEWS, \
	{artist_7}.PUBLISHED_STR, artists.TOTAL_VIDEOS, \
	{artist_7}.TITLE, {artist_7}.CATEGORY , {artist_7}.DURATION, {artist_7}.VIEWS, \
	{artist_7}.LIKES, {artist_7}.DISLIKES, {artist_7}.PAID, {artist_7}.FAMILY_FRIENDLY, \
	{artist_7}.URL, artists.ARTIST_IMAGE FROM artists \
	INNER JOIN {artist_7} \
	ON artists.artist = {artist_7}.artist", connection)

	# Get Artist 8 Info	
	artist_8_table = pd.read_sql(f"SELECT artists.ARTIST, {artist_8}.SCRAPE_DATE, artists.SEARCH_NAME, JOINED, SUBSCRIBERS, TOTAL_VIEWS, \
	{artist_8}.PUBLISHED_STR, artists.TOTAL_VIDEOS, \
	{artist_8}.TITLE, {artist_8}.CATEGORY , {artist_8}.DURATION, {artist_8}.VIEWS, \
	{artist_8}.LIKES, {artist_8}.DISLIKES, {artist_8}.PAID, {artist_8}.FAMILY_FRIENDLY, \
	{artist_8}.URL, artists.ARTIST_IMAGE FROM artists \
	INNER JOIN {artist_8} \
	ON artists.artist = {artist_8}.artist", connection)

	# Get Artist 9 Info	
	artist_9_table = pd.read_sql(f"SELECT artists.ARTIST, {artist_9}.SCRAPE_DATE, artists.SEARCH_NAME, JOINED, SUBSCRIBERS, TOTAL_VIEWS, \
	{artist_9}.PUBLISHED_STR, artists.TOTAL_VIDEOS, \
	{artist_9}.TITLE, {artist_9}.CATEGORY , {artist_9}.DURATION, {artist_9}.VIEWS, \
	{artist_9}.LIKES, {artist_9}.DISLIKES, {artist_9}.PAID, {artist_9}.FAMILY_FRIENDLY, \
	{artist_9}.URL, artists.ARTIST_IMAGE FROM artists \
	INNER JOIN {artist_9} \
	ON artists.artist = {artist_9}.artist", connection)

	# Get Artist 10 Info	
	artist_10_table = pd.read_sql(f"SELECT artists.ARTIST, {artist_10}.SCRAPE_DATE, artists.SEARCH_NAME, JOINED, SUBSCRIBERS, TOTAL_VIEWS, \
	{artist_10}.PUBLISHED_STR, artists.TOTAL_VIDEOS, \
	{artist_10}.TITLE, {artist_10}.CATEGORY , {artist_10}.DURATION, {artist_10}.VIEWS, \
	{artist_10}.LIKES, {artist_10}.DISLIKES, {artist_10}.PAID, {artist_10}.FAMILY_FRIENDLY, \
	{artist_10}.URL, artists.ARTIST_IMAGE FROM artists \
	INNER JOIN {artist_10} \
	ON artists.artist = {artist_10}.artist", connection)
	
	# Artist 0 Information
	scrape_date_0 = artist_0_table.loc[0,"SCRAPE_DATE"]
	cache_0 = f"{scrape_date_0} scrape"
	json_data_0 = artist_0_table.to_json(orient="records")
	scrape_date_str_0 = str(scrape_date_0).split(" ")[0]
	total_videos_str_0 = format(artist_0_table.loc[0,"TOTAL_VIDEOS"],",") + " Videos"
	number_scraped_0 = int(len(artist_0_table))
	artist_0_name = artist_0_table.loc[0,"ARTIST"]
	analytics_base_url_0 = "/query?name=" + artist_0 + "&analytics=base"

	if artist_0_table.loc[0,"SUBSCRIBERS"] == 0:
		subscribers_0 = "N/A"
	else:
		subscribers_0 = format(artist_0_table.loc[0,"SUBSCRIBERS"],",")
	
	joined_0 = artist_0_table.loc[0,"JOINED"]
	total_views_0 = format(artist_0_table.loc[0,"TOTAL_VIEWS"],",")
	artist_image_0 = artist_0_table.loc[0,"ARTIST_IMAGE"]
	
	# Artist DB Information
	scrape_date = df_cache.loc[0,"SCRAPE_DATE"]
	cache = f"{scrape_date} scrape"
	json_data = df_cache.to_json(orient="records")
	scrape_date = df_cache.loc[0,"SCRAPE_DATE"]
	scrape_date_str = str(scrape_date).split(" ")[0]
	total_videos_str = format(df_cache.loc[0,"TOTAL_VIDEOS"],",") + " Videos"
	number_scraped = int(len(df_cache))
	artist_name = df_cache.loc[0,"ARTIST"]
	analytics_base_url = "/query?name=" + artist_db_name + "&analytics=base"

	if df_cache.loc[0,"SUBSCRIBERS"] == 0:
		subscribers_str = "N/A"
	else:
		subscribers_str = format(df_cache.loc[0,"SUBSCRIBERS"],",")

	joined_str = df_cache.loc[0,"JOINED"]
	total_views_str = format(df_cache.loc[0,"TOTAL_VIEWS"],",")
	artist_image = df_cache.loc[0,"ARTIST_IMAGE"]

	# Artist 1 Information
	scrape_date_1 = artist_1_table.loc[0,"SCRAPE_DATE"]
	cache_1 = f"{scrape_date_1} scrape"
	json_data_1 = artist_1_table.to_json(orient="records")
	scrape_date_str_1 = str(scrape_date_1).split(" ")[0]
	total_videos_str_1 = format(artist_1_table.loc[0,"TOTAL_VIDEOS"],",") + " Videos"
	number_scraped_1 = int(len(artist_1_table))
	artist_1_name = artist_1_table.loc[0,"ARTIST"]
	analytics_base_url_1 = "/query?name=" + artist_1 + "&analytics=base"

	if artist_1_table.loc[0,"SUBSCRIBERS"] == 0:
		subscribers_1 = "N/A"
	else:
		subscribers_1 = format(artist_1_table.loc[0,"SUBSCRIBERS"],",")

	joined_1 = artist_1_table.loc[0,"JOINED"]
	total_views_1 = format(artist_1_table.loc[0,"TOTAL_VIEWS"],",")
	artist_image_1 = artist_1_table.loc[0,"ARTIST_IMAGE"]

	# Artist 2 Information
	scrape_date_2 = artist_2_table.loc[0,"SCRAPE_DATE"]
	cache_2 = f"{scrape_date_2} scrape"
	json_data_2 = artist_2_table.to_json(orient="records")
	scrape_date_str_2 = str(scrape_date_2).split(" ")[0]
	total_videos_str_2 = format(artist_2_table.loc[0,"TOTAL_VIDEOS"],",") + " Videos"
	number_scraped_2 = int(len(artist_2_table))
	artist_2_name = artist_2_table.loc[0,"ARTIST"]
	analytics_base_url_2 = "/query?name=" + artist_2 + "&analytics=base"

	if artist_2_table.loc[0,"SUBSCRIBERS"] == 0:
		subscribers_2 = "N/A"
	else:
		subscribers_2 = format(artist_2_table.loc[0,"SUBSCRIBERS"],",")

	joined_2 = artist_2_table.loc[0,"JOINED"]
	total_views_2 = format(artist_2_table.loc[0,"TOTAL_VIEWS"],",")
	artist_image_2 = artist_2_table.loc[0,"ARTIST_IMAGE"]

	# Artist 3 Information
	scrape_date_3 = artist_3_table.loc[0,"SCRAPE_DATE"]
	cache_3 = f"{scrape_date_3} scrape"
	json_data_3 = artist_3_table.to_json(orient="records")
	scrape_date_str_3 = str(scrape_date_3).split(" ")[0]
	total_videos_str_3 = format(artist_3_table.loc[0,"TOTAL_VIDEOS"],",") + " Videos"
	number_scraped_3 = int(len(artist_3_table))
	artist_3_name = artist_3_table.loc[0,"ARTIST"]
	analytics_base_url_3 = "/query?name=" + artist_3 + "&analytics=base"

	if artist_3_table.loc[0,"SUBSCRIBERS"] == 0:
		subscribers_3 = "N/A"
	else:
		subscribers_3 = format(artist_3_table.loc[0,"SUBSCRIBERS"],",")

	joined_3 = artist_3_table.loc[0,"JOINED"]
	total_views_3 = format(artist_3_table.loc[0,"TOTAL_VIEWS"],",")
	artist_image_3 = artist_3_table.loc[0,"ARTIST_IMAGE"]

	# Artist 4 Information
	scrape_date_4 = artist_4_table.loc[0,"SCRAPE_DATE"]
	cache_4 = f"{scrape_date_4} scrape"
	json_data_4 = artist_4_table.to_json(orient="records")
	scrape_date_str_4 = str(scrape_date_4).split(" ")[0]
	total_videos_str_4 = format(artist_4_table.loc[0,"TOTAL_VIDEOS"],",") + " Videos"
	number_scraped_4 = int(len(artist_4_table))
	artist_4_name = artist_4_table.loc[0,"ARTIST"]
	analytics_base_url_4 = "/query?name=" + artist_4 + "&analytics=base"

	if artist_4_table.loc[0,"SUBSCRIBERS"] == 0:
		subscribers_4 = "N/A"
	else:
		subscribers_4 = format(artist_4_table.loc[0,"SUBSCRIBERS"],",")

	joined_4 = artist_4_table.loc[0,"JOINED"]
	total_views_4 = format(artist_4_table.loc[0,"TOTAL_VIEWS"],",")
	artist_image_4 = artist_4_table.loc[0,"ARTIST_IMAGE"]

	# Artist 5 Information
	scrape_date_5 = artist_5_table.loc[0,"SCRAPE_DATE"]
	cache_5 = f"{scrape_date_5} scrape"
	json_data_5 = artist_5_table.to_json(orient="records")
	scrape_date_str_5 = str(scrape_date_5).split(" ")[0]
	total_videos_str_5 = format(artist_5_table.loc[0,"TOTAL_VIDEOS"],",") + " Videos"
	number_scraped_5 = int(len(artist_5_table))
	artist_5_name = artist_5_table.loc[0,"ARTIST"]
	analytics_base_url_5 = "/query?name=" + artist_5 + "&analytics=base"

	if artist_5_table.loc[0,"SUBSCRIBERS"] == 0:
		subscribers_5 = "N/A"
	else:
		subscribers_5 = format(artist_5_table.loc[0,"SUBSCRIBERS"],",")

	joined_5 = artist_5_table.loc[0,"JOINED"]
	total_views_5 = format(artist_5_table.loc[0,"TOTAL_VIEWS"],",")
	artist_image_5 = artist_5_table.loc[0,"ARTIST_IMAGE"]

	# Artist 6 Information
	scrape_date_6 = artist_6_table.loc[0,"SCRAPE_DATE"]
	cache_6 = f"{scrape_date_6} scrape"
	json_data_6 = artist_6_table.to_json(orient="records")
	scrape_date_str_6 = str(scrape_date_6).split(" ")[0]
	total_videos_str_6 = format(artist_6_table.loc[0,"TOTAL_VIDEOS"],",") + " Videos"
	number_scraped_6 = int(len(artist_6_table))
	artist_6_name = artist_6_table.loc[0,"ARTIST"]
	analytics_base_url_6 = "/query?name=" + artist_6 + "&analytics=base"

	if artist_6_table.loc[0,"SUBSCRIBERS"] == 0:
		subscribers_6 = "N/A"
	else:
		subscribers_6 = format(artist_6_table.loc[0,"SUBSCRIBERS"],",")

	joined_6 = artist_6_table.loc[0,"JOINED"]
	total_views_6 = format(artist_6_table.loc[0,"TOTAL_VIEWS"],",")
	artist_image_6 = artist_6_table.loc[0,"ARTIST_IMAGE"]

	# Artist 7 Information
	scrape_date_7 = artist_7_table.loc[0,"SCRAPE_DATE"]
	cache_7 = f"{scrape_date_7} scrape"
	json_data_7 = artist_7_table.to_json(orient="records")
	scrape_date_str_7 = str(scrape_date_7).split(" ")[0]
	total_videos_str_7 = format(artist_7_table.loc[0,"TOTAL_VIDEOS"],",") + " Videos"
	number_scraped_7 = int(len(artist_7_table))
	artist_7_name = artist_7_table.loc[0,"ARTIST"]
	analytics_base_url_7 = "/query?name=" + artist_7 + "&analytics=base"

	if artist_7_table.loc[0,"SUBSCRIBERS"] == 0:
		subscribers_7 = "N/A"
	else:
		subscribers_7 = format(artist_7_table.loc[0,"SUBSCRIBERS"],",")

	joined_7 = artist_7_table.loc[0,"JOINED"]
	total_views_7 = format(artist_7_table.loc[0,"TOTAL_VIEWS"],",")
	artist_image_7 = artist_7_table.loc[0,"ARTIST_IMAGE"]

	# Artist 8 Information
	scrape_date_8 = artist_8_table.loc[0,"SCRAPE_DATE"]
	cache_8 = f"{scrape_date_8} scrape"
	json_data_8 = artist_8_table.to_json(orient="records")
	scrape_date_str_8 = str(scrape_date_8).split(" ")[0]
	total_videos_str_8 = format(artist_8_table.loc[0,"TOTAL_VIDEOS"],",") + " Videos"
	number_scraped_8 = int(len(artist_8_table))
	artist_8_name = artist_8_table.loc[0,"ARTIST"]
	analytics_base_url_8 = "/query?name=" + artist_8 + "&analytics=base"

	if artist_8_table.loc[0,"SUBSCRIBERS"] == 0:
		subscribers_8 = "N/A"
	else:
		subscribers_8 = format(artist_8_table.loc[0,"SUBSCRIBERS"],",")

	joined_8 = artist_8_table.loc[0,"JOINED"]
	total_views_8 = format(artist_8_table.loc[0,"TOTAL_VIEWS"],",")
	artist_image_8 = artist_8_table.loc[0,"ARTIST_IMAGE"]

	# Artist 9 Information
	scrape_date_9 = artist_9_table.loc[0,"SCRAPE_DATE"]
	cache_9 = f"{scrape_date_9} scrape"
	json_data_9 = artist_9_table.to_json(orient="records")
	scrape_date_str_9 = str(scrape_date_9).split(" ")[0]
	total_videos_str_9 = format(artist_9_table.loc[0,"TOTAL_VIDEOS"],",") + " Videos"
	number_scraped_9 = int(len(artist_9_table))
	artist_9_name = artist_9_table.loc[0,"ARTIST"]
	analytics_base_url_9 = "/query?name=" + artist_9 + "&analytics=base"

	if artist_9_table.loc[0,"SUBSCRIBERS"] == 0:
		subscribers_9 = "N/A"
	else:
		subscribers_9 = format(artist_9_table.loc[0,"SUBSCRIBERS"],",")

	joined_9 = artist_9_table.loc[0,"JOINED"]
	total_views_9 = format(artist_9_table.loc[0,"TOTAL_VIEWS"],",")
	artist_image_9 = artist_9_table.loc[0,"ARTIST_IMAGE"]

	# Artist 10 Information
	scrape_date_10 = artist_10_table.loc[0,"SCRAPE_DATE"]
	cache_10 = f"{scrape_date_10} scrape"
	json_data_10 = artist_10_table.to_json(orient="records")
	scrape_date_str_10 = str(scrape_date_10).split(" ")[0]
	total_videos_str_10 = format(artist_10_table.loc[0,"TOTAL_VIDEOS"],",") + " Videos"
	number_scraped_10 = int(len(artist_10_table))
	artist_10_name = artist_10_table.loc[0,"ARTIST"]
	analytics_base_url_10 = "/query?name=" + artist_10 + "&analytics=base"

	if artist_10_table.loc[0,"SUBSCRIBERS"] == 0:
		subscribers_10 = "N/A"
	else:
		subscribers_10 = format(artist_10_table.loc[0,"SUBSCRIBERS"],",")
	
	joined_10 = artist_10_table.loc[0,"JOINED"]
	total_views_10 = format(artist_10_table.loc[0,"TOTAL_VIEWS"],",")
	artist_image_10 = artist_10_table.loc[0,"ARTIST_IMAGE"]

	if subscribers_int_new_scrape == 0:
		subscribers_int_new_scrape = "N/A"
	
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
	analytics_base_url_2=analytics_base_url_2,\
	data_3=json_data_3, cache_3=scrape_date_str_3,\
	artist_name_3=artist_3_name,\
	subscribers_3 = f"{subscribers_3} Subscribers",\
	total_views_3 =f"{total_views_3} All-Time Views", joined_3=f"Joined {joined_3}",\
	artist_image_3 = artist_image_3,\
	total_videos_3 = total_videos_str_3,\
	analytics_base_url_3=analytics_base_url_3,\
	data_4=json_data_4, cache_4=scrape_date_str_4,\
	artist_name_4=artist_4_name,\
	subscribers_4 = f"{subscribers_4} Subscribers",\
	total_views_4 =f"{total_views_4} All-Time Views", joined_4=f"Joined {joined_4}",\
	artist_image_4 = artist_image_4,\
	total_videos_4 = total_videos_str_4,\
	analytics_base_url_4=analytics_base_url_4,\
	data_5=json_data_5, cache_5=scrape_date_str_5,\
	artist_name_5=artist_5_name,\
	subscribers_5 = f"{subscribers_5} Subscribers",\
	total_views_5 =f"{total_views_5} All-Time Views", joined_5=f"Joined {joined_5}",\
	artist_image_5 = artist_image_5,\
	total_videos_5 = total_videos_str_5,\
	analytics_base_url_5=analytics_base_url_5,\
	data_6=json_data_6, cache_6=scrape_date_str_6,\
	artist_name_6=artist_6_name,\
	subscribers_6 = f"{subscribers_6} Subscribers",\
	total_views_6 =f"{total_views_6} All-Time Views", joined_6=f"Joined {joined_6}",\
	artist_image_6 = artist_image_6,\
	total_videos_6 = total_videos_str_6,\
	analytics_base_url_6=analytics_base_url_6,\
	data_7=json_data_7, cache_7=scrape_date_str_7,\
	artist_name_7=artist_7_name,\
	subscribers_7 = f"{subscribers_7} Subscribers",\
	total_views_7 =f"{total_views_7} All-Time Views", joined_7=f"Joined {joined_7}",\
	artist_image_7 = artist_image_7,\
	total_videos_7 = total_videos_str_7,\
	analytics_base_url_7=analytics_base_url_7,\
	data_8=json_data_8, cache_8=scrape_date_str_8,\
	artist_name_8=artist_8_name,\
	subscribers_8 = f"{subscribers_8} Subscribers",\
	total_views_8 =f"{total_views_8} All-Time Views", joined_8=f"Joined {joined_8}",\
	artist_image_8 = artist_image_8,\
	total_videos_8 = total_videos_str_8,\
	analytics_base_url_8=analytics_base_url_8,\
	data_9=json_data_9, cache_9=scrape_date_str_9,\
	artist_name_9=artist_9_name,\
	subscribers_9 = f"{subscribers_9} Subscribers",\
	total_views_9 =f"{total_views_9} All-Time Views", joined_9=f"Joined {joined_9}",\
	artist_image_9 = artist_image_9,\
	total_videos_9 = total_videos_str_9,\
	analytics_base_url_9=analytics_base_url_9,\
	data_10=json_data_10, cache_10=scrape_date_str_10,\
	artist_name_10=artist_10_name,\
	subscribers_10 = f"{subscribers_10} Subscribers",\
	total_views_10 =f"{total_views_10} All-Time Views", joined_10=f"Joined {joined_10}",\
	artist_image_10 = artist_image_10,\
	total_videos_10 = total_videos_str_10,\
	analytics_base_url_10=analytics_base_url_10,\
	not_found_in_db=not_found_in_db,\
	youtube_code_new_scrape=youtube_code_new_scrape,\
	artist_name_new_scrape=artist_name_new_scrape,\
	subscribers_int_new_scrape=subscribers_int_new_scrape,\
	total_views_int_new_scrape=total_views_int_new_scrape,\
	joined_convert_new_scrape=joined_convert_new_scrape,\
	artist_image_new_scrape = artist_image_new_scrape,\
	data_0=json_data_0, cache_0=scrape_date_str_0,\
	artist_name_0=artist_0_name,\
	subscribers_0 = f"{subscribers_0} Subscribers",\
	total_views_0 =f"{total_views_0} All-Time Views", joined_0=f"Joined {joined_0}",\
	artist_image_0 = artist_image_0,\
	total_videos_0 = total_videos_str_0,\
	analytics_base_url_0=analytics_base_url_0,\
	videos_to_get = videos_to_get)

# Query String
@app.route("/query")
def search(not_found_in_db = not_found_in_db, youtube_code_new_scrape=\
youtube_code_new_scrape, artist_name_new_scrape=artist_name_new_scrape,\
subscribers_int_new_scrape=subscribers_int_new_scrape,\
total_views_int_new_scrape=total_views_int_new_scrape,\
joined_convert_new_scrape=joined_convert_new_scrape,\
artist_image_new_scrape = artist_image_new_scrape,\
cancel=cancel):

	# Feedback Fix
	content_creator_key = request.args.get('db')
	content_creator = '''{}'''.format(content_creator_key)
	print(content_creator)

	if content_creator != "None":
		# Connect to Database Server
		connection = create_engine('mysql://root:Mars@127.0.0.1')

		# Creating database if not exists
		connection.execute("CREATE DATABASE IF NOT EXISTS web_app_dev")
		connection.execute("USE web_app_dev")

		df_cache = pd.read_sql(f"SELECT artists.ARTIST, {content_creator}.SCRAPE_DATE, artists.SEARCH_NAME, JOINED, SUBSCRIBERS, TOTAL_VIEWS, \
		{content_creator}.PUBLISHED_STR, artists.TOTAL_VIDEOS, artists.ARTIST_CODE, \
		{content_creator}.TITLE, {content_creator}.CATEGORY , {content_creator}.DURATION, {content_creator}.VIEWS, \
		{content_creator}.LIKES, {content_creator}.DISLIKES, {content_creator}.PAID, {content_creator}.FAMILY_FRIENDLY, \
		{content_creator}.URL, artists.ARTIST_IMAGE FROM artists \
		INNER JOIN {content_creator} \
		ON artists.ARTIST_CODE = {content_creator}.ARTIST_CODE", connection)

		df_cache = df_cache.sort_values(by="PUBLISHED_STR",ascending=False).reset_index()

		# Artist Information
		scrape_date = df_cache.loc[0,"SCRAPE_DATE"]
		
		cache = f"{scrape_date} scrape"
		json_data = df_cache.to_json(orient="records")
		scrape_date = df_cache.loc[0,"SCRAPE_DATE"]
		scrape_date_str = str(scrape_date).split(" ")[0]
		total_videos_str = str(df_cache.loc[0,"TOTAL_VIDEOS"]) + " Videos"
		number_scraped = int(len(df_cache))
		artist_name = df_cache.loc[0,"ARTIST"]
		analytics_base_url = "/query?name=" + content_creator + "&analytics=base"
		subscribers_str = df_cache.loc[0,"SUBSCRIBERS"]
		joined_str = df_cache.loc[0,"JOINED"]
		total_views_str = df_cache.loc[0,"TOTAL_VIEWS"]
		artist_image = df_cache.loc[0,"ARTIST_IMAGE"]
		csv_filepath = content_creator + "_scrape.csv"

		# Create Searches Table If Not Exists
		connection.execute("CREATE TABLE IF NOT EXISTS searches(\
		ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,\
		SCRAPE_DATE DATETIME,\
		ARTIST VARCHAR(255) CHARACTER SET UTF8MB4,\
		ARTIST_CODE VARCHAR(255) CHARACTER SET UTF8MB4 NOT NULL\
		)")

		# Insert Into Searches Table
		connection.execute(f"INSERT INTO searches \
		(SCRAPE_DATE, ARTIST, ARTIST_CODE)\
		VALUES ('{scrape_date}', '{artist_name}','{content_creator}')")

		print("Got artist data from database...")

		subscribers_format = format(subscribers_str,",")
		print(f"CANCEL VALUE IS {cancel}")

		# Return HTML
		return render_template("base_analytics.html", data=json_data, cache=scrape_date_str,\
		artist_name=artist_name,\
		subscribers = subscribers_format,\
		total_views=f"{total_views_str} All-Time Views", joined=joined_str,\
		artist_image=artist_image,\
		total_videos = total_videos_str,\
		analytics_base_url=analytics_base_url, number_scraped=number_scraped,\
		youtube_code = csv_filepath,
		scrape_date = scrape_date_str, content_creator=content_creator)

	# Get Search Key Value
	name_key = request.args.get('name')
	input_name = '''{}'''.format(name_key)
	global_search_name = input_name.replace("-","_replaced_")

	# try:
	# Start Clock, Set Variables
	start = time.time()
	json_data = []
	json_data_1 = []
	cache = ""
	percent_complete_str = "0"

	# Get Analytics Key Value
	analytics_key = request.args.get('analytics')
	input_analytics = '''{}'''.format(analytics_key)

	# Get Scrape Date
	scrape_date = datetime.now().strftime("%Y-%m-%d")
	scrape_datetime = datetime.utcnow()

	# Connect to Database Server
	connection = create_engine('mysql://root:Mars@127.0.0.1')

	# Creating database if not exists
	connection.execute("CREATE DATABASE IF NOT EXISTS web_app_dev")
	connection.execute("USE web_app_dev")
	
	if input_analytics == "base":

		print("SELECT data from database...")
		artist_db_name = input_name

		# Get Artist Info
		df_cache = pd.read_sql(f"SELECT artists.ARTIST, {artist_db_name}.SCRAPE_DATE, artists.SEARCH_NAME, JOINED, SUBSCRIBERS, TOTAL_VIEWS, \
		{artist_db_name}.PUBLISHED_STR, artists.TOTAL_VIDEOS, artists.ARTIST_CODE, \
		{artist_db_name}.TITLE, {artist_db_name}.CATEGORY , {artist_db_name}.DURATION, {artist_db_name}.VIEWS, \
		{artist_db_name}.LIKES, {artist_db_name}.DISLIKES, {artist_db_name}.PAID, {artist_db_name}.FAMILY_FRIENDLY, \
		{artist_db_name}.URL, artists.ARTIST_IMAGE FROM artists \
		INNER JOIN {artist_db_name} \
		ON artists.ARTIST_CODE = {artist_db_name}.ARTIST_CODE", connection)

		print(df_cache[["TITLE","SCRAPE_DATE","PUBLISHED_STR"]].head())
		df_cache = df_cache.sort_values(by=["PUBLISHED_STR"],ascending=False).reset_index()
		print(df_cache[["TITLE","SCRAPE_DATE","PUBLISHED_STR"]].head())

		# Artist Information
		scrape_date = df_cache.loc[0,"SCRAPE_DATE"]
		cache = f"{scrape_date} scrape"
		json_data = df_cache.to_json(orient="records")
		scrape_date = df_cache.loc[0,"SCRAPE_DATE"]
		scrape_date_str = str(scrape_date).split(" ")[0]
		total_videos_str = str(df_cache.loc[0,"TOTAL_VIDEOS"]) + " Videos"
		number_scraped = int(len(df_cache))
		artist_name = df_cache.loc[0,"ARTIST"]
		analytics_base_url = "/query?name=" + artist_db_name + "&analytics=base"
		subscribers_str = df_cache.loc[0,"SUBSCRIBERS"]
		joined_str = df_cache.loc[0,"JOINED"]
		total_views_str = df_cache.loc[0,"TOTAL_VIEWS"]
		artist_image = df_cache.loc[0,"ARTIST_IMAGE"]
		csv_filepath = input_name.replace("_replaced_","-") + "_scrape.csv"

		# Create Searches Table If Not Exists
		connection.execute("CREATE TABLE IF NOT EXISTS searches(\
		ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,\
		SCRAPE_DATE DATETIME,\
		ARTIST VARCHAR(255) CHARACTER SET UTF8MB4,\
		ARTIST_CODE VARCHAR(255) CHARACTER SET UTF8MB4 NOT NULL\
		)")

		# Insert Into Searches Table
		connection.execute(f"INSERT INTO searches \
		(SCRAPE_DATE, ARTIST, ARTIST_CODE)\
		VALUES ('{scrape_date}', '{artist_name}','{artist_db_name}')")

		print("Got artist data from database...")

		subscribers_format = format(subscribers_str,",")
		print(f"CANCEL VALUE IS {cancel}")
		print(f'scrape date python is: {scrape_date}')
		# Return HTML
		return render_template("base_analytics.html", data=json_data, cache=scrape_date_str,\
		artist_name=artist_name,\
		subscribers = subscribers_format,\
		total_views=f"{total_views_str} All-Time Views", joined=joined_str,\
		artist_image=artist_image,\
		total_videos = total_videos_str,\
		analytics_base_url=analytics_base_url, number_scraped=number_scraped,\
		youtube_code = csv_filepath,
		scrape_date = scrape_date_str, content_creator=artist_db_name, artist_db_name=artist_db_name)

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

	for x in range(10):
		try:
			print("1")
			youtube_name_soup = bs(get_youtube_url_response.text, "lxml")
			raw_youtube_name_link = youtube_name_soup.find_all("div", class_="yt-lockup-byline")[x].a.get("href")
			break

		except:
			print("2")
			print("Exception when pulling first video to get artists...using next")
			# youtube_name_soup = bs(get_youtube_url_response.text, "lxml")
			# raw_youtube_name_link = youtube_name_soup.find_all("div", class_="yt-lockup-byline")[x+1].a.get("href")

	videos_link = "https://www.youtube.com" + raw_youtube_name_link + "/videos"
	about_link = "https://www.youtube.com" + raw_youtube_name_link + "/about"

	print(videos_link)
	print(about_link)

	# Get About Information
	about_html = requests.get(about_link)

	# Parse HTML
	about_soup = bs(about_html.text, "lxml")

	# Artist Image
	artist_image = about_soup.find("img", class_="channel-header-profile-image").get("src")

	# Artist Information
	try:
		artist_name = about_soup.find("meta", property="og:title").get("content")

		subscribers = about_soup.find_all("span", class_="about-stat")[0].text
		subscribers_str = subscribers.split(" ")[0]
		
		try:
			subscribers_int = int(subscribers.split(" ")[0].replace(",",""))

		except:
			subscribers_int = 0

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

	# Convert User Name to UU Format
	youtube_code = raw_youtube_name_link.split("/")[2]

	if youtube_code[0:2] == "UC":

		youtube_code = raw_youtube_name_link.split("/")[2]
		playlist_link = "https://www.youtube.com" + "/playlist?list=UU" + youtube_code[2:] 

	elif youtube_code[0:2] != "UC":

		youtube_code_raw = about_soup.find("link", rel="canonical").get("href")
		youtube_code = youtube_code_raw.split("/")[4]
		playlist_link = "https://www.youtube.com" + "/playlist?list=UU" + youtube_code[2:]  

	artist_db_name = youtube_code.replace("-","_replaced_")

	# Checking Database to See if Data was Previously Scraped
	df_cache = []
	artist_1_table = []
	artist_2_table = []

	try:
		# Searching for input Artist
		df_cache = pd.read_sql(f"SELECT artists.ARTIST, {artist_db_name}.SCRAPE_DATE, artists.SEARCH_NAME, JOINED, SUBSCRIBERS, TOTAL_VIEWS, \
		{artist_db_name}.PUBLISHED_STR, artists.TOTAL_VIDEOS, artists.ARTIST_CODE, \
		{artist_db_name}.TITLE, {artist_db_name}.CATEGORY , {artist_db_name}.DURATION, {artist_db_name}.VIEWS, \
		{artist_db_name}.LIKES, {artist_db_name}.DISLIKES, {artist_db_name}.PAID, {artist_db_name}.FAMILY_FRIENDLY, \
		{artist_db_name}.URL, artists.ARTIST_IMAGE FROM artists \
		INNER JOIN {artist_db_name} \
		ON artists.ARTIST_CODE = {artist_db_name}.ARTIST_CODE", connection)

		df_cache = df_cache.sort_values(by="PUBLISHED_STR",ascending=False).reset_index()

	except:
		print("Not found in database")

		#return render_template("index.html", data="lololol")
		not_found_in_db = 1
		youtube_code_new_scrape = youtube_code
		artist_name_new_scrape = artist_name

		if subscribers_int != 0:
			subscribers_int_new_scrape = format(subscribers_int,",")

		else:
			subscribers_int_new_scrape = "N/A"

		total_views_int_new_scrape = format(total_views_int,",")
		joined_convert_new_scrape = str(joined_convert).split(" ")[0]
		artist_image_new_scrape = artist_image
		# Make 1000 the actual total uploads
		videos_to_get = format(1000,",")

		which_page = request.args.get("page")
		page = '''{}'''.format(which_page)
		print(f"PAGE IS EQUAL TO: {page}")

		if page == "1":
			print("i am within the page conditional")
			# return search(not_found_in_db, youtube_code_new_scrape,\
			# artist_name_new_scrape, subscribers_int_new_scrape,\
			# total_views_int_new_scrape,joined_convert_new_scrape,\
			# artist_image_new_scrape)

		# Checking Database to See if Data was Previously Scraped
			df_cache = []
			artist_1_table = []
			artist_2_table = []

			# Searching for input Artist
			# name_key = request.args.get('old')
			# input_name = '''{}'''.format(name_key)
			# artist_db_name = input_name

			# artists_table = pd.read_sql("SELECT * FROM SEARCHES ORDER BY ID DESC LIMIT 1", connection) 

			# artist_db_name = artists_table.loc[0,"ARTIST_CODE"]

			db_name = request.args.get('old')
			artist_db_name =  '''{}'''.format(db_name)

			df_cache = pd.read_sql(f"SELECT artists.ARTIST, {artist_db_name}.SCRAPE_DATE, artists.SEARCH_NAME, JOINED, SUBSCRIBERS, TOTAL_VIEWS, \
			{artist_db_name}.PUBLISHED_STR, artists.TOTAL_VIDEOS, artists.ARTIST_CODE, \
			{artist_db_name}.TITLE, {artist_db_name}.CATEGORY , {artist_db_name}.DURATION, {artist_db_name}.VIEWS, \
			{artist_db_name}.LIKES, {artist_db_name}.DISLIKES, {artist_db_name}.PAID, {artist_db_name}.FAMILY_FRIENDLY, \
			{artist_db_name}.URL, artists.ARTIST_IMAGE FROM artists \
			INNER JOIN {artist_db_name} \
			ON artists.ARTIST_CODE = {artist_db_name}.ARTIST_CODE", connection)

			df_cache = df_cache.sort_values(by="PUBLISHED_STR",ascending=False).reset_index()

			artist_name = df_cache.loc[0,"ARTIST"]
			scrape_date = df_cache.loc[0,"SCRAPE_DATE"]
			cache = f"{scrape_date} scrape"
			json_data = df_cache.to_json(orient="records")
			scrape_date_str = str(scrape_date).split(" ")[0]
			total_videos_str = str(df_cache.loc[0,"TOTAL_VIDEOS"]) + " Videos"
			number_scraped = int(len(df_cache))
			original_name = df_cache.loc[0,"ARTIST"]
			analytics_base_url = "/query?name=" + artist_db_name + "&analytics=base"
			subscribers = format(df_cache.loc[0,"SUBSCRIBERS"],",")
			joined = df_cache.loc[0,"JOINED"]
			#table_name_search = df_cache.loc[0,"TABLE_NAME"]
			search_table_name = df_cache.loc[0, "SEARCH_NAME"]
			total_views_str = format(df_cache.loc[0,"TOTAL_VIEWS"],",")
			artist_image = df_cache.loc[0,"ARTIST_IMAGE"]
			csv_filepath = artist_db_name.replace("_replaced_","-") + "_scrape.csv"
			print(f"CANCEL VALUE IS {cancel}")
			return render_template("base_analytics.html", data=json_data, cache=scrape_date_str,\
			artist_name=artist_name,\
			subscribers = subscribers_str,\
			total_views=f"{total_views_str} All-Time Views", joined=joined_str,\
			artist_image=artist_image,\
			total_videos = total_videos_str,\
			analytics_base_url=analytics_base_url, number_scraped=number_scraped,\
			youtube_code = csv_filepath,
			scrape_date = scrape_date_str,\
			not_found_in_db = not_found_in_db,\
			youtube_code_new_scrape=youtube_code_new_scrape, artist_name_new_scrape=artist_name_new_scrape,\
			subscribers_int_new_scrape=subscribers_int_new_scrape,\
			total_views_int_new_scrape=total_views_int_new_scrape,\
			joined_convert_new_scrape=joined_convert_new_scrape,\
			artist_image_new_scrape = artist_image_new_scrape,\
			cancel=cancel, videos_to_get = videos_to_get, content_creator=artist_db_name, artist_db_name=artist_db_name)

			# return redirect(f'/query?name={artist_db_name}&analytics=base&page=1')

		else:
			return home(not_found_in_db, youtube_code_new_scrape,\
			artist_name_new_scrape, subscribers_int_new_scrape,\
			total_views_int_new_scrape,joined_convert_new_scrape,\
			artist_image_new_scrape,videos_to_get)

	if len(df_cache) != 0:
		# Search Result Information
		print(f"A cached scrape ({scrape_date} UTC) has been found...")
		scrape_date = df_cache.loc[0,"SCRAPE_DATE"]
		cache = f"{scrape_date} scrape"
		json_data = df_cache.to_json(orient="records")
		scrape_date_str = str(scrape_date).split(" ")[0]
		total_videos_str = str(df_cache.loc[0,"TOTAL_VIDEOS"]) + " Videos"
		number_scraped = int(len(df_cache))
		original_name = df_cache.loc[0,"ARTIST"]
		analytics_base_url = "/query?name=" + artist_db_name + "&analytics=base"
		subscribers = format(df_cache.loc[0,"SUBSCRIBERS"],",")
		joined = df_cache.loc[0,"JOINED"]
		#table_name_search = df_cache.loc[0,"TABLE_NAME"]
		search_table_name = df_cache.loc[0, "SEARCH_NAME"]
		total_views_str = format(df_cache.loc[0,"TOTAL_VIEWS"],",")
		artist_image = df_cache.loc[0,"ARTIST_IMAGE"]
		csv_filepath = artist_db_name.replace("_replaced_","-") + "_scrape.csv"

		# Create Searches Table If Not Exists
		connection.execute("CREATE TABLE IF NOT EXISTS searches(\
		ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,\
		SCRAPE_DATE DATETIME,\
		ARTIST VARCHAR(255) CHARACTER SET UTF8MB4,\
		ARTIST_CODE VARCHAR(255) CHARACTER SET UTF8MB4 NOT NULL\
		)")

		# Insert Into Searches Table
		connection.execute(f"INSERT INTO searches \
		(SCRAPE_DATE, ARTIST, ARTIST_CODE)\
		VALUES ('{scrape_date}', '{original_name}','{artist_db_name}')")

		connection.execute(f"INSERT INTO requests \
		(SCRAPE_DATE, SEARCH_NAME, ARTIST, ARTIST_CODE)\
		VALUES ('{scrape_date}', '{input_name}', '{original_name}','{artist_db_name}')")
		
		print(f"CANCEL VALUE IS {cancel}")
		
		return redirect(f'/query?name={artist_db_name}&analytics=base&page=1')
		
		# return render_template("base_analytics.html", data=json_data, cache=scrape_date_str,\
		# artist_name=artist_name,\
		# subscribers = subscribers_str,\
		# total_views=f"{total_views_str} All-Time Views", joined=joined_str,\
		# artist_image=artist_image,\
		# total_videos = total_videos_str,\
		# analytics_base_url=analytics_base_url, number_scraped=number_scraped,\
		# youtube_code = csv_filepath,
		# scrape_date = scrape_date_str, not_found_in_db=0, content_creator=artist_db_name)

	# except:
		# # Creating Bad Requests Table

		# site = "query"
		# connection.execute("\
		# CREATE TABLE IF NOT EXISTS bad_requests(\
		# ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,\
		# SCRAPE_DATE DATETIME,\
		# ARTIST_CODE varchar(255) CHARACTER SET UTF8MB4,\
		# SEARCH_NAME varchar(255) CHARACTER SET UTF8MB4,\
		# SITE varchar(255) CHARACTER SET UTF8MB4\
		# )")

		# connection.execute(f"INSERT INTO bad_requests \
		# (SCRAPE_DATE, SEARCH_NAME, SITE) \
		# VALUES ('{scrape_datetime}','{input_name}', '{site}')")

		# # Generating Error Reason
		# json_data = []

		# eight_ball=["It is certain",
		# 			"It is decidedly so",
		# 			"Without a doubt",
		# 			"Yes - definitely",
		# 			"You may rely on it",
		# 			"As I see it, yes",
		# 			"Most likely",
		# 			"Outlook good",
		# 			"Yes",
		# 			"Signs point to yes",
		# 			"Reply hazy, try again",
		# 			"Ask again later",
		# 			"Better not tell you now",
		# 			"Cannot predict now",
		# 			"Concentrate and ask again",
		# 			"Don't count on it",
		# 			"My reply is no",
		# 			"My sources say no",
		# 			"Outlook not so good",
		# 			"Very doubtful"]

		# random_int = random.randint(0,19)
		# reason = 'Magic 8-ball says, "' + eight_ball[random_int] + '."'
		# return render_template("uh-oh.html", data = json_data, reason=reason)
		
# def test(cancel):
# 	if cancel == 1:
# 		# print(f"Cancel: {cancel}")
# 		# cancel = 0
# 		# app.run(port=8001)
# 		try:
# 			return app.run()
# 		except:
# 			return home()

if __name__ == "__main__":
	app.run(debug=True,threaded=True)

