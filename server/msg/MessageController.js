const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const crypto = require('crypto');
const secp256k1 = require('secp256k1');
const NodeCache = require( "node-cache" );
const keyStore = new NodeCache( { stdTTL: 100, checkperiod: 120 } );

const VerifyToken = require('./VerifyToken');
const util = require('../util/helper');
const User = require('../user/User');

//parse body of json api requests
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

//api routes

//add new message
router.post('/addMessage', VerifyToken, (req, res) => {
    let msg = req.body.message;
    let signedBy = req.body.signedByEmail;
  
    //hash the message
    let digested = util.digest(msg);
    
    User.findOne({ email: signedBy }, (err, user) => {
      if (err) return res.status(500).send('Error on the server.');
      if (!user) return res.status(404).send('No user found.');
      
      //get user's keypair
      keyStore.get( user._id + " keys", ( err, value ) => {
        if (!err) {
          var usrKeyStore;
          if (value == undefined){
            // keys not found maybe due to server restart
            // generate new keys
            var keyPair = util.generateKeys(user);
            keyStore.set( user._id + " keys", keyPair, 10000 );
            usrKeyStore = keyPair;
          } else {
            usrKeyStore = value;
          }
  
          //Sign the message
          let sigObj = secp256k1.sign(digested, usrKeyStore.pvtKey);
          let sig = sigObj.signature;
  
          keyStore.get( user._id + " messages", ( msgErr, msgValue ) => {
            if (!err) {
              if (msgValue == undefined) {
                // key not found, add a new keypair
                var msgKeyPair = {};
                msgKeyPair.messages = [];
                msgKeyPair.messages.push({message: digested, signature: sig});
                //save message digest and sig to keystore
                keyStore.set( user._id + " messages", msgKeyPair, 10000 );
                
                res.status(200).send({ status: "200", message: "Message signed." });
              } else {
                //add to existing message list for user
                msgValue.messages.push({message: digested, signature: sig});
                keyStore.set( user._id + " messages", msgValue, 10000 );
                
                res.status(200).send({ status: "200", message: "Message signed." });
              }
            }
          });
        }
      });
    });
});
  
//verify if message is signed
router.post('/verify', VerifyToken, (req, res) => {
    let msg = req.body.message;
    let signedBy = req.body.signedByEmail;

    //find the user that may have signed the message
    User.findOne({ email: signedBy }, (err, user) => {
        if (err) return res.status(500).send('Error on the server.');
        if (!user) return res.status(404).send('No signed by user found.');
        
        //get the key data for the signer
        keyStore.get( user._id + " keys", ( err, value ) => {
            if (!err) {
                if (value == undefined){
                    // key not found
                    res.status(404).send("Unable to get key info.  Data not found.");
                } else {
                    // get the sig from the keystore
                    keyStore.get( user._id + " messages", ( msgErr, msgValue ) => {
                        if (!err) {
                            if (msgValue == undefined) {
                                // key not found
                                res.status(404).send("Unable to get signature info.  Data not found.");
                            } else {
                                // hash the message for verification
                                let digested = util.digest(msg);
                                let verifiedStatus;
                                //iterate through keystore messages to find match
                                for (var i = 0; i < msgValue.messages.length; i++) {
                                    if (JSON.stringify(msgValue.messages[i].message) === JSON.stringify(digested)) {
                                        //get user's pub key, signature to verify message
                                        let verified = secp256k1.verify(digested, msgValue.messages[i].signature, value.pubKey);
                                        console.log("	Verified:", verified);
                                        verifiedStatus = verified;
                                        res.status(200).send({ status: "200", messageVerified: true });
                                        break;
                                    }
                                }
                                if (!verifiedStatus) {
                                    res.status(404).send("Unable to verify message.");
                                }
                                
                            }
                        }
                    });
                }
            }
        });
    });
});

module.exports = router;