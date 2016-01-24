# Angular Gmail
This is an angular service for interacting with Google's Gmail API. It's functionality and design are still very much a work in progress. 

## Getting Started

### Core Concepts
- **Broadcasting** This library uses the angular [$broadcast](https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$broadcast) functionality to communicate between the Angular-Gmail service and the basic controller.
- **Promises** Promises help make angular feel fast, If you are unfamilar with promises and would like to learn more, check out http://www.html5rocks.com/en/tutorials/es6/promises/
- **Messages, Message IDs** The Gmail API is structured so that you must first query the API to retreive a list of message IDs and then retreive the message bodies with a seperate call.
- **Gmail Queries** Many of the functions require you to query Gmail for the messages you want, just like using the search bar in Gmail. You can find more information on advanced search techniques here: https://support.google.com/mail/answer/7190?hl=en
- **Pagination** If your request would return more than 100 messages, or message IDs, the Gmail API will retrn the first 100 and a nextPageToken. Running the request again with the token will give you the next "page" of results. Many of the functions with "all" in the title iterate through all of the pages to make the process easier. 

### Create Keys
- Visit cloud.google.com and sign in with your Google Account.
- Either create a new project or select an existing project that you will use wit the Gmail API. 
- Navigate to the API manager for the project and enable the Gmail API. 
- You will also have to generate javascript credentials for the Gmail API, and possibly  configure for your consent screen, These will be more important when you move to a production setting.  

### Run the Sample
The sample is most easily run run with Google Cloud Platform's App Engine, but shouldn't be hard to use with any basic web server. There are two files `main.php` and `angular-gmail.js` that play different roles in accessing the API. The Client ID from the first step will need to be pasted into the beginning of `angular-gmail.js`

`main.php` contains:
- Basic webpage structure (including loading of javascript libraries)
- A basic Angular app and controller

While the rest of the functionality is inside of `angular-gmail.js`. Angular-Gmail uses Angular's built in broadcast functionality to communicate between as well as promises to be as asynchronous as possible. 

## Reference
**loadMessageIds***(nextPageToken, query)*
returns:promise
Requests a list of Message IDs that match *query*. *nextPageToken* is used for pagination, replace with '' if you do not yet have a nextPageToken. Resolves the promise with an array of Message IDs. 

**loadAllMessageIds***(nextPageToken, query, destination)*
returns:promise
destination is an object with a property called array that is an array. `destination = {array:[]}`
This function will request the message IDs matching the query, interatively going through each page of results until all the message IDs have been returned. The messages are then stored in the array of the destination. 

**login***()*
returns:promise
Loads the Gmail APIs and launches the Oauth flow for end users to authorize their account to your application. 


