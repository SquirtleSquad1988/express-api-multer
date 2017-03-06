'use strict';

require('dotenv').load();

const mime = require('mime');
const path = require('path');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const fs = require('fs');
const crypto = require('crypto');

const s3Upload = (options) => {
  let mimeType = mime.lookup(options.path);
  let ext = path.extname(options.path);
  let folder = (new Date()).toISOString().split('T')[0];
  let stream = fs.createReadStream(options.path);

  // certain things are grabbed out of file, determine what were going to name it
  // promisifying crypto.randomBytes
  return new Promise((resolve, reject) => {
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

    // create a new promise so we can return a promise and do more work down the promise chain
    // by default s3 does not return a promise
    return new Promise((resolve, reject) => {
      s3.upload(params, function (error, data) {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  });
};

module.exports = s3Upload;
