// Contents of module.exports are returned during require.
module.exports = function(context, callback) {

	// load request module
	var request = require('request');

    /**
     * captures errors and stores them in db using mLab.
     * @param database - Name of database
     * @param collection - Name of collection
     * @param apiKey - apiKey generated from mLab.
     */
	function mLabConnection( database, collection, apiKey ) {

		/**
		* Private URI variable.
		*/
		var uri = "https://api.mlab.com/api/1/databases/" + database + "/collections/" + collection + "?apiKey=" + apiKey;
		
		/**
		* Saves a doc to the MLab DB.
		*/
		this.saveTask = function ( doc ) {
	    
	    // Store a log in mLab DB.
	    request.post({
	    		url: uri, 
	    		body: JSON.stringify(doc),
	    		headers: {'content-type': 'application/json'}
	    	},
	    	function(error, response, body) {
				// Check for errors.
				if ( error )
					return { error: error, response: response, body: body };

				// No Errors.
				callback(null, JSON.stringify(response));
				return false;
	    	});
		}
	}

    /**
     * Sends message via Twilio
     * @param userKey - Twilio userKey
     * @param password - Twilio password
     */
    function twilio(userKey, password) {

	    /**
	    * Function that sends message.
	    * @param fromPhone - Phone number of recipient
	    * @param toPhone - Phone number of recipient
	    * @param message - Message to send.
	    */
	    this.sendMessage = function(fromPhone, toPhone, message) {
		    
		    // Send a SMS via Twilio.
		    request({ 
		        url: 'https://api.twilio.com/2010-04-01/Accounts/' + userKey + '/Messages', 
		        method: 'POST',
		        auth: {
		            user: userKey,
		            pass: password
		        },
		        form: {
		            From: fromPhone,
		            To: toPhone,
		            Body: message
		        }
		    }, function (error, res, body) {
		        callback(error, body);
			});

	    }
	}

	// Instantiate the Twilio helper object.
	var twilio = new twilio(context.data.TWILIO_USER, context.data.TWILIO_PASS);

    // Instantiate the mLab database connection.
	var mLab = new mLabConnection(context.data.MLAB_DBNAME, context.data.MLAB_COL, context.data.MLAB_APIKEY );

	// Send a message.
	var result = twilio.sendMessage(context.data.FROM_PHONE, context.data.TO_PHONE, new Date().toLocaleDateString() + ": This is a test.");
	
	// A successful result will be false, if truthy -- there are errors.
	if( result )

	    // Make a task object.
        var task = {};

	    // Use the error key and the current time as the key for the error entry.
        // Stringify the result object to be used as debug info.
        task[ context.data.ERROR_KEY + "-" + new Date().toLocaleDateString() ] = JSON.stringify(result);

		// Errors are present, log them to the mLab db.
		mLab.saveTask( task );
	}
}