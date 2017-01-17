/*
  Send the next tweet in a queue and queue up the following one
  See README.md for usage information
*/

'use strict';

var request = require('request-promise');

// tweet the queued tweet and then queue up the next one
module.exports = function(ctx, cb) {

  // response handler
  function callback(err, nextTweet) {
    // return success or failure
    if (err) {
      return cb(err);
    } else {
      if (nextTweet) {
        return cb(null, 'DONE - next tweet: ' + nextTweet.body);
      } else {
        return cb(null, 'DONE - no next tweet');
      }
    }
  }

  // get next tweet from storage
  ctx.storage.get(function(error, tweet) {
    // if there is no tweet queued, error out
    if (!tweet) {
      return callback(new Error('no tweet queued up'));
    }
    // check if this tweet has already been tweeted
    if (tweet.tweeted) {
      // if it's already been tweeted, move on
      return queueUpNextTweet(tweet);
    } else {
      // if not tweeted, tweet it
      return tweetIt(tweet)
      .then(function() {
        // save tweeted status to storage
        tweet.tweeted = true;
        ctx.storage.set(tweet, function() {
          return queueUpNextTweet(tweet);
        });
      })
      .catch(function(err) {
        // if tweet fails, error out
        return callback(err);
      });
    }
  });

  function tweetIt(tweet) {
    return Promise.resolve();
  }

  function queueUpNextTweet(tweet) {
    // get the next tweet by its URL
    var nextTweetURL = tweet.next;
    return request(nextTweetURL)
    .then(function(nextTweet) {
      ctx.storage.set(nextTweet, function() {
        return callback(null, nextTweet);
      });
    })
    .catch(function(err) {
      // if request fails, error out
      return callback(err);
    });
  }

};
