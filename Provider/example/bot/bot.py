from flask import Flask, request
from pymongo import MongoClient
import telebot

from threading import Thread
import json

mongo = MongoClient("localhost", 27017)
db = mongo["tonbotexampledb"]


### Bot Thread ###

bot = telebot.TeleBot(" *** token *** ")

@bot.message_handler(content_types = ["text"])
def get_text_messages(message):
    try:
        if message.text == "/start":
            try:
                db["users"].insert_one({"id": message.from_user.id})
            except Exception as e:
                pass
            bot.send_message(message.from_user.id, "Start")
        elif message.text == "/stop":
            try:
                db["users"].delete_one({"id": message.from_user.id})
            except Exception as e:
                pass
            bot.send_message(message.from_user.id, "Stop")
        else:
            bot.send_message(message.from_user.id, "Unknown command")
    except Exception as e:
        pass

class TelegramBotThread(Thread):
    def __init__(self, bot):
        self.bot = bot
        Thread.__init__(self)

    def run(self):     
        self.bot.polling(none_stop = True, interval = 0)



### Flask App ###

app = Flask(__name__)

@app.route("/", methods = ["POST"])
def hello():
    notification = request.json

    users = list(db["users"].find({}))
    for user in users:
        try:
            jsonStr = json.dumps(notification, sort_keys = True)

            det = "destination: <code>"+notification["notification"]["dst"]+"</code>\n"
            src = "source: <code>"+notification["notification"]["src"]+"</code>\n"
            val = notification["notification"]["value_dec"].rjust(10, "0")
            crystals = "value: <b>"+val[:-9] + "." + val[-9:]+"</b> TON\n\n"

            bot.send_message(user["id"], det + src + crystals + jsonStr, parse_mode = "HTML")
        except Exception as e:
            print(e)
            #pass

    #print(notification )
    return json.dumps({"success":True}), 200, {"ContentType":"application/json"} 



### Main ###

if __name__ == "__main__":
    botThread = TelegramBotThread(bot)
    botThread.start()

    app.run(host = "0.0.0.0", port = 8924)
    
