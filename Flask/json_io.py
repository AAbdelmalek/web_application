# Import Dependencies
from flask import Flask
from flask import render_template
from flask import url_for
from bs4 import BeautifulSoup as bs
import requests
import numpy as np
import pandas as pd
from datetime import datetime
import time
from sqlalchemy import create_engine
import pymysql
pymysql.install_as_MySQLdb()

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
@app.route("/")
def output():

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
	input_name = input("Enter Youtuber's Name: ")
	print(input_name)

	input_date_range = input("How far back in time do you want to go? (YYYY-MM-DD) or (all-time): ")
	print(input_date_range)

	if input_date_range == "all-time":
		converted_input_date = datetime.strptime("1950-01-01", '%Y-%m-%d')
		
	else:
		try:
			converted_input_date = datetime.strptime(input_date_range, '%Y-%m-%d')
			
		except:
			print("Input date is not valid.")
			exit()

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
	artist_name = about_soup.find("meta", property="og:title").get("content")

	subscribers = about_soup.find_all("span", class_="about-stat")[0].text
	subscribers_int = int(subscribers.split(" ")[0].replace(",",""))

	total_views = about_soup.find_all("span", class_="about-stat")[1].text
	total_views_int = int(total_views[3:len(total_views)].split(" ")[0].replace(",",""))

	joined = about_soup.find_all("span", class_="about-stat")[2].text
	joined_temp = joined.split(" ")[1:4]
	joined_convert = convertDate(joined_temp)

	print(f"Artist: {artist_name}")
	print(f"Subscribers: {subscribers_int}")
	print(f"Views: {total_views_int}")
	print(f"Joined: {joined_convert}")

	# Replacing spaces withunderscores for new table name
	artist_db_name = artist_name.replace(" ","_").replace("`","")

	# Checking Database to See if Data was Previously Scraped
	df_cache = []
	try:
		df_cache = pd.read_sql(f"SELECT artists.ARTIST, artists.SCRAPE_DATE, artists.SEARCH_NAME, JOINED, SUBSCRIBERS, TOTAL_VIEWS, \
		{artist_db_name}.PUBLISHED, \
		{artist_db_name}.TITLE, {artist_db_name}.CATEGORY , {artist_db_name}.DURATION, {artist_db_name}.VIEWS, \
		{artist_db_name}.LIKES, {artist_db_name}.DISLIKES, {artist_db_name}.PAID, {artist_db_name}.FAMILY_FRIENDLY, \
		{artist_db_name}.URL FROM artists \
		INNER JOIN {artist_db_name} \
		ON artists.artist = {artist_db_name}.artist",connection)
		
	except:
		print("Not found in database")

	if len(df_cache) != 0:
		scrape_date = df_cache.loc[0,"SCRAPE_DATE"]
		print(f"A cached scrape ({scrape_date} UTC) has been found...")
		json_data = df_cache.to_json(orient="records")
		#return render_template("../static/app.js", name=json_data)
		return render_template("index.html", data=json_data)		
		
	else:
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

		# proceed = input("Proceed with scrape? (y/n)")

		# if proceed == "n" or proceed == "N":
		#     exit()

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

		# Going to Each Video and Extracting Data
		published_on = []
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
				total_duration = duration_mins + duration_secs/60
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

				percent_complete = round(((i+1) / (len(urls_all)))*100,2)

				print(f"{percent_complete}% complete...")
			
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
				bump = bump + 1
				continue
				
		urls_to_date = urls_all[0:len(published_on)]

		# Create DataFrame
		df = pd.DataFrame({"Artist" : artist_name,
						"Scrape_Date" : scrape_datetime,
						"Search_Name" : input_name,
						"Joined" : joined_convert,
						"Subscribers" : subscribers_int,
						"Total_Views" : total_views_int,
						"Published": published_on,
						"Title" : title_videos,
						"Category" : categories,
						"Duration" : duration_videos,
						"Views" : views,
						"Likes" : likes,
						"Dislikes" : dislikes,
						"Paid" : paid_list,
						"Family_Friendly" : family_friendly,
						"URL" : urls_to_date,
						})

		df = df.sort_values("Published",ascending=False)
		
		# Saving to CSV
		df.to_csv(f"{artist_name}_scrape.csv")

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
		JOINED DATE,\
		SUBSCRIBERS INT,\
		TOTAL_VIEWS BIGINT\
		)")

		# Getting df values and inserting into appropriate tables
		for i in range(len(df)):
			scrape_date = df.loc[i,"Scrape_Date"]
			search_name = df.loc[i,"Search_Name"]
			table_name = artist_db_name
			artist = df.loc[i,"Artist"].replace("`","")
			joined = df.loc[i,"Joined"]
			subscribers = df.loc[i,"Subscribers"]
			total_views = df.loc[i,"Total_Views"]
			published = df.loc[i,"Published"]
			title = df.loc[i,"Title"].replace("'","").replace('"',"").replace(']',"")\
			.replace('[',"").replace('\\',"").replace("%","").replace("`","")
			category = df.loc[i,"Category"]
			duration = df.loc[i,"Duration"]
			views = df.loc[i,"Views"]
			likes = df.loc[i,"Likes"]
			dislikes = df.loc[i,"Dislikes"]
			paid = df.loc[i,"Paid"]
			family_friendly = df.loc[i,"Family_Friendly"]
			url =  df.loc[i,"URL"]

			connection.execute(f"INSERT INTO {artist_db_name}\
			(SCRAPE_DATE, SEARCH_NAME, ARTIST, PUBLISHED, TITLE, CATEGORY , DURATION,\
			VIEWS, LIKES, DISLIKES, PAID, FAMILY_FRIENDLY, URL)\
			VALUES ('{scrape_date}','{search_name}', '{artist}', '{published}', '{title}', '{category}',\
			'{duration}', '{views}', '{likes}', '{dislikes}', '{paid}',\
			'{family_friendly}', '{url}')")

		connection.execute(f"INSERT INTO artists \
		(SCRAPE_DATE, TABLE_NAME, SEARCH_NAME, ARTIST, JOINED, SUBSCRIBERS, TOTAL_VIEWS)\
		VALUES ('{scrape_date}', '{table_name}','{search_name}', '{artist}', '{joined}', '{subscribers}',\
		'{total_views}')")

		print("Inserted data into database successfully...")

		#return render_template("../static/app.js", name=json_data)
		
		return render_template("index.html", data=json_data)

if __name__ == "__main__":
	app.run()


