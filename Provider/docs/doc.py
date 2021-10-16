"""
@api {get} /api/info Get provider info
@apiName Provider
@apiGroup Provider
@apiVersion 1.0.0
@apiSampleRequest off

@apiSuccess {String} id Provider ID
@apiSuccess {String} name Provider name
@apiSuccess {String} version Version
@apiSuccess {String} description Description
@apiSuccess {String} address support Address
@apiSuccess {String} icon provider Icon
@apiSuccess {String} public_key Public key for signing notifications
"""


"""
@api {post} /api/subscribe Subscribe to notifications from provider
@apiName Provider
@apiGroup Provider
@apiVersion 1.0.0
@apiHeader Content-Type=application/x-www-form-urlencoded
@apiDescription This method registers a new callback. Must be called twice. First time to get a secret, second to register a callback
@apiSampleRequest off

@apiParam {Base64String} data Encoded url for receiving notifications
@apiParam {HexString} hash User hash received from debot
@apiParam {String} [isDebot=true] Set to false if you need to receive responses in json format, if true the response will come in text format for display by debot

@apiSuccess {Boolean} confirmed true if the callback was registered successfully
@apiSuccess {String} [secret] Secret to confirm ownership of the server, returned once for each user hash
"""



"""
@api {post} /api/test Send a test message to user
@apiName Provider
@apiGroup Provider
@apiVersion 1.0.0
@apiHeader Content-Type=application/x-www-form-urlencoded
@apiSampleRequest off

@apiParam {HexString} hash User hash received from debot

@apiSuccess {Boolean} ok=true
"""









"""
@api {post} https://callback.arsen12.ru/events Receive event from provider
@apiName Receiver
@apiGroup Receiver
@apiVersion 1.0.0
@apiSampleRequest off
@apiDescription The method is used to receive notifications from the provider. Sign and public key can be used to verify the notification

@apiHeader {String} Content-Type=application/json
@apiHeader {HexString} Pubkey Provider's public key
@apiHeader {HexString} Sign Request body signature

@apiParam {String} type Event type. Can be "NOTIFY", "SUBSCRIBE" or "TEST" (See receiver events)
@apiParam {Object} data Event data
"""

"""
@api {post} https://callback.arsen12.ru/events SUBSCRIBE
@apiName Receiver
@apiGroup Receiver Events
@apiVersion 1.0.0
@apiSampleRequest off

@apiHeader {String} Content-Type=application/json
@apiHeader {HexString} Pubkey Provider's public key
@apiHeader {HexString} Sign Request body signature

@apiParam {Object} data Event data
@apiParam {HexString} data.encrypt Random value that the server should encrypt using a secret
@apiParam {HexString} data.from User hash
@apiParam {String} data.callback User callback url
@apiParam {String} data.provider Provider ID
@apiParam {String} type=SUBSCRIBE type

@apiSuccess {Boolean} success=true
@apiSuccess {HexString} encrypted Secret Encrypted Value
"""

"""
@api {post} https://callback.arsen12.ru/events NOTIFY
@apiName Receiver
@apiGroup Receiver Events
@apiVersion 1.0.0
@apiSampleRequest off

@apiHeader {String} Content-Type=application/json
@apiHeader {HexString} Pubkey Provider's public key
@apiHeader {HexString} Sign Request body signature

@apiParam {Object} data Event data
@apiParam {String} data.data nonce + encodedMessage
@apiParam {Number} data.attempt Number of unsuccessful sending attempts
@apiParam {HexString} data.from User hash
@apiParam {String} data.to User callback url
@apiParam {String} data.provider Provider ID
@apiParam {String} type=NOTIFY type

@apiSuccess {Boolean} success=true

"""

"""
@api {post} https://callback.arsen12.ru/events TEST
@apiName Receiver
@apiGroup Receiver Events
@apiVersion 1.0.0
@apiSampleRequest off

@apiHeader {String} Content-Type=application/json
@apiHeader {HexString} Pubkey Provider's public key
@apiHeader {HexString} Sign Request body signature

@apiParam {Object} data Event data
@apiParam {HexString} data.encrypt Random value that the server should encrypt using a secret
@apiParam {HexString} data.from User hash
@apiParam {String} data.callback User callback url
@apiParam {String} data.provider Provider ID
@apiParam {String} type=TEST type

@apiSuccess {Boolean} success=true
@apiSuccess {HexString} encrypted Secret Encrypted Value
"""