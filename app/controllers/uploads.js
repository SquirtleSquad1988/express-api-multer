'use strict';

const controller = require('lib/wiring/controller');
const models = require('app/models');
const Upload = models.upload;
const s3Upload =  require('lib/s3-upload');

const multer = require('multer');
const multerUploader = multer({ dest: '/tmp/' });

// const setUser = require('./concerns/set-current-user');
const setModel = require('./concerns/set-mongoose-model');

const index = (req, res, next) => {
  Upload.find()
    .then(uploads => res.json({
      uploads: uploads.map((e) =>
        e.toJSON({ virtuals: true, user: req.user })),
    }))
    .catch(next);
};

const show = (req, res) => {
  res.json({
    upload: req.upload.toJSON({ virtuals: true, user: req.user }),
  });
};

const create = (req, res, next) => {
  let file = {
    title: req.file.originalname,
    path: req.file.path
  };
  //s3 upload takes an object with the file.path and file.title defined
  s3Upload(file)
    .then((s3Response) => {
      // get the url!
      let url = s3Response.Location;
      return Upload.create({
        title: file.title,
        url: url
      });
    }).then((upload) => res.json({ upload }))
      .catch((error) => next(error));
};

const update = (req, res, next) => {
  delete req.body._owner;  // disallow owner reassignment.
  req.upload.update(req.body.upload)
    .then(() => res.sendStatus(204))
    .catch(next);
};

const destroy = (req, res, next) => {
  req.upload.remove()
    .then(() => res.sendStatus(204))
    .catch(next);
};

module.exports = controller({
  index,
  show,
  create,
  update,
  destroy,
}, { before: [
  // { method: setUser, only: ['index', 'show'] },
  { method: multerUploader.single('image[file]'), only: ['create'] },
  { method: setModel(Upload), only: ['show'] },
  { method: setModel(Upload, { forUser: true }), only: ['update', 'destroy'] },
], });
