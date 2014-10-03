var util = require('util');
var Transform = require('stream').Transform;

var request = require('request');
var FeedParser = require('feedparser');


/**
 * @param {String} feed The URL of the feed to follow
 * Follows a specific Cloud Feed. Use filters to filter by category.
 *
 * Creates an object stream that returns articles as Javascript objects
 * as they are parsed from the cloud feed. This attempts to stream a live
 * Cloud Feed.
 */
var CloudFeeds = function(feed, options) {
  Transform.call(this, {objectMode: true});

  this.feed = feed;
  this.filterString = '';
  this.direction = 'backward';
  this.marker = '';
  this.options = options;
  this.position = {};

  this._run();
}
util.inherits(CloudFeeds, Transform);


CloudFeeds.prototype._run = function(nextPage) {
  var self = this,
      options = {},
      feedParser = new FeedParser(),
      nextPage,
      req;

  options = {
    uri: nextPage || this.feed,
    headers: this.options.headers,
    qs: {
      direction: this.direction,
      search: this.filterString,
      marker: this.marker,
      limit: this.options.limit
    }
  };

  req = request(options);

  feedParser.once('finish', function() {
    feedParser.unpipe(self);
  });

  feedParser.once('end', function() {
    self._run(nextPage);
  });

  req.on('response', function(res) {
    nextPage = res.headers.link.split(';')[0].slice(1, -1);
  });

  req.pipe(feedParser).pipe(this);
};


CloudFeeds.prototype._transform = function(obj, enc, callback) {
  if (!obj) {
    callback();
    return;
  }
  this.push(obj);
  callback();
};

exports.CloudFeeds = CloudFeeds;
