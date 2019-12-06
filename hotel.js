
var fs = require('fs');
var request = require('request');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var https = require('https');
var http = require('http');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonencodedParser = bodyParser.json({ extended: false });

http.createServer(app).listen(80);
console.log('server listening on port 80');
app.use(function(req, res, next) {

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
}); //for enabling CORS requests

/*
First sending a json with owner and repo which is concatenated and sent in a call to the /hotel POST
reqPullRequest runs and sends a call to the github api for the pull request and then stores the login, 
commits url and comments url in an object and then stores that object in an array. 
Then we iterate over the results array from reqPullRequest and send out requests to the commit url and comment url
await is used because the iteration would conclude before the promise was returned,
the results from the iteration are stored in a new array and returned when the promise is resolved,
then the results are returned in the response to the client as a JSON
Any errors are logged in a file that is created with the .error extension with the timestamp as the filename
If there are errors the response to the client will return that no pull requests are found.


*/



app.post('/hotel', jsonencodedParser, function (req, res) {
var cResults = [];

async function reqPullRequest(){
return new Promise(function(resolve, reject) {
  
    const options = {
  url: 'https://api.github.com/repos/'+req.body.owner+'/'+req.body.repo+'/pulls?state=open',
  headers: {
    'User-Agent': 'sasysolutions1@gmail.com',
    'Username': 'sasysolutions1@gmail.com',
    'Password' :'YOUR_PERSONAL_ACCESS_TOKEN',
    Authorization: `Bearer YOUR_PERSONAL_ACCESS_TOKEN`
  }
};
        request.get(options, function (error, response, body) {
          if (error === null){ 
          var results = JSON.parse(body);console.log(results.message);
          var tempO;
              for(var i = 0; i < results.length; i++){
              tempO = {user: results[i].user.login, commits: results[i].commits_url, comments: results[i].comments_url};
              cResults.push(tempO);

            }

            console.log('cResults length: '+ cResults.length);
         
        resolve(cResults);}
        else { console.log('error: '+error);  fs.writeFile(__dirname + Date.now() +'.error',  error, function (err) {}); reject(error)}
            })

        

});}//update


reqPullRequest().then(async (resultsOutter) => {
   innerCommentsCommits(resultsOutter).then((resultsInner) => { 
     res.send(JSON.stringify({results: resultsInner}))   }) })

async function innerCommentsCommits(x){

  var comO = [];
return new Promise(async function(resolve, reject) {
        console.log(x.length);

 for(var j = 0; j < x.length; j++){
                                  var holdO = {user: '', commits: '', comments: ''};
                                  
                                   var promise1 = function(){
                                    return new Promise(function(resolve, reject) {
                                                  var commits1 = {
                                                url: x[j].commits,
                                                headers: {
                                    'User-Agent': 'sasysolutions1@gmail.com',
                                    'Username': 'sasysolutions1@gmail.com',
                                    'Password' :'YOUR_PERSONAL_ACCESS_TOKEN',
                                    Authorization: `Bearer YOUR_PERSONAL_ACCESS_TOKEN`     }
                                                          };
                                      request.get(commits1, function (error, response, body) {
                                      if(error === null){
                                      var lciresults = JSON.parse(body); 
                                      resolve(lciresults.length)}
                                      else{console.log('commits error: '+ error); fs.writeFile(__dirname + Date.now() +'.error',  error, function (err) {}); reject(error)}
                                      })   

                                      })   
                                  }
                                  
                                   var promise2 = function(){
                                    return new Promise(function(resolve, reject) {
                                                var comments1 = {
                                                url: x[j].comments,
                                                headers: {
                                    'User-Agent': 'sasysolutions1@gmail.com',
                                    'Username': 'sasysolutions1@gmail.com',
                                    'Password' :'YOUR_PERSONAL_ACCESS_TOKEN',
                                     Authorization: `Bearer YOUR_PERSONAL_ACCESS_TOKEN`
                                                            }
                                                          };

                                      request.get(comments1, function (error, response, body) {
                                      if(error === null){
                                      var lceresults = JSON.parse(body); 
                                      resolve(lceresults.length)}
                                      else{console.log('comments error: '+ error);  fs.writeFile(__dirname + Date.now() +'.error',  error, function (err) {}); reject(error)}
                                      })

                                      })       
                                }
                                holdO.user = x[j].user;
                                await promise1().then((hope1)=>{holdO.commits = hope1})
                                await promise2().then((hope2)=>{holdO.comments = hope2})
                                      comO.push(holdO)
                                          }//for
                                
                                resolve(comO)
                                })
                                }//func


})