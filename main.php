<!DOCTYPE html>
<html ng-app="AngularGmailSampleApp">
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular.min.js"></script>
<title>Angular Gmail Sample App</title>
<body ng-controller="AGSActrl">


<script>

angular.module('Angular-Gmail',[]).factory('Angular-Gmail',['$q',function($q){
	//debugger;
	return {};
}])


var app = angular.module("AngularGmailSampleApp", ['Angular-Gmail']);
app.controller("AGSActrl",['Angular-Gmail', function(AngularGmail) {

	debugger;
}]);

</script>
</body>
</html>