;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
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
},{"./normal":2}],2:[function(require,module,exports){
// Thanks to http://www.math.ucla.edu/~tom/distributions/normal.html for this code

exports.normalcdf = function(X){   //HASTINGS.  MAX ERROR = .000001
	'use strict';
	var T=1/(1+0.2316419*Math.abs(X));
	var D=0.3989423*Math.exp(-X*X/2);
	var Prob=D*T*(0.3193815+T*(-0.3565638+T*(1.781478+T*(-1.821256+T*1.330274))));
	if (X>0) {
		Prob=1-Prob;
	}
	return Prob;
};

// Prob=normalcdf((Z-M)/SD);
// Prob=round(100000*Prob)/100000;

},{}],3:[function(require,module,exports){
(function(){/*global describe, it, expect, before */
'use strict';
(function () {
	var calc = require('../../app/scripts/calc');
    describe('Black-Scholes calculation with preset values', function () {
			var optionValues;
			before( function() {
				var params = {
					daysToExpiry: 365,
					spot: 100,
					strike: 150,
					riskFreeRate: 0.05,
					volatility: 0.5
				};
				optionValues = calc(params);
			});
            it('should calculate call price correctly', function () {
				var callValue = Math.round(optionValues.callValue);
				expect(callValue).to.equal(8);
            });
            it('should calculate put price correctly', function () {
				var putValue = Math.round(optionValues.putValue);
				expect(putValue).to.equal(51);
            });
		});
})();

})()
},{"../../app/scripts/calc":1}]},{},[3])
;