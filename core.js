define('jquery-lifestream', ['jquery', 'underscore', 'moment'], function($, _, moment){



/*!
 * jQuery Lifestream Plug-in
 * @version 0.3.2
 * Show a stream of your online activity
 *
 * Copyright 2011, Christian Vuerings - http://denbuzze.com
 */

  /**
   * Initialize the lifestream plug-in
   * @param {Object} config Configuration object
   */
  $.fn.lifestream = function( config ) {

    // Make the plug-in chainable
    return this.each(function() {

      // The element where the lifestream is linked to
      var outputElement = $(this),

      // Extend the default settings with the values passed
      settings = jQuery.extend({
        // The name of the main lifestream class
        // We use this for the main ul class e.g. lifestream
        // and for the specific feeds e.g. lifestream-twitter
        classname: "lifestream",
        // Callback function which will be triggered when a feed is loaded
        feedloaded: null,
        // The amount of feed items you want to show
        limit: 300,
        // An array of feed items which you want to use
        list: []
      }, config),

      // The data object contains all the feed items
      data = {
        count: settings.list.length,
        items: []
      },

      // We use the item settings to pass the global settings variable to
      // every feed
      itemsettings = $.extend( true, {}, settings ),

      /**
       * This method will be called every time a feed is loaded. This means
       * that several DOM changes will occur. We did this because otherwise it
       * takes to look before anything shows up.
       * We allow 1 request per feed - so 1 DOM change per feed
       * @private
       * @param {Array} inputdata an array containing all the feeditems for a
       * specific feed.
       */
      finished = function( inputdata ) {

          console.log(inputdata);
        // Merge the feed items we have from other feeds, with the feeditems
        // from the new feed
        $.merge( data.items, inputdata );

        // Sort the feeditems by date - we want the most recent one first
        data.items.sort( function( a, b ) {
            return ( b.date - a.date );
        });

        var items = data.items,

            // We need to check whether the amount of current feed items is
            // smaller than the main limit. This parameter will be used in the
            // for loop
            length = ( items.length < settings.limit ) ?
              items.length :
              settings.limit,
            i = 0, item,

            // We create an unordered list which will create all the feed
            // items
            ul = $('<ul class="' + settings.classname + '"/>');

        // Run over all the feed items + add them as list items to the
        // unordered list
        for ( ; i < length; i++ ) {
          item = items[i];
          if ( item.html ) {
            var readable_date = moment(item.date).fromNow();

            var $elem = $('<li id="'+item.config.service + '-' + item.date.getTime()  + '" class="'+ settings.classname + '-' + item.config.service + '">');

            $elem.append( item.html + ' [ ' + readable_date + ' ]' ).appendTo( ul );
            $elem.data( "name", item.config.service )
               .data( "url", item.url || "#" )
               .data( "time", item.date );
          }
        }

        // Change the innerHTML with a list of all the feeditems in
        // chronological order
        outputElement.html( ul );

        // Trigger the feedloaded callback, if it is a function
        if ( $.isFunction( settings.feedloaded ) ) {
          settings.feedloaded();
        }

      },

      /**
       * Fire up all the feeds and pass them the right arugments.
       * @private
       */
      load = function() {
        var service_configs = _.map(settings.list, function(service_config) {
            return _.clone(service_config);
        })
          console.log(service_configs);
        _.each(service_configs, function(config){
            if (!config.user) return
            require(['jam/jquery-lifestream/services/' + config.service], function(service){
                config._settings = itemsettings;
                $.fn.lifestream.feeds[config.service] = service( config, finished );
            })
        });
      };
      load();
    });

  };

  /**
   * Create a valid YQL URL by passing in a query
   * @param {String} query The query you want to convert into a valid yql url
   * @return {String} A valid YQL URL
   */
  $.fn.lifestream.createYqlUrl = function( query ) {
      return ( "http://query.yahooapis.com/v1/public/yql?q=__QUERY__&env=" +
      "store://datatables.org/alltableswithkeys&format=json")
        .replace( "__QUERY__" , encodeURIComponent( query ) );
  };

  /**
   * A big container which contains all available feeds
   */
  $.fn.lifestream.feeds = $.fn.lifestream.feeds || {};

  /**
   * Add compatible Object.keys support in older environments that do not natively support it
   * https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys#section_6
   */
  if(!Object.keys) {
    Object.keys = function(o){
      if (o !== Object(o)){
        throw new TypeError('Object.keys called on non-object');
      }
      var ret=[],p;
      for(p in o) {
        if(Object.prototype.hasOwnProperty.call(o,p)) {
          ret.push(p);
        }
      }
      return ret;
    };
  }

});
