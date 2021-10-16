define({ "api": [
  {
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "varname1",
            "description": "<p>No type.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "varname2",
            "description": "<p>With type.</p>"
          }
        ]
      }
    },
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "./doc/main.js",
    "group": "/home/arsen/TON-Events/docs/doc/main.js",
    "groupTitle": "/home/arsen/TON-Events/docs/doc/main.js",
    "name": ""
  },
  {
    "type": "get",
    "url": "/api/info",
    "title": "Get provider info",
    "name": "Provider",
    "group": "Provider",
    "version": "1.0.0",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Provider ID</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Provider name</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "version",
            "description": "<p>Version</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "description",
            "description": "<p>Description</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "address",
            "description": "<p>support Address</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "icon",
            "description": "<p>provider Icon</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "public_key",
            "description": "<p>Public key for signing notifications</p>"
          }
        ]
      }
    },
    "filename": "./doc.py",
    "groupTitle": "Provider"
  },
  {
    "type": "post",
    "url": "/api/subscribe",
    "title": "Subscribe to notifications from provider",
    "name": "Provider",
    "group": "Provider",
    "version": "1.0.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "optional": false,
            "field": "Content-Type",
            "defaultValue": "application/x-www-form-urlencoded",
            "description": ""
          }
        ]
      }
    },
    "description": "<p>This method registers a new callback. Must be called twice. First time to get a secret, second to register a callback</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Base64String",
            "optional": false,
            "field": "data",
            "description": "<p>Encoded url for receiving notifications</p>"
          },
          {
            "group": "Parameter",
            "type": "HexString",
            "optional": false,
            "field": "hash",
            "description": "<p>User hash received from debot</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "isDebot",
            "defaultValue": "true",
            "description": "<p>Set to false if you need to receive responses in json format, if true the response will come in text format for display by debot</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "confirmed",
            "description": "<p>true if the callback was registered successfully</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": true,
            "field": "secret",
            "description": "<p>Secret to confirm ownership of the server, returned once for each user hash</p>"
          }
        ]
      }
    },
    "filename": "./doc.py",
    "groupTitle": "Provider"
  },
  {
    "type": "post",
    "url": "/api/test",
    "title": "Send a test message to user",
    "name": "Provider",
    "group": "Provider",
    "version": "1.0.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "optional": false,
            "field": "Content-Type",
            "defaultValue": "application/x-www-form-urlencoded",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "HexString",
            "optional": false,
            "field": "hash",
            "description": "<p>User hash received from debot</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "ok",
            "defaultValue": "true",
            "description": ""
          }
        ]
      }
    },
    "filename": "./doc.py",
    "groupTitle": "Provider"
  },
  {
    "type": "post",
    "url": "https://callback.arsen12.ru/events",
    "title": "Receive event from provider",
    "name": "Receiver",
    "group": "Receiver",
    "version": "1.0.0",
    "description": "<p>The method is used to receive notifications from the provider. Sign and public key can be used to verify the notification</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "defaultValue": "application/json",
            "description": ""
          },
          {
            "group": "Header",
            "type": "HexString",
            "optional": false,
            "field": "Pubkey",
            "description": "<p>Provider's public key</p>"
          },
          {
            "group": "Header",
            "type": "HexString",
            "optional": false,
            "field": "Sign",
            "description": "<p>Request body signature</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "type",
            "description": "<p>Event type. Can be &quot;NOTIFY&quot;, &quot;SUBSCRIBE&quot; or &quot;TEST&quot; (See receiver events)</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p>Event data</p>"
          }
        ]
      }
    },
    "filename": "./doc.py",
    "groupTitle": "Receiver"
  },
  {
    "type": "post",
    "url": "https://callback.arsen12.ru/events",
    "title": "SUBSCRIBE",
    "name": "Receiver",
    "group": "Receiver_Events",
    "version": "1.0.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "defaultValue": "application/json",
            "description": ""
          },
          {
            "group": "Header",
            "type": "HexString",
            "optional": false,
            "field": "Pubkey",
            "description": "<p>Provider's public key</p>"
          },
          {
            "group": "Header",
            "type": "HexString",
            "optional": false,
            "field": "Sign",
            "description": "<p>Request body signature</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p>Event data</p>"
          },
          {
            "group": "Parameter",
            "type": "HexString",
            "optional": false,
            "field": "data.encrypt",
            "description": "<p>Random value that the server should encrypt using a secret</p>"
          },
          {
            "group": "Parameter",
            "type": "HexString",
            "optional": false,
            "field": "data.from",
            "description": "<p>User hash</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "data.callback",
            "description": "<p>User callback url</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "data.provider",
            "description": "<p>Provider ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "type",
            "defaultValue": "SUBSCRIBE",
            "description": "<p>type</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "defaultValue": "true",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "HexString",
            "optional": false,
            "field": "encrypted",
            "description": "<p>Secret Encrypted Value</p>"
          }
        ]
      }
    },
    "filename": "./doc.py",
    "groupTitle": "Receiver_Events"
  },
  {
    "type": "post",
    "url": "https://callback.arsen12.ru/events",
    "title": "NOTIFY",
    "name": "Receiver",
    "group": "Receiver_Events",
    "version": "1.0.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "defaultValue": "application/json",
            "description": ""
          },
          {
            "group": "Header",
            "type": "HexString",
            "optional": false,
            "field": "Pubkey",
            "description": "<p>Provider's public key</p>"
          },
          {
            "group": "Header",
            "type": "HexString",
            "optional": false,
            "field": "Sign",
            "description": "<p>Request body signature</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p>Event data</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "data.data",
            "description": "<p>nonce + encodedMessage</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "data.attempt",
            "description": "<p>Number of unsuccessful sending attempts</p>"
          },
          {
            "group": "Parameter",
            "type": "HexString",
            "optional": false,
            "field": "data.from",
            "description": "<p>User hash</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "data.to",
            "description": "<p>User callback url</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "data.provider",
            "description": "<p>Provider ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "type",
            "defaultValue": "NOTIFY",
            "description": "<p>type</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "defaultValue": "true",
            "description": ""
          }
        ]
      }
    },
    "filename": "./doc.py",
    "groupTitle": "Receiver_Events"
  },
  {
    "type": "post",
    "url": "https://callback.arsen12.ru/events",
    "title": "TEST",
    "name": "Receiver",
    "group": "Receiver_Events",
    "version": "1.0.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "defaultValue": "application/json",
            "description": ""
          },
          {
            "group": "Header",
            "type": "HexString",
            "optional": false,
            "field": "Pubkey",
            "description": "<p>Provider's public key</p>"
          },
          {
            "group": "Header",
            "type": "HexString",
            "optional": false,
            "field": "Sign",
            "description": "<p>Request body signature</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p>Event data</p>"
          },
          {
            "group": "Parameter",
            "type": "HexString",
            "optional": false,
            "field": "data.encrypt",
            "description": "<p>Random value that the server should encrypt using a secret</p>"
          },
          {
            "group": "Parameter",
            "type": "HexString",
            "optional": false,
            "field": "data.from",
            "description": "<p>User hash</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "data.callback",
            "description": "<p>User callback url</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "data.provider",
            "description": "<p>Provider ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "type",
            "defaultValue": "TEST",
            "description": "<p>type</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "defaultValue": "true",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "HexString",
            "optional": false,
            "field": "encrypted",
            "description": "<p>Secret Encrypted Value</p>"
          }
        ]
      }
    },
    "filename": "./doc.py",
    "groupTitle": "Receiver_Events"
  }
] });
