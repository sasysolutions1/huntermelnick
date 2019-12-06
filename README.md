Hotel.html and Hotel.js

First sending a json with owner and repo which is concatenated and sent in a call to the /hotel POST
reqPullRequest runs and sends a call to the github api for the pull request and then stores the login, 
commits url and comments url in an object and then stores that object in an array. 
Then we iterate over the results array from reqPullRequest and send out requests to the commit url and comment url
await is used because the iteration would conclude before the promise was returned,
the results from the iteration are stored in a new array and returned when the promise is resolved,
then the results are returned in the response to the client as a JSON
Any errors are logged in a file that is created with the .error extension with the timestamp as the filename
If there are errors the response to the client will return that no pull requests are found.
