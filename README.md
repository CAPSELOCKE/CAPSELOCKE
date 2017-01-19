# CAPSELOCKE

Tweeting the works of John Capse Locke 140 characters at time @CAPSELOCKE

## Usage

1. `chopper.js` - chop up a body of text into tweets

Running the following will chop up a body of text into 140 character chunks. Paragraph breaks will end a tweet.
The tweets will be saved into a folder called `tweets` in the same directory as the script. A list of the tweets
will be written to a file called `tweets.txt` in the same directory.

    node chopper.js /path/to/file.txt [TWEET_URL_PREFIX]
    
Where:

* `/path/to/file.txt` is the path to the file to chop up
* `TWEET_URL_PREFIX` is the prefix to put on the front of the link to the next tweet. For CAPSELOCKE, this is `https://raw.githubusercontent.com/CAPSELOCKE/CAPSELOCKE/master/tweets`

Each tweet will be saved as a JSON file containing the body of the tweet and a link to the next tweet:

    {
      "body": "THE EPISTLE to the READER.",
      "next": "/1.json"
    }

2. `init.js` - seed the Webtask storage with the first tweet

The script expects a seed tweet at `./tweets/0.json`.

The script requires some environment variables to be set:

* `WEBTASK_API_TOKEN` - valid Webtask authentication
* `WEBTASK_USERNAME` - the slug of your Webtask account e.g. `wt-your-email-0`
* `WEBTASK_NAME` - the name of the webtask you are setting storage for

Run using:

  node init.js

3. `index.js` - tweet from a queue and line up the next tweet

This script is designed to be run on webtask.io as it uses local storage on that platform.

To send out the tweets, you need to set up secret credentials on Webtask, as follows:

* `TWITTER_CONSUMER_KEY` - API key
* `TWITTER_CONSUMER_SECRET` - API secret
* `TWITTER_ACCESS_TOKEN_KEY` - Access token
* `TWITTER_ACCESS_TOKEN_SECRET` - Access token secret
