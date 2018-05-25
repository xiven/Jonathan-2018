const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const NodeCache = require( "node-cache" );
const keyStore = new NodeCache( { stdTTL: 100, checkperiod: 120 } );

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');
const util = require('../util/helper');
const User = require('../user/User');

//parse body of json api requests
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

//api routes
router.post('/register', (req, res) => {

    //check to see if the user already exists
    User.find({email: req.body.email}, (err, results) => {
      if (!results[0]) {
        //user does not exist, proceed with registration
        var hashedPassword = bcrypt.hashSync(req.body.password, 8);
        User.create({
          name : req.body.name,
          email : req.body.email,
          password : hashedPassword
        },
        (err, user) => {
          //console.log('user: ' + user);
          if (err) return res.status(500).send("There was a problem registering the user.")
          // create a token
          var token = jwt.sign({ id: user._id }, config.secret, {
            expiresIn: 86400 // expires in 24 hours
          });
          //generate keypair and save to keystore
          var keyPair = util.generateKeys(user);
          var success = keyStore.set( user._id + " keys", keyPair, 10000 );
          
          res.status(200).send({ auth: true, keysGenerated: success, token: token });
        }); 
      } else {
        return res.status(500).send("There was a problem registering the user. User already exists!")
      }
    });
});

router.post('/login', function(req, res) {
  //login to retreive token if forgotten or expired
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) return res.status(500).send('Error on the server.');
    if (!user) return res.status(404).send('No user found.');
    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
    var token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 86400 // expires in 24 hours
    });
    res.status(200).send({ auth: true, token: token });
  });
});

module.exports = router;