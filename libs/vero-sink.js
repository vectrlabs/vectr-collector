var Vero = require('vero').EventLogger;
var authToken = process.env['VERO_TOKEN'];
var devMode = false; // false in PRODN
var logger = new Vero(authToken, devMode);

exports.log = function veroLog(event) {
  const data = event.data;
  let e;
  // Only send strcture events.
  if ( data.e === 'se' && data.uid) {
    e = toVeroEvent(data);
  }
  else if ( data.e === 'pv') {
    e = toVeroViewedPageEvent(data);
  }
  sendToVero(e);
}

function toVeroEvent(data) {
  var eventName = data.se_ca;
  var prop = data.co.data;
  return {
    id: data.uid,
    name: data.se_ca,
    data: data.co.data[0]
  };
}

function toVeroViewedPageEvent(data) {
  return {
    id: data.uid || data.duid,
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
