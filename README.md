# HTTP Notification Provider Contest

**Dependencies**: MongoDb, NodeJs

**Features**
- using multiprocessing
- admin panel for the consumer

**api docs**
https://api.events.ton.arsen12.ru/

**statistics page**
https://events.ton.arsen12.ru/


## Provider

#### start instruction
Copy the provider folder to your server. 

Generate a keypair and write them into the `secret/provider.keys.json`. This keys will be used to sign the sent notifications.

Edit configs in configs folder: 
- `provider-info.json` - Provider information
- `config-mongo.json` - Contains database url
- `config-kafka.json` - Connection parameters for kafka
- `config-server.json` –
  - host, port - server api parameters
  - max_concurrency - maximum number of simultaneously processed messages
  - first_attempt_timeout - message timeout on first send ( if 0, no timeout )
  - next_attempts_timeout - message timeout on subsequent send
  - max_attempts - maximum number of retry attempts to send
  - retry_time_base - the base of the number to calculate the delay time between retransmissions. Time between dispatches is calculated as n^x, where n is
retry_time_base and x is a number of unsuccessful attempts.

Run `node init.js` to initialize the database.

Run `node index.js` to start the notification provider.

## Consumer
The consumer is an intermediate layer, he receives messages from the provider, decrypts them and forwards them to another address in accordance with the specified rules. In fact, it would be more correct to call this module a router For the convenience of users, the consumer has an admin panel. It simplifies consumer configuration and allows you to view the last received messages in decrypted form.

#### start instruction
Copy the consumer folder to your server. 

Edit configs in configs folder:

- `config-mongo.json` - Contains database url
- `config-server.json` –
  - receiverPort, receiverEndpoint - port and url for receiving notify from providers
  - adminPanelPort - port on which the admin panel will run

Run `node init.js` to initialize the database.

Run `node index.js` to start start the consumer.

More on how to subscribe to information [here](https://firebasestorage.googleapis.com/v0/b/ton-labs.appspot.com/o/documents%2Fapplication%2Fpdf%2Fkt2av5cf5rkut8v1mg-Contest.pdf?alt=media&token=baffb640-1a73-4421-bf2e-40f80ee758b3)




## Telegram bot
A bot is an example of a notification consumer. At startup, it starts listening to port 8924 and waits for decrypted messages there. The bot is available at the @ton_notifications_bot link. He sends messages to all users who have pressed `/start` about events on the network. To unsubscribe use `/stop`

#### start instruction

Run `python3 init.py` to initialize the database.

Run `python3 bot.py` to start start the consumer.

