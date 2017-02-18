/*
  Chop up a body of text into tweets
  See README.md for usage information
*/

'use strict';

var fs = require('fs');
var path = require('path');

// get the source file from the arguments
var sourceFilePath = process.argv[2];
console.log('Source file path:', sourceFilePath);

// get the 'next tweet' URL prefix from the arguments
var nextTweetPrefix = process.argv[3] || '';
console.log('Next tweet prefix:', nextTweetPrefix);

// get the source text file
try {
  var txt;
  var pathInfo = fs.statSync(sourceFilePath);
  if (pathInfo.isDirectory()) {
    var files = [];
    fs.readdirSync(sourceFilePath).forEach(function(filename) {
      console.log('Reading from:', filename);
      var contents = fs.readFileSync(path.join(sourceFilePath, filename), 'utf-8');
      files.push(contents);
    });
    txt = files.join('\n');
  } else {
    txt = fs.readFileSync(sourceFilePath, 'utf-8');
  }
} catch (ex) {
  console.log('error reading source file', ex);
  return 1;
}

// clean whitespace, leave line-breaks
txt = txt.replace(/\r|\t/g, '');

txt = txt.replace(/\n/g,' '); // remove blank lines

txt = txt.toUpperCase(); // because CAPSE LOCKE

var TWEETS_DIR_PATH = path.join(__dirname, 'tweets');
var tweets = [];
var tweet;

var chapterPattern = 'CHAP\. [IVXLCDM]+\.:';  // e.g. "CHAP. IV.:"
var chapterRegExp = new RegExp(chapterPattern);
var chapterAtEndRegExp = new RegExp(chapterPattern + '$');

var sectionPattern = '§ ([0-9]+)\.'; //e.g. "§ 25."
var sectionRegExp = new RegExp(sectionPattern);
var sectionAtEndRegExp = new RegExp(sectionPattern + '$');

while (txt.length > 0) {
  // Prepare next tweet
  tweet = txt.substr(0, 140);

  // Remove whitespace from end
  tweet = tweet.trim();

  // End tweet before any new section
  if (tweet.search(sectionRegExp) > 0) {
    tweet = tweet.substr(0, tweet.search(sectionRegExp));
  }

  // End tweet before any new chapter
  if (tweet.search(chapterRegExp) > 0) {
    tweet = tweet.substr(0, tweet.search(chapterRegExp));
  }

  // Trim back to last sentence end
  var indexOfLastFullstop = tweet.lastIndexOf('.');
  if (indexOfLastFullstop !== -1) {
    var proposedNewTweet = tweet.substr(0, indexOfLastFullstop + 1);

    // Only trim back if it doesn't mean ending with a section heading
    if (proposedNewTweet.search(sectionAtEndRegExp) === -1) {
      tweet = proposedNewTweet;
    }
  }

  // Trim back to last colon
  if (tweet.lastIndexOf(':') !== -1) {
    var proposedNewTweet = tweet.substr(0, tweet.lastIndexOf(':') + 1);

    // Only trim back if it doesn't mean ending with a chapter heading
    if (proposedNewTweet.search(chapterAtEndRegExp) === -1) {
      tweet = proposedNewTweet;
    }
  }

  // Trim back to last semi-colon
  if (tweet.lastIndexOf(';') !== -1) {
    tweet = tweet.substr(0, tweet.lastIndexOf(';') + 1);
  }

  // Trim back to last comma if tweet does not end in full-stop, colon or semi-colon.
  if (['.',':',';'].indexOf(tweet.slice(-1)) === -1 && tweet.lastIndexOf(',') !== -1) {
    tweet = tweet.substr(0, tweet.lastIndexOf(',') + 1);
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
