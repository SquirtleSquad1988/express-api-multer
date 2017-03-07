'use strict';

require('dotenv').load();
const s3Upload =  require('../lib/s3-upload');
const Upload = require('../app/models/upload');
const mongoose = require('../app/middleware/mongoose');

// Upload.create(title, url);

let file = {
  path: process.argv[2],
  title: process.argv[3]
};

s3Upload(file)
  .then((s3Response) => {
    // get the url!
    let url = s3Response.Location;
    return Upload.create({
      title: file.title,
      url: url
    });
  })
  // then has the s3 response, and the info included can be used to set parameters
  .then(console.log)
  .catch(console.error)
  .then(() => mongoose.connection.close());
