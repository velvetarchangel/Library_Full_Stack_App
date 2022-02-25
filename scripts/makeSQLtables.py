import pandas as pd
import os
import yaml

import mysql.connector as msql
from mysql.connector import Error

def connectToDB():
  try:
    db_config_file = open("scripts/DBspecs.yaml")
    parsed_yaml_file = yaml.load(db_config_file)
    conn = msql.connect(host=parsed_yaml_file.get("localhost"), 
                        user=parsed_yaml_file.get("username"),  
                        password=parsed_yaml_file.get("password")
                        )
    if conn.is_connected():
        cursor = conn.cursor()
        cursor.execute("CREATE DATABASE employee")
        print("Database is created")
  except Error as e:
      print("Error while connecting to MySQL", e)

def createItemTable():
  pass

def createCopyOfItemTable():
  pass

def createMoviesTable():
  pass

def createActorTable():
  pass

def createDirectorTable():
  pass

def createActorActsTable():
  pass

def createDirectorDirects():
  pass

def createAuthorTable():
  pass

def createBookTable():
  pass

def createWritesTable():
  pass


if __name__=="__main__":
  connectToDB()
  MOVIES_PATH = os.path.join(os.getcwd(), "data", "movies.csv")
  BOOKS_PATH = os.path.join(os.getcwd(), "data", "books.csv")
  movies = pd.read_csv(MOVIES_PATH)
  books = pd.read_csv (BOOKS_PATH)
