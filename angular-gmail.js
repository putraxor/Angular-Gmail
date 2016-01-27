   (function(){
   	'use strict';
	//don't forget to load the client library for javascript     <script src="https://apis.google.com/js/client.js">

	angular.module('Angular-Gmail',[]).factory('Angular-Gmail',['$q',
		'$rootScope',function($q,$rootScope){
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
	 			//takes an array of messages, batches them up and gets the corresponding message bodies.
	 			var deferred = $q.defer(); 
	 			var output = [];
	 			function loadMessages(ids){
	 				var batch = gapi.client.newBatch();
	 				for (var i = 0; i < messageIds.length; i++) {
	 					batch.add(gapi.client.gmail.users.messages.get({
	 						'userId':'me',
	 						'id':ids[i],
	 						'fields':'payload/headers,labelIds'
	 					}))
	 				};
	 				batch.then(function(resp){
	 					for(var key in resp.result) {
	 						output.push({
	 							'id':key,
	 							'headers':resp.result[key].result.headers,
	 							'labels':resp.result[key].result.labelIds,
	 						})
	 					}
	 					if(output.length ==messageIds.length){
	 						deferred.resolve(output);
	 					}
	 				})
	 			}
	 			for (var i = 0; i < messageIds.length; i+=50) {
	 				loadMessages(messageIds.slice(i,i+50))
	 			};
	 			return deferred.promise;
	 		}
	 		function getMessages(query){
	 			//returns an arry of messages that meet the query parameters 
	 			var deferred = $q.defer();
	 			var messageIds = {array:[]};
	 			loadAllMessageIds(query,messageIds).then(function(messageIds){
	 				loadAllMessages(messageIds).then(function(messages){
	 					deferred.resolve(messages);
	 				})
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