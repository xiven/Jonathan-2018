# Message Encryption

This project demonstrates message encryption using a public key.  Users can register, send messages, and verify that a message is signed.

## Getting Started

Clone the project down to your local machine.
```
git clone http://github.com/xiven/Jonathan-2018/
```

### Prerequisites

Go into each project folder (client, server) and install the packages.

```
npm install
```

Afterwards, go into the server project folder and set an environment variable and call it SECRET_KEY.  Set the value to whatever you would like.

```
SET SECRET_KEY=SETVALUEHERE
```

Start the server

```
node server
```

Once the server has started you are ready to use the client.

### Using the client

Go into the client project folder and issue this command to register a new user.
```
node app register -n yourname -e youremail -p yourpassword
```

The client main page is 'app'.  The arguments passed in to the client main page are as follows:
* register | command telling the app what to do
* -n       | argument for sending your name
* -e       | argument for sending your email
* -p       | argument for sending your password

Note: all arguments are required to process all commands

Once the user is registered, the client will get back a response from the server that it has been authenticated and provide you with a token.  The token will be used for sending and verifying messages.

Your token will expire in 24 hrs.  If it expires or you forget what your token is, you can send the login command to the client to retreive the token.
```
node app login -e youremail -p yourpassword
```

Next step is sending a message.  A message needs to be signed by an authenticated user with their private key that was generated when they registered. 
Issue this command:
```
node app message -m "your message goes here" -s "signerEmail@example.com" -t "tokenGoesHere"
```
* -m   | add your message to this tag
* -s   | add the user that is signing this message
* -t   | add your token for authentication

Lastly you can verify a message.  
```
node app verify -m "your message to verify goes here" -s "signerEmail@example.com" -t "tokenGoesHere"
```
