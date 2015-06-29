angular.module('howWasIt.friends', [])

.controller('FriendsController', function ($scope, $rootScope, $http) {
  $rootScope.friendMarkers = [];
  $scope.userFriends = {};
  $scope.searchMembersResults = [];
  var userId = $scope.currentUserId;

  $scope.getFriendList = function() {
    return $http({
      method: 'GET',
      url: '/friends/getFriendList?user_id=' + userId
    })
    .then(function(resp) {
      // Expect resp.data to be an array of user objects
      resp.data.forEach(function(user) {
        $scope.userFriends[user.id] = user;
      });
    });
  };

  $scope.searchMembers = function(query) {
    return $http({
      method: 'GET',
      url: '/friends/searchMembers?query=' + query
    })
    .then(function(resp) {
      // Expect resp.data to be an array of user objects
      $scope.searchMembersResults = [];
      resp.data.forEach(function(user) {
        $scope.searchMembersResults.push(user);
      });
    });
  };

  $scope.addFriend = function(userObj) {

    return $http({
      method: 'POST',
      url: '/friends/addFriend?user_id=' + userId,
      data: userObj
    })
    .then(function(resp) {
      $scope.searchMembersResults = [];
      console.log(resp.data);
      $scope.getFriendList();
    });
  };

  $scope.removeFriend = function(userObj) {
    return $http({
      method: 'POST',
      url: '/friends/removeFriend?user_id=' + userId,
      data: userObj
    })
    .then(function(resp) {
      console.log('FRIEND REMOVED: ', $scope.userFriends[resp.data.friendId]);
      delete $scope.userFriends[resp.data.friendId];

    });
  };

  $scope.makeMarker = function(place) {
    var location = {};

    location.marker = new google.maps.Marker({
      map: $rootScope.map,
      position: new google.maps.LatLng(place.latitude, place.longitude),
      title: place.google_loc_name,
      animation: google.maps.Animation.Drop
    });

    location.contentString = "<div><h5>" + place.google_loc_name + "</h5><hr><h5>"+place.review_text+"</h5></div>";

    location.infoWindow = new google.maps.InfoWindow({
      content: location.contentString
    });

    google.maps.event.addListener(location.marker, "click", function() {
      location.infoWindow.open($rootScope.map, location.marker);
    });

    $rootScope.friendMarkers.push(location.marker);

    // set focus on these markers
    var bounds = new google.maps.LatLngBounds();
    bounds.extend(location.marker.position);

    $rootScope.map.fitBounds(bounds);


    return location;
  };

  $scope.removeReviews = function() {
    for (var i = 0; i < $rootScope.friendMarkers.length; i++) {
      $rootScope.friendMarkers[i].setMap(null);
    }
    for (var i = 0; i < $rootScope.markers.length; i++) {
      $rootScope.markers[i].setMap(null);
    };
  };

  $scope.addFriendReviews = function(userObj) {
    // TODO: Fix bug so map doesn't show user's comments on 'remove friend' button click
    friendId = userObj.id;

    return $http({
      method: 'GET',
      url: '/reviews/handleReviews?user_id=' + friendId
    })
    .then(function(resp) {
      console.log('RESP for addFriend Reviews: ', resp);
      $scope.removeReviews();
      resp.data.forEach(function(review) {
        $scope.makeMarker(review);
        console.log(review);
      });
    });
  };

  $scope.getFriendList();
});




