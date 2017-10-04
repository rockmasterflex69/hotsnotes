var url = 'https://heroespatchnotes.com/patch/summary.html';
//based on https://scotch.io/tutorials/scraping-the-web-with-node-js

var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
app.set('port', (process.env.PORT || 5000));

var Dict = require("collections/dict");
var cron = require('node-cron');

var dict = new Dict();
parseFeed();
//do it once to build dict.
 
cron.schedule('0 0 */1 * * *', function(){
  console.log('running a task every hour');
  parseFeed();
});


function parseFeed(){
	request(url, function(error, response, html){

        // First we'll check to make sure no errors occurred when making the request

        if(!error){
            // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality

            var $ = cheerio.load(html);

            // Finally, we'll define the variables we're going to capture
			//https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/flash-briefing-skill-api-feed-reference#json-text-multi-item-example
			
			//have to match the json format spec from amazon
            var uid, updateDate, titleText, mainText, redirectionURL;
            var json = { uid : "", updateDate : "", titleText : "", mainText : ""};
			
			
			$('.timeline').children('li').each(function(i,element){
				uid = $(this).attr('id');
				//console.log(uid);
				updateDate = uid.substr(5) + 'T03:03:03.0Z';
				
				titleText = uid.substr(0,5) + " on " + uid.substr(5);
				mainText = ($(this).text()).trim().replace(/[^a-zA-Z0-9,;():.\-/ ]/g, "").trim();//.replace(/\r?\n|\r/g," ");
				mainText = mainText.replace('\"','');
				mainText = mainText.replace('"','');
				mainText = mainText.replace(/  +/g, ' ');
				mainText = mainText.replace("E.T.C", 'ETC');
				mainText = mainText.replace("Heroes Affected", ". Heroes Affected: ");
				mainText = mainText.replace("Gameplay", ". Gameplay: ");
				mainText = mainText.replace("General", ". General: ");
				mainText = mainText.replace("Battleground", ". Battleground: ");
				mainText = mainText.replace("Play Mode", ". Play Mode: ");
				mainText = mainText.replace("UI/Hotkey", ". UI and Hotkey: ");
				mainText = mainText.replace("Reworks", ". Reworks: ");
				json.uid = uid;
				json.updateDate = updateDate;
				json.titleText = titleText;
				json.mainText = mainText;//.replace(/\s+/g, '');
				
				if (!dict.has(uid)){
					dict.add(JSON.parse(JSON.stringify(json)), uid);
					//console.log(json);
					//console.log(dict.toJSON());
				}
			});
			
        }
    })
}

app.get('/', function(req, res){
    // The URL we will scrape from - in our example Anchorman 2.
	//console.log(JSON.stringify('[' + dict.join(',') + ']'));
	//console.log(JSON.stringify(dict.toArray()));
	res.setHeader('Content-Type', 'application/json');
	res.json(dict.toArray());
    // The structure of our request call
    // The first parameter is our URL
    // The callback function takes 3 parameters, an error, response status code and the html

    
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

exports = module.exports = app;

