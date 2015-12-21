<!DOCTYPE html>
<html ng-app="AngularGmailSampleApp">
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular.min.js"></script>
<title>Angular Gmail Sample App</title>
<body ng-controller="AGSActrl" id='content'>
	<button ng-show="ShowLoginButton" ng-click="login()">Login</button>
	{{messages.array}}
	<script src="/angular-gmail.js"></script>

	<script>
		function checkAuth(){
	 		angular.element(document.getElementById("content")).injector().get('Angular-Gmail').init()
	 	}
	 </script>
	 <script src="https://apis.google.com/js/client.js?onload=checkAuth"></script>

	 <script>
	 	var app = angular.module("AngularGmailSampleApp", ['Angular-Gmail']);
	 	app.controller("AGSActrl",['Angular-Gmail','$scope', function(AngularGmail,$scope) {
	 		$scope.ShowLoginButton = false;
	 		$scope.login = AngularGmail.login
	 		$scope.$on('ShowLoginButton',function(event,data){
	 			$scope.ShowLoginButton = true;
	 			$scope.$apply();
	 		});
	 		$scope.$on('GmailReady',function(event,data){
	 			$scope.messages = {array:[]};
	 			AngularGmail.loadAllMessageIds('','newer_than:24h',$scope.messages)
	 			.then(function(messages){
	 				debugger;
	 			})

	 		})
	 	}]);

	 </script>
	</body>
	</html>