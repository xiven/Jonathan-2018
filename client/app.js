const _ = require('lodash');
const yargs = require('yargs');
const request = require('./api/request');

//set required fields for arguments

const nameOptions = {
    describe: 'Name',
    demand: true,
    alias: 'n'
};

const emailOptions = {
    describe: 'Email',
    demand: true,
    alias: 'e'
};

const passwordOptions = {
    describe: 'Password',
    demand: true,
    alias: 'p'
};

const messageOptions = {
    describe: 'Message',
    demand: true,
    alias: 'm'
};

const signedByEmailOptions = {
    describe: 'Signed By Email',
    demand: true,
    alias: 's'
};

const tokenOptions = {
    describe: 'Token',
    demand: true,
    alias: 't'
};

//setup all arguments that will be used when calling the app

const argv = yargs
  .command('register', 'Register a new user', {
      name: nameOptions,
      email: emailOptions,
      password: passwordOptions
  })
  .command('login', 'Login a registered user', {
    email: emailOptions,
    password: passwordOptions
  })
  .command('message', 'Send a message', {
    message: messageOptions,
    signedByEmail: signedByEmailOptions,
    token: tokenOptions
  })
  .command('verify', 'Verify a message', {
    message: messageOptions,
    signedByEmail: signedByEmailOptions,
    token: tokenOptions
  })
  .help()
  .argv;
var command = argv._[0];

//route the arg command to the appropriate function

if (command === 'register') {
    request.registerUser(argv.name, argv.email, argv.password, (err, user) => {
        if (err) {
            return console.log(err);
        }
        return console.log(`User Registered! Result: ${JSON.stringify(user)}`);
    });    
} else if (command === 'login') {
    request.login(argv.email, argv.password, (err, user) => {
        if (err) {
            return console.log(err);
        }
        return console.log(`Login Result: ${JSON.stringify(user)}`);
    })
} else if (command === 'message') {
    request.message(argv.message, argv.signedByEmail, argv.token, (err, result) => {
        if (err) {
            return console.log(err);
        }
        return console.log(`Send Message Result: ${JSON.stringify(result)}`);
    })
} else if (command === 'verify') {
    request.verify(argv.message, argv.signedByEmail, argv.token, (err, result) => {
        if (err) {
            return console.log(err);
        }
        return console.log(`Verify Message Result: ${JSON.stringify(result)}`);
    })
} else {
    console.log('Command not recognized');
}
