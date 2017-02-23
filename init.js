/*
  Seed the Webtask.io storage with the first tweet
  See README.md for usage information
*/

var fs = require('fs');
var path = require('path');
var request = require('request-promise');

var tweetPath = process.argv[2] || path.join(__dirname, 'tweets', '0.json');

var WEBTASK_API_TOKEN = process.env.WEBTASK_API_TOKEN;
var WEBTASK_USERNAME = process.env.WEBTASK_USERNAME;
var WEBTASK_NAME = process.env.WEBTASK_NAME;
var urlStem = 'https://webtask.it.auth0.com/api/webtask/' + WEBTASK_USERNAME +
  '/' + WEBTASK_NAME + '/data';
var url = urlStem + '?key=' + WEBTASK_API_TOKEN;

// get the first tweet
var tweet = fs.readFileSync(tweetPath, 'utf-8');

// seed the storage
request.put({
  url: url,
  json: true,
  body: {
    data: tweet
  }
})
.then(function() {
  console.log('DONE - first tweet is: ' + JSON.stringify(tweet, null, 2));
})
.catch(function(err) {
  console.log('ERROR seeding storage', err);
});

// HTTPS PUT /api/webtask/wt-jonathan-pensionbee-com-0/{webtask_name}/data
// Content-Type: application/json
