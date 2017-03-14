# Doings

* set up Webtask to run from GitHub raw content URL
  * pushed `index.js` to GitHub
  * ran `wt create URL --name capselocke`
* gathered source text from simple HTML version of http://oll.libertyfund.org/titles/locke-the-works-vol-1-an-essay-concerning-human-understanding-part-1
  * cleaned up in the browser console:
    * removed `.type-marginalia`
    * removed `.type-footnote`
    * removed `span.pb`
    * removed `.figure`
    * took the `.innerText` of The Epistle To The Reader .type-section
    * worry about table later (nonillions etc.) - TODO
    * deal with line-breaks by not allowing singles (blockquotes etc.) - TODO
    * ensure that headings are read separately? - TODO
    * clean whitespace - `\r\t` - leaving `\n`
  * don't split words - (DONE in #2)
* wrote the `chopper.js` code
  * realise that my planned logic isn't quite right:
    * decide to write out the files at the end
    * outputting a list of tweets for inspection
    * handled running multiple times and clearing the tweets folder
* updated the README with chopper instructions
* wrote the tweeting code
  * opened the webtask in the online editor and set up the cron using that
  * webtask.io API uses callbacks not Promises, so chose a (mainly) callback structure
* wrote a script to seed the webtask storage with the first tweet
  * this wasn't planned out
  * uses Webtask API to edit the storage
* testing scripts
  * noted Webtask is not doing a great job keeping the code in the editor up-to-date with the Github content
  * seems to be working (although logging successful next tweet is not)
    * fixed after processing JSON properly
* next: tweet the tweet
  * Twitter is pretty long-winded to get API credentials, testing with private account first
  * using Webtask secrets to store Twitter credentials
  * and that works!
  * testing on a reduced schedule - every 5 minutes
* next: fix the word boundary stuff and use the whole body of text, then release on the @CAPSELOCKE account
  * csugden created a fork for this
  * some discussion about whether to keep line-breaks or not
  * fixing the ability to specify a source filename
* running over an extract from the main body of text, including a header and some section symbols, found some issues
  * headings and sections can both start in the middle of tweets
* found that Twitter will reject an update if it's the same as the previous one
* csugden added pull requests to:
  * finish all tweets at punctuation
  * make sure section and chapter headings start tweets
* copied in the rest of the text
  * mainly fine, need to deal with a few tweets that are coming out like '"', ';', ':'
* next: email error report
  * using SendGrid for this
* realised that some tweets started with "d " and were being interpreted as direct messages. Added fix to stop tweet at word boundaries to avoid splitting words
* had a problem where two tweets fifty lines apart both said "FOR EXAMPLE:" and Twitter rejected the second as a duplicate, even when I retried it seven hours later. I put a space at the end and it went through fine. Not ideal. Thinking about whether to search for these at the start or deal with them dynamically by retrying with a space on the end (which would be fine unless the tweet is already 140 characters, in which case you could delete the last character...)
