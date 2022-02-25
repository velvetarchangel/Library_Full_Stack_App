import pandas as pd
import os

import mysql.connector as msql
from mysql.connector import Error

def connectToDB():
  try:
    conn = msql.connect(host='localhost', user='root',  
                        password='mysqlpassword'
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
