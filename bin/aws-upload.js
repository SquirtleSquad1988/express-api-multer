'use strict';

require('dotenv').load();

const mime = require('mime');
const path = require('path');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const fs = require('fs');
const crypto = require('crypto');

let file = {
  path: process.argv[2],
  title: process.argv[3]
};

let mimeType = mime.lookup(file.path);
let ext = path.extname(file.path);
let folder = (new Date()).toISOString().split('T')[0];
let stream = fs.createReadStream(file.path);

// certain things are grabbed out of file, determine what were going to name it
// promisifying crypto.randomBytes
new Promise((resolve, reject) => {
  // makes unique filename
  crypto.randomBytes(16, (error, buffer) => {
    if (error) {
      // if cryptobytes fails we want to reject promise and log error
      reject(error);
    } else {
      // making a useable filename prefix
      resolve(buffer.toString('hex'));
    }
  });
}) // returns a promise where the value is filename
// filename gets dumped into promist chain
// shit is getting built up
.then((filename) => {
  let params = {
    ACL: 'public-read',
    ContentType: mimeType,
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${folder}/${filename}${ext}`,
    Body: stream
  };

  // create a new promise down here so we can return a promise and do more work down the promise chain
  // by default s3 does not return a promise
  return new Promise((resolve, reject) => {
    s3.upload(params, function (error, data) {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        console.log(data);
        resolve(data);
      }
    });
  });
})
// if successful a promise is returned with the s3 upload data
.then(console.log)
.catch(console.error);
