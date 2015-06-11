$(document).ready(function(){
    var CONST = {
        latitude: 45.1408530,
        longitude: -93.1127220
    };
    moment.locale('en');

    var gotRefreshedData = function(iss, weather) {
        console.log('ISS Flyovers:', iss);
        console.log('Weather:', weather);

        var outputFlyover = function(flyover) {
            $('#flyovers').append('<div>Flyover at: ' + flyover.risetime + '</div>');
        }

        var processFlyoverData = function(flyover) {
            return {
                risetime: moment(flyover.risetime*1000).format("dddd, MMMM Do YYYY, h:mm:ss a"),
                duration: flyover.duration
            }
        }

        var flyovers = _.map(iss.response, processFlyoverData);
        $('#flyovers').empty();
        _.each(flyovers, outputFlyover);
    }

    var refreshData = function(){
        jQuery.getJSON("http://api.open-notify.org/iss-pass.json?lat="+ CONST.latitude +"&lon="+ CONST.longitude +"&n=100&callback=?", function(iss){
            jQuery.getJSON("http://api.openweathermap.org/data/2.5/forecast?lat="+ CONST.latitude +"&lon="+ CONST.longitude +"&callback=?", function(weather){
                gotRefreshedData(iss, weather);
            })
        });
    };

    refreshData();

    $('#refresh').on('click', refreshData);

});
