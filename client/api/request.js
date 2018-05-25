var request = require('request');
var config = require('../config');

//setup request data for endpoints that will be used

var registerUser = (name, email, password, callback) => {
    var formData = {
        'name': name, 
        'email': email, 
        'password': password
    }
    
    makeRequest(formData, "/auth/register", "", (result) => {
        callback(null, result);
    });
}

var login = (email, password, callback) => {
    var formData = { 
        'email': email, 
        'password': password
    }

    makeRequest(formData, "/auth/login", "", (result) => {
        
        callback(null, result);
    });
}

var message = (message, signedByEmail, token, callback) => {
    console.log('Token: ' + token);
    var formData = {
        'message': message,
        'signedByEmail': signedByEmail
    }
    
    makeRequest(formData, "/msg/addMessage", token, (result) => {
        callback(null, result);
    });
}

var verify = (message, signedByEmail, token, callback) => {

    var formData = {
        'message': message,
        'signedByEmail': signedByEmail
    }
    
    makeRequest(formData, "/msg/verify", token, (result) => {
        callback(null, result);
    });
}

var makeRequest = (formData, path, token, callback) => {

    var tokenHeader = {'Content-Type': 'application/x-www-form-urlencoded', 'x-access-token': token};
    var nonTokenHeader = {'Content-Type': 'application/x-www-form-urlencoded'};
    
    //we only need token header for message and verify endpoints
    var headerOptions = (path === '/msg/addMessage') || (path === '/msg/verify') ? tokenHeader : nonTokenHeader;

    var options = {
        url: config.url + path,
        headers: headerOptions,
        method: 'POST',
        form: formData
    };

    getResult = (error, response, body) => {
        var res = JSON.stringify(response);
        if (res.statusCode == 200) {
          var info = JSON.parse(response.body);
          //return info;
          callback(null, response.body);
        } else {
            callback({statusCode: response.statusCode, body: response.body});
        }
    }

    //make request to api and get results
    request(options, getResult);
};

module.exports = {
    registerUser,
    login,
    message,
    verify
};