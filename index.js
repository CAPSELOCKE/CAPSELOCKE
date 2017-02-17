/*
  Send the next tweet in a queue and queue up the following one
  See README.md for usage information
*/

'use strict';

var request = require('request-promise');
var Twit = require('twit');

// tweet the queued tweet and then queue up the next one
module.exports = function(ctx, cb) {

  // response handler
  function callback(err, nextTweet) {
    // return success or failure
    if (err) {
      return cb(err);
    } else {
      if (nextTweet) {
        return cb(null, 'DONE - next tweet: ' + JSON.stringify(nextTweet));
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
    console.log('Tweet retrieved from storage', tweet);
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
          console.log('Tweet marked as tweeted in storage', tweet);
          return queueUpNextTweet(tweet);
        });
      })
      .catch(function(err) {
        // if tweet fails, error out
        return callback(err);
      });
    }
  });

  // tweet the tweet
  function tweetIt(tweet) {
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    var client = new Twit({
      consumer_key: ctx.secrets.TWITTER_CONSUMER_KEY,
      consumer_secret: ctx.secrets.TWITTER_CONSUMER_SECRET,
      access_token: ctx.secrets.TWITTER_ACCESS_TOKEN_KEY,
      access_token_secret: ctx.secrets.TWITTER_ACCESS_TOKEN_SECRET
    });
    return new Promise(function(resolve, reject) {
      client.post('statuses/update', {status: tweet.body}, function(error, tweet, response) {
        if (error) {
          return reject(error);
        } else {
          return resolve(tweet);
        }
      });
    });
  }

  function queueUpNextTweet(tweet) {
    // get the next tweet by its URL
    var nextTweetURL = tweet.next;
    return request({
      url: nextTweetURL,
      json: true
    })
    .then(function(nextTweet) {
      ctx.storage.set(nextTweet, function() {
        console.log('Tweet queued up in storage', nextTweet);
        return callback(null, nextTweet);
      });
    })
    .catch(function(err) {
      // if request fails, error out
      console.log('Error queueing next tweet', nextTweetURL);
      return callback(err);
    });
  }

};
