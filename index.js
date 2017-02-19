/*
  Send the next tweet in a queue and queue up the following one
  See README.md for usage information
*/

'use strict';

var request = require('request-promise');
var sendGrid = require('sendgrid@4.7.0');
var Twit = require('twit');

// tweet the queued tweet and then queue up the next one
module.exports = function(ctx, cb) {
  // send an email error report
  var errorReport = function(err) {
    console.log(err);
    // wrap this in a Promise so it can always return a resolved Promise that
    // carries the error argument, even if there is an error here
    return new Promise(function(resolve, reject) {
      // if the correct environment variables have not been set up, log and exit
      if (!ctx.secrets.SENDGRID_API_KEY || !ctx.secrets.ERROR_NOTIFICATIONS_TO ||
        !ctx.secrets.ERROR_NOTIFICATIONS_FROM) {
        console.log('no error report sent, missing environment variables - ' +
        'check SENDGRID_API_KEY, ERROR_NOTIFICATIONS_TO and ERROR_NOTIFICATIONS_FROM');
        return Promise.resolve(err);
      }
      // split up the comma-separated list of to-emails
      var toEmails = ctx.secrets.ERROR_NOTIFICATIONS_TO.split(',');
      // send email through SendGrid
      var helper = sendGrid.mail;
      var fromEmail = new helper.Email(ctx.secrets.ERROR_NOTIFICATIONS_FROM);
      var toEmail = new helper.Email(toEmails[0]);
      var subject = 'Error report from CAPSELOCKE';
      var body = 'Oops! CAPSELOCKE had a problem:\n\n' + err;
      var content = new helper.Content('text/plain', body);
      var mail = new helper.Mail(fromEmail, subject, toEmail, content);
      if (toEmails.length > 1) {
        toEmails.slice(1).forEach(function(email) {
          mail.personalizations[0].addTo(new helper.Email(email));
        });
      }
      var sg = sendGrid(ctx.secrets.SENDGRID_API_KEY);
      var request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail.toJSON(),
      });
      sg.API(request)
      .then(function(response) {
        console.log('email sent');
        console.log(response.statusCode);
        console.log(response.body);
        console.log(response.headers);
        return resolve(err);
      })
      .catch(function(emailError) {
        console.log('error sending email notification',
          JSON.stringify(emailError, null, 2));
        return resolve(err);
      });
    });
  };

  // response handler
  function callback(err, nextTweet) {
    // return success or failure
    if (err) {
      return errorReport(err)
      .then(cb);
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
      var errMessage = 'Error queueing next tweet: ' + nextTweetURL + ', ' +
        err.message;
      console.log(errMessage);
      return callback(new Error(errMessage));
    });
  }

};
