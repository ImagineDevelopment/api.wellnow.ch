'use strict';

const path = require('path');
const serveStatic = require('feathers').static;
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const feathers = require('feathers');
const configuration = require('feathers-configuration');
const hooks = require('feathers-hooks');
const rest = require('feathers-rest');
const bodyParser = require('body-parser');
const socketio = require('feathers-socketio');
const middleware = require('./middleware');
const services = require('./services');
const models = require('./models');

const app = feathers();

app.configure(configuration(path.join(__dirname, '..')));

function restFormatter(req, res) {
  res.format({
    'application/vnd.api+json': function() {
      res.send(res.data);
    }
  });
}

app.use(compress())
  .options({
      origin: function(origin, callback){
        const originIsWhitelisted = app.get('allowed_origins').indexOf(origin) !== -1;
        callback(null, originIsWhitelisted);
      },
      methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE']
    }, cors())
  .use(cors())
  .use(favicon( path.join(app.get('public'), 'favicon.ico') ))
  .use('/', serveStatic( app.get('public') ))
  .use(bodyParser.json({ type: 'application/vnd.api+json' }))
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(hooks())
  //.configure(rest())
  .configure(rest(restFormatter))
  .configure(socketio())
  .configure(models)
  .configure(services)
  .configure(middleware);

module.exports = app;
