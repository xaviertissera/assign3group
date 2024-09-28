var dbDetails = require("./db-details");

//const mysql = require('mysql2');

var mysql = require('mysql2');
var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');

// connection to the database
module.exports = {
    getconnection :() => {
        return mysql.createConnection({
          host: dbDetails.host,   
          user: dbDetails.user,         
          password: dbDetails.password, 
          database: dbDetails.database
        })
          
    }
}

