# CAPSELOCKE

Tweeting the works of John Capse Locke 140 characters at time @CAPSELOCKE

## Usage

1. Chop up a body of text into tweets

Running the following will chop up a body of text into 140 character chunks. Paragraph breaks will end a tweet.
The tweets will be saved into a folder called `tweets` in the same directory as the script. A list of the tweets
will be written to a file called `tweets.txt` in the same directory.

    chopper.js /path/to/file.txt [TWEET_URL_PREFIX]
    
Where:

* `/path/to/file.txt` is the path to the file to chop up
* `TWEET_URL_PREFIX` is the prefix to put on the front of the link to the next tweet. For CAPSELOCKE, this is `https://raw.githubusercontent.com/CAPSELOCKE/CAPSELOCKE/master`

Each tweet will be saved as a JSON file containing the body of the tweet and a link to the next tweet:

    {
      "body": "THE EPISTLE to the READER.",
      "next": "/1.json"
    }
