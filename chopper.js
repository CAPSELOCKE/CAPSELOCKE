/*
  Chop up a body of text into tweets
  See README.md for usage information
*/

'use strict';

var fs = require('fs');
var path = require('path');

// get the 'next tweet' URL prefix from the arguments
var nextTweetPrefix = process.argv[2] || '';

// get the source text file
var txt = fs.readFileSync('./source.txt', 'utf-8');

// clean whitespace, leave line-breaks
txt = txt.replace(/\r|\t/g, '');

txt = txt.toUpperCase(); // because CAPSE LOCKE

var TWEETS_DIR_PATH = path.join(__dirname, 'tweets');
var tweets = [];

while (txt.length > 0) {
  // Prepare next tweet
  var tweet = txt.substr(0, 140);

  // Track back to end of last word
  if (tweet.lastIndexOf(" ") !== -1) {
    tweet = tweet.substr(0, tweet.lastIndexOf(" "));  
  }

  // Trim back to last sentence end
  if (tweet.lastIndexOf(".") !== -1) {
    tweet = tweet.substr(0, tweet.lastIndexOf(".") + 1);
  }

  // Trim back to last colon
  if (tweet.lastIndexOf(":") !== -1) {
    tweet = tweet.substr(0, tweet.lastIndexOf(":") + 1);
  }

  // Trim back to last semi-colon
  if (tweet.lastIndexOf(";") !== -1) {
    tweet = tweet.substr(0, tweet.lastIndexOf(";") + 1);
  }

  tweets.push(tweet);

  // Prepare remaining text
  txt = txt.substr(tweet.length).trim();
}

// create an empty folder for the tweets
// or empty the existing folder
if (fs.existsSync(TWEETS_DIR_PATH)) {
  fs.readdirSync(TWEETS_DIR_PATH).forEach(function(f) {
    if (f.match('.json')) {
      fs.unlinkSync(path.join(TWEETS_DIR_PATH, f));
    }
  });
} else {
  fs.mkdirSync(TWEETS_DIR_PATH);
}

// iterate through the tweets list, writing each tweet to file
// each file contains the tweet body and a link to the next tweet
tweets.forEach(function(t, j) {
  // create a URL pointing to the next tweet
  var next = nextTweetPrefix + '/' + (j + 1) + '.json';
  // write this tweet to file
  fs.writeFileSync(path.join(TWEETS_DIR_PATH, j + '.json'), JSON.stringify({
    body: t,
    next: next
  }, null, 2));
});

// save a list of the tweets for easy inspection
fs.writeFileSync(path.join(__dirname, 'tweets.txt'), tweets.join('\n'));

// log some feedback
console.log('DONE: written ' + tweets.length + ' tweets');
