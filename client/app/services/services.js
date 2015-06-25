angular.module('howWasIt.services', [])

.factory('AuthFactory', function($http, $q, $state, Session){

  var loginOrSignUp = function(userObj, url){
    return $http({
        method: 'POST',
        url: '/'+url,
        data: userObj
      }).success(function(data, status, headers, config){
        console.log('data: ', data);
        Session.create(data.user.id, data.user.first_name, data.user.last_name, data.user.email);
        // TODO: This can be more elegant
        $http.defaults.headers.common.Authorization = 'Bearer ' + data.token;
        $state.go('home');
      });
  };

  // in our app, authentication grants authorization (since permissions all the same)
  var isAuthenticated = function(){
    return !!Session.userId;
  };
  
  var checkLoggedIn = function() {  
    var deferred = $q.defer();

    $http.get('/loggedIn').success(function(user){

      if (user){
        deferred.resolve();
      } else {
        console.log("You need to log in.");
        deferred.reject();
        $state.go('login');
      }
    });
  };

  var logout = function() {
    delete $http.defaults.headers.common.Authorization;
    $state.go('login');
  };

  return {
    checkLoggedIn: checkLoggedIn,
    isAuthenticated: isAuthenticated,
    loginOrSignUp: loginOrSignUp,
    logout: logout
  };

})

// TODO: hands/receives from localStorage
.service('Session', function() {
  // for log in
  this.create = function(userId, firstName, lastName, email){
    this.id = userId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
  };

  // for log out
  this.destroy = function(){
    this.id = null;
    this.firstName = null;
    this.lastName = null;
    this.email = null;
  };
});

