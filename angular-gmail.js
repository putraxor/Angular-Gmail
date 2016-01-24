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
	 		function loadAllMessageIds(nextPageToken,query,destination){
	 			var deferred = $q.defer();
	 			if(!nextPageToken){
	 				nextPageToken = '';
	 			}
	 			loadMessageIds(nextPageToken,query)
	 			.then(function(resp){
	 				destination.array = destination.array.concat(resp.messages);
	 				if(resp.nextPageToken){
	 					loadAllMessageIds(resp.nextPageToken,query,destination)
	 				}else{
	 					deferred.resolve(destination);
	 				}
	 			})
	 			return deferred.promise
	 		}
	 		var self = {
	 			init:function() {
	 				gapi.auth.authorize(
	 				{
	 					'client_id': CLIENT_ID,
	 					'scope': SCOPES.join(' '),
	 					'immediate': true
	 				}, function(authResult){
	 					if(authResult && !authResult.error){
	 						loggedIn();
	 					}else{
	 						$rootScope.$broadcast('ShowLoginButton');

	 					}
	 				});
	 			},
	 			login:function(){
	 				try{
	 					gapi.auth.authorize({
	 						'client_id': CLIENT_ID,
	 						'scope': SCOPES.join(' '),
	 						'immediate': false
	 					}, function(authResult){
	 						console.log(authResult);
	 						loggedIn();
	 					})
	 				}catch(err){
	 					debugger;
	 				}
	 			},
	 			loadAllMessageIds:loadAllMessageIds,
	 			loadMessageIds:loadMessageIds



	 		}

		//debugger;
		return self;
	}])
})();