from pymongo import MongoClient

mongo = MongoClient("localhost", 27017)
db = mongo["tonbotexampledb"]
users = db["users"]

users.create_index([("id", 1)], unique = True)