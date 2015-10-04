
// Consumer Key  Au8nJMt4XIaQyhjydq1t3Q
// Consumer Secret 3NS3YKzkZYQ4VPbhol7yk0xvTEc
// Token fEIfbdNKAeuQEt9qlvLFwWSV4fnrx1Is
// Token Secret  L7JKejM0cy7t6O_EuScU0Ducw7c

var startUpCount = 0;

var businessName = '';
var businessAddress = '';
var businessPhone = '';
var distance = '';
var foodType = '';

if (Meteor.isClient) {

  Template.body.helpers({

    location: function () {

      startUpCount++;
      console.log("Start up count: " + startUpCount);
      if (startUpCount < 3){

        var lat = Geolocation.latLng().lat;
        var lng = Geolocation.latLng().lng;

        $.getScript('http://oauth.googlecode.com/svn/code/javascript/oauth.js', function(){

          console.log("oauth.js started");

          $.getScript('http://oauth.googlecode.com/svn/code/javascript/sha1.js', function(){

            console.log("sha1.js started");

            var auth = {
              consumerKey : "Au8nJMt4XIaQyhjydq1t3Q",
              consumerSecret : "3NS3YKzkZYQ4VPbhol7yk0xvTEc",
              accessToken : "fEIfbdNKAeuQEt9qlvLFwWSV4fnrx1Is",
              accessTokenSecret : "L7JKejM0cy7t6O_EuScU0Ducw7c",
              serviceProvider : {
                signatureMethod : "HMAC-SHA1"
              }
            };

            var terms = 'food';
            var near = 'San+Francisco';
            var accessor = {
              consumerSecret : auth.consumerSecret,
              tokenSecret : auth.accessTokenSecret
            };

            parameters = [];
            parameters.push(['term', terms]);
            parameters.push(['ll', lat + ',' + lng]);
            parameters.push(['radius_filter', 1500]);
            parameters.push(['callback', 'cb']);
            parameters.push(['oauth_consumer_key', auth.consumerKey]);
            parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
            parameters.push(['oauth_token', auth.accessToken]);
            parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

            var message = {
              'action' : 'http://api.yelp.com/v2/search',
              'method' : 'GET',
              'parameters' : parameters
            };

            OAuth.setTimestampAndNonce(message);
            OAuth.SignatureMethod.sign(message, accessor);

            var parameterMap = OAuth.getParameterMap(message.parameters);
            parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature);

            $.ajax({
              'url' : message.action,
              'data' : parameterMap,
              'cache' : true,
              'dataType' : 'jsonp',
              'jsonpCallback' : 'cb',
              'success' : function(data, textStats, XMLHttpRequest) {
                var businesses = data.businesses;
                console.log(businesses);
                var index = Math.floor((Math.random() * 19) + 1);

                foodType = businesses[index].categories[0][1];
                businessName = businesses[index].name;
                businessAddress = businesses[index].location.display_address;
                businessPhone = businesses[index].display_phone;
                distance = Math.round(businesses[index].distance);

                $("body").append(
                  '<div class = "jumbotron">'
                  +   "<p class = 'text-center'>Let's have some " + foodType + " at</p>"
                  +   '<h1 class = "text-center">' + businessName + '</h1>'
                  +   '<p class = "text-center">' + businessAddress + '</p>'
                  +   '<p class = "text-center">' + businessPhone + '</p>'
                  +   '<p class = "text-center">Only ' + distance + ' meters away!</p>'
                  + '</div>'
                );

                Session.set("displayResult", true);
              }
            });
          });
        });
      }
    },
    displayResult: function(){
      return Session.get('displayResult');
    }
  });
}
