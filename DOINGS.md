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
  * don't split words - TODO
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
