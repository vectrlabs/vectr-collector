var Vero = require('vero').EventLogger;
var authToken = process.env['VERO_TOKEN'];
var devMode = false; // false in PRODN
var logger = new Vero(authToken, devMode);
var _ = require('lodash');

exports.log = function veroLog(event) {
  const data = event.data;
  var e;
  // Only send strcture events.
  if ( data.e === 'se' ) {
    e = toVeroEvent(data);
    sendToVero(e);
  }
  else if ( data.e === 'pv') {
    e = toVeroViewedPageEvent(data);
    sendToVero(e);
  }
}

function toVeroEvent(data) {
  var eventName = data.se_ca || 'unknown';
  var prop = _.get(data,'co.data', []);
  var id = eventName.indexOf('Register') == 0
      ? prop[0].userId
      : data.uid;
  return {
    id: id,
    name: eventName,
    data: prop[0]
  };
}

function toVeroViewedPageEvent(data) {
  return {
    id: data.uid || data.duid || 'unknown',
    name: 'viewed_page',
    data: {
      url: data.url
    }
  };
}

function sendToVero(e) {
  function done(err, res, body) {
    if (err) return console.error(err);
    if (body.status === 200) {
      return console.log('send 1 event to Vero');
    }
    else {
      return console.error(body);
    }
  }
  logger.addEvent(e.id, e.name, e.data, done);
}
