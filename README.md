node-cloudfeeds
===============

A simple library to stream a Cloud Feed.

Example:
```javascript
var CloudFeeds = require('./index.js').CloudFeeds;
var through = require('through');

var cf = new CloudFeeds(
  'https://ord.feeds.api.rackspacecloud.com/usagesummary/ssl/events/8492382', // The URL of the feed to stream
  {
    headers: {
      'X-Auth-Token': 'Not Really An Auth Token' // Rackspace auth token
    },
    limit: 1000 //Number of articles to pull at once
  });

cf.pipe(through(function(data) {
  var content;

  if (data['atom:content']['#']) {
    content = JSON.stringify(JSON.parse(data['atom:content']['#']), null, 4);
  }
}));
```
