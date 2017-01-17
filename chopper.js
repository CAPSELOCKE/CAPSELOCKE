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

var TWEETS_DIR_PATH = path.join(__dirname, 'tweets');
var tweets = [];
var tweet = [];
var count = 0;
var i;
var c;

// iterate through the text
for (i = 0; i < txt.length; i++) {
  // get the next character
  c = txt[i];
  // terminate the tweet at a line-break
  if (c === '\n') {
    finaliseTweet();
  } else {
    // add the character to the tweet
    tweet.push(c);
    // terminate the tweet when it's 140 characters long
    if (count >= 140) {
      finaliseTweet();
    }
  }
  // increment the tweet-length counter
  count++;
}

function finaliseTweet() {
  var candidateTweet = tweet.join('');
  // ignore blank tweets
  if (candidateTweet.replace(/\w/g, '') !== '') {
    // add the tweet to the collection of tweets
    // store a link to the next tweet
    tweets.push(candidateTweet);
  }
  // start a new tweet
  tweet = [];
  // reset the tweet-length counter
  count = 0;
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
