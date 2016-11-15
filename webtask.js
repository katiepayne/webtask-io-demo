
module.exports = function(context, callback) {
	var request = require('request');

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
					return { error: error, response: response: body: body };

				// No Errors.
				callback(null, JSON.stringify(response));
				return false;
	    	});
		}
	}

	function twilio(userKey, password) {

	    /**
	    * Sends a message via twilio.
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

	var twilio = new twilio(context.data.TWILIO_USER, context.data.TWILIO_PASS);
	
	var mLab = new mLabConnection(context.data.MLAB_DBNAME, context.data.MLAB_COL, context.data.MLAB_APIKEY );

	// Send a message.
	var result = twilio.sendMessage(context.data.FROM_PHONE, context.data.TO_PHONE, new Date().toLocaleDateString + ": This is a test.") 
	
	// A successful result will be false, if truthy -- there are errors.
	if( result )

		// Errors are present, log them to the mLab db.
		mLab.saveTask( {context.data.ERROR_KEY: JSON.stringify(result) } );
	}
}