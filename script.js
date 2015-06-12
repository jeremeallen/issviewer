$(document).ready(function(){
    var CONST = {
        latitude: 45.1408530,
        longitude: -93.1127220,
        date_format: "dddd, MMMM Do YYYY, h:mm:ss a"
    };
    moment.locale('en');

    function ISSFLyover() {
        $('#latitude').val(CONST.latitude);
        $('#longitude').val(CONST.longitude);
        this.refreshData();
        _.bindAll(this, "refreshData", "gotRefreshedData");
        $('#refresh').on('click', this.refreshData);
        $('#latitude, #longitude').on('change keypress', _.debounce(this.refreshData,500));
    }

    _.extend( ISSFLyover.prototype, {

        gotRefreshedData: function() {
            var me = this;
            var atTheIss = _.pluck(_.where(this.astronauts.people, { craft: "ISS" }), "name");
            $('#astronauts').text(atTheIss.join(", "));

            var outputFlyover = function(flyover) {
                $('#flyovers').append('<div>Flyover at: ' + flyover.risetime + ': ' + flyover.weatherDescription + '</div>');
            }

            var processFlyoverData = function(flyover) {

                var weatherAtFlyover = _.find(me.weather.list, function (w) {
                    return w.dt <= flyover.risetime && w.dt + 60*60*3 > flyover.risetime;
                });

                return {
                    clouds: weatherAtFlyover && weatherAtFlyover.clouds.all,
                    hasWeather: !_.isUndefined(weatherAtFlyover),
                    weatherDescription: weatherAtFlyover && weatherAtFlyover.weather[0].description,
                    risetime: moment(flyover.risetime*1000).format(CONST.date_format),
                    duration: flyover.duration
                }
            }
        

            function getDay(flyover) {
                //"Thursday, June 11th 2015, 8:46:59 pm"
                return moment(flyover.risetime, CONST.date_format).format("MMMM Do YYYY");
            }

            var showDay = function(flyoversForDay, day){
                flyoversForDay = _.sortBy(flyoversForDay, 'clouds');
                $('#flyovers').append((dayTemplate({ title: day, flyovers: flyoversForDay })));
            };

            var showSummary = function (flyoversWithWeather) {
                var summary = _.countBy(flyoversWithWeather, 'weatherDescription');
                $('#summary').empty();
                _.each(summary, function(count, condition){
                    $('#summary').append("<div></b>" + condition + "</b>: " + count + "</div>");
                });
            }

            var dayTemplate = _.template($('#day-template').html());
            $('#flyovers').empty();

            _.chain(this.iss.response)
                .map(processFlyoverData)
                .where({ hasWeather: true })
                .tap(showSummary)
                .groupBy(getDay)
                .each(showDay);


            
            
        },

        refreshData: function(){
            var me = this;
            var location = { lat: $('#latitude').val(), lon: $('#longitude').val() };

            var getData = function (property, url, options) {
                jQuery.getJSON( url, options, function (data) {
                    me[property] = data;
                    complete();
                });
            };

            var complete = _.after(3, _.bind(me.gotRefreshedData, this));

            getData('iss', "http://api.open-notify.org/iss-pass.json?callback=?", _.extend({ n: 100 }, location));
            getData('weather', "http://api.openweathermap.org/data/2.5/forecast?callback=?", location);
            getData('astronauts', "http://api.open-notify.org/astros.json?callback=?", {});
            
        }
    });

    var iss = new ISSFLyover();

});
