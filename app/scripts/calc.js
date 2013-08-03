var  normal = require('./normal');

module.exports = (function() {
	'use strict';

	function blackScholes(params, type) {
		var yearsToExpiry, spot, strike, riskFreeRate, volatility, d1, d2, rtnValue;
		yearsToExpiry = params.daysToExpiry / 365;
		spot = params.spot;
		strike = params.strike;  // could deal with absolute value or % of at the money forward
		riskFreeRate = params.riskFreeRate / 100;  // annualised, compound rate, input as %
		volatility = params.volatility;

		// need to modify for divs and repo
		d1 = (Math.log(spot/strike) + (riskFreeRate + volatility * volatility / 2)*(yearsToExpiry))/(volatility*Math.sqrt(yearsToExpiry));
		d2 = (Math.log(spot/strike) + (riskFreeRate - volatility * volatility / 2)*(yearsToExpiry))/(volatility*Math.sqrt(yearsToExpiry));

		if (type === 'call') {
			rtnValue = normal.normalcdf(d1)*spot - normal.normalcdf(d2)*strike*Math.pow(Math.E, -1 * riskFreeRate * yearsToExpiry);

		}
		if (type === 'put') {
			rtnValue = normal.normalcdf(-1*d2)*strike*Math.pow(Math.E, -1*riskFreeRate*yearsToExpiry) - normal.normalcdf(-1*d1)*spot;
		}

		return rtnValue;
	}

	function calculateValues(params, type, greeks) {
		// expect greeks to be an array of option greeks to calc
		var rtnValue = {};

		if (!greeks) {
			return blackScholes(params, type);
		}

		if (greeks.indexOf('delta') !== -1) {
			var deltaX = 1;
			var deltaY, a, b;

			// Use loop to clone object
			var copiedParams = {};
			for(var prop in params) {
			    if(params.hasOwnProperty(prop)) {
			        copiedParams[prop] = params[prop];
		        }
			}

			copiedParams.spot = copiedParams.spot - deltaX/2;
			a = blackScholes(copiedParams, type);
			// need to add entire deltaX as just took off ha
			copiedParams.spot = copiedParams.spot + deltaX;
			b = blackScholes(copiedParams, type);
			deltaY = b - a;
			rtnValue.delta = deltaY / deltaX;

		}

		return rtnValue;
	}

	return {
		calculateValues: calculateValues
	};

}());