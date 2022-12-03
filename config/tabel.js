"use strict";
var connection = require('../conn/conn');
var err=''

function queryDB(query, queryvalue) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            connection.query(query, queryvalue, function (error, rows, fields) {
                if (error) {
                    err = "Error mysql -> " + error + " <- " + this.sql
                    reject(err)
                } else {
                    resolve({
                        rows,
                        fields
                    })
                }
            })
        }, 0);
    })
}


function dumpError(err) {
    if (typeof err === 'object') {
        if (err.message) {
            console.log('\nMessage: ' + err.message)
        }
        if (err.stack) {
            console.log('\nStacktrace:')
            console.log('====================')
            console.log(err.stack);
        }
    } else {
        console.log('dumpError :: argument is not an object');
    }
}

module.exports = {
    queryDB : queryDB,
    dumpError : dumpError
};