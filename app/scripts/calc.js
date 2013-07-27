var  normal = require('./normal');

module.exports = function(params) {
	'use strict';
	// calculate price
	params = {
		daysToExpiry: 365,
		spot: 100,
		strike: 150,
		riskFreeRate: 0.05,
		volatility: 0.5
	};

	var yearsToExpiry, spot, strike, riskFreeRate, volatility, d1, d2, callValue, putValue;
	yearsToExpiry = params.daysToExpiry / 365;
	spot = params.spot;
	strike = params.strike;  // could deal with absolute value or % of at the money forward
	riskFreeRate = params.riskFreeRate;  // annualised, compound rate
	volatility = params.volatility;

	// need to modify for divs and repo
	d1 = (Math.log(spot/strike) + (riskFreeRate + volatility * volatility / 2)*(yearsToExpiry))/(volatility*Math.sqrt(yearsToExpiry));
	d2 = (Math.log(spot/strike) + (riskFreeRate - volatility * volatility / 2)*(yearsToExpiry))/(volatility*Math.sqrt(yearsToExpiry));

	callValue = normal.normalcdf(d1)*spot - normal.normalcdf(d2)*strike*Math.pow(Math.E, -1 * riskFreeRate * yearsToExpiry);
	// from put call parity
	putValue = normal.normalcdf(-1*d2)*strike*Math.pow(Math.E, -1*riskFreeRate*yearsToExpiry) - normal.normalcdf(-1*d1)*spot;
	console.log('call value = ' + callValue);
	console.log('put value = ' + putValue);
	return {callValue: callValue, putValue: putValue};
};