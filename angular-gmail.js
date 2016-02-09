   (function(){
   	'use strict';
	//don't forget to load the client library for javascript     <script src="https://apis.google.com/js/client.js">

	angular.module('Angular-Gmail',[]).factory('Angular-Gmail',['$q','$rootScope','$timeout','$window',function($q,$rootScope,$timeout,$window){
			//The Client ID is specified in your Google Cloud Project
			var CLIENT_ID = '';
	 		//Scopes are permission levels for your application, choose the most limited scope that meets your needs from this list: https://developers.google.com/gmail/api/auth/scopes
	 		var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
	 		function loggedIn(){
	 			//After the app is authorized, load the API and broadcast to the controller that this service is ready;
	 			gapi.client.load('gmail', 'v1', function(){
	 				$rootScope.$broadcast('GmailReady');
	 			});
	 		}

	 		function loadAllMessageIds(query,destination){
	 			if (query=='') {
	 				console.log('If you do not supply a query to loadAllMessagesIds, it will load all of the mailbox. Do not do this');
	 				debugger;
	 				return false; 
	 			};
	 			var deferred = $q.defer();
	 			function loadMessageIds(nextPageToken,query){
	 				var deferred = $q.defer();
	 				var request = gapi.client.gmail.users.messages.list({
	 					'userId': 'me',
	 					'pageToken': nextPageToken,
	 					'fields':'messages/id,nextPageToken,resultSizeEstimate',
	 					'q': query
	 				});
	 				request.execute(function(resp) {
	 					deferred.resolve(resp);
	 				})
	 				return deferred.promise;
	 			}
	 			//small sychronous function to handle recursion to get all the pages of results.
	 			function x(nextPageToken,query,destination){
	 				loadMessageIds(nextPageToken,query)
	 				.then(function(resp){
	 					destination.array = destination.array.concat(resp.messages);
	 					if(resp.nextPageToken){
	 						x(resp.nextPageToken,query,destination)
	 					}else{
	 						deferred.resolve(destination.array.map(function(obj){return obj.id}));
	 					}
	 				})
	 			}
	 			x('',query,destination)
	 			return deferred.promise;
	 		}
	 		function loadAllMessages(messageIds){
	 			console.log(messageIds.length+'message IDs');
	 			//takes an array of messages, batches them up and gets the corresponding message bodies.
	 			var deferred = $q.defer(); 
	 			var output = [];
	 			function sanitizeMessage(gmailMessage){
	 				//takes the raw message object from the Gmail API and converts it to an easier 
	 				var ret = {};
	 				ret.headers = gmailMessage.payload.headers;
	 				ret.labels = gmailMessage.labelIds;
	 				ret.id = gmailMessage.id;
	 				ret.timestamp = new Date(Number(gmailMessage.internalDate));
	 				if(gmailMessage.payload.headers){
	 					for (var i = 0; i < gmailMessage.payload.headers.length; i++) {
	 						switch(gmailMessage.payload.headers[i].name){
	 							case 'Subject':
	 							ret.subject = gmailMessage.payload.headers[i].value;
	 							break;
	 						}

	 					};
	 					//iterate through the message's headers to pull out relevant data
	 					//debugger;

	 				}

	 				if(gmailMessage.payload.parts){
	 					for (var i = 0; i < gmailMessage.payload.parts.length; i++) {
	 						switch(gmailMessage.payload.parts[i].mimeType){
	 							case 'text/plain':
	 							ret.text = atob(gmailMessage.payload.parts[i].body.data.replace(/-/g, '+').replace(/_/g, '/'));
	 							break;
	 							case 'text/html':
	 							ret.html = atob(gmailMessage.payload.parts[i].body.data.replace(/-/g, '+').replace(/_/g, '/'));
	 							break;
	 						}
	 					};

	 				}else if(gmailMessage.payload.body.data){
	 					ret.html = atob(gmailMessage.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
	 				}
	 				return ret;
	 			}
	 			function loadMessages(ids){
	 				if(!$window.me){
	 					gapi.client.gmail.users.getProfile({userId:'me'}).then(function(response){
	 						$window.me = response.result;
	 					});
	 				}

	 				if(ids.length ==0){
	 					console.log('loadMessages was called without an argument');
	 					return 0;
	 				}
	 				var batch = gapi.client.newBatch();
	 				for (var i = 0; i < ids.length; i++) {
	 					batch.add(gapi.client.gmail.users.messages.get({
	 						'userId':'me',
	 						'id':ids[i],
	 						//'fields':'payload/headers,labelIds'
	 					}))
	 				};
	 				batch.then(function(resp){
	 					var retryArray = [];
	 					for(var key in resp.result) {
	 						if (resp.result[key].status == 200){
	 							output.push(sanitizeMessage(resp.result[key].result))
	 						}
	 						else{
	 							console.log(resp.result[key].status);
	 							if(resp.result[key].status == 429){

	 								//the requests happened too quickly and need to be resent
	 								debugger;
	 							}
	 						}
	 					}
	 					if(output.length ==messageIds.length){
	 						deferred.notify(Math.round(output.length/messageIds.length*100))
	 						deferred.resolve(output);
	 					}
	 					else{
	 						deferred.notify(Math.round(output.length/messageIds.length*100))
	 					}
	 				})
	 			}
	 			//function to loop through and send the requests more slowly
	 			var i =0;
				function myLoop () {           //  create a loop function
				   $timeout(function () {    //  call a 3s setTimeout when the loop is called
					loadMessages(messageIds.slice(i,i+20));        //  your code here   
					console.log('sending a request');             
				      i = i+20;                     //  increment the counter
				      if (i < messageIds.length) {            //  if the counter < 10, call the loop function
				         myLoop();             //  ..  again which will trigger another 
				      }                        //  ..  setTimeout()
				  }, 100)
				}
				myLoop(); 

				return deferred.promise;
			}
			function getMessages(query){
	 			//returns an arry of messages that meet the query parameters 
	 			var deferred = $q.defer();
	 			var messageIds = {array:[]};
	 			loadAllMessageIds(query,messageIds).then(function(messageIds){
	 				deferred.notify('Finished loading all message Ids');
	 				return loadAllMessages(messageIds)
	 			}).then(function(messages){
	 				deferred.resolve(messages);
	 			},function(err){
	 				console.log('something has gone wrong');
	 			},function(message){
	 				//send the notification upward so that the main view can use it to manage the loading bar;
	 				deferred.notify(message);
	 			})

	 			return deferred.promise;
	 		}
	 		var self = {
	 			init:function() {
	 				var deferred = $q.defer();
	 				gapi.auth.authorize(
	 				{
	 					'client_id': CLIENT_ID,
	 					'scope': SCOPES.join(' '),
	 					'immediate': true
	 				}, function(authResult){
	 					if(authResult && !authResult.error){
	 						deferred.resolve(authResult);
	 					}else{
	 						$rootScope.$broadcast('ShowLoginButton');

	 					}

	 				});
	 				return deferred.promise;
	 			},
	 			login:function(){
	 				var deferred = $q.defer();
	 				gapi.client.load('gmail', 'v1', function(){
	 					try{
	 						gapi.auth.authorize({
	 							'client_id': CLIENT_ID,
	 							'scope': SCOPES.join(' '),
	 							'immediate': false
	 						}, function(authResult){
	 							deferred.resolve(authResult);
	 						})
	 					}catch(err){
	 						debugger;
	 					}

	 				})
	 				return deferred.promise;
	 			},
	 			getMessages:getMessages
	 		}

		//debugger;
		return self;
	}])
})();