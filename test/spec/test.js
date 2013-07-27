/*global describe, it, expect, before */
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
				var callValue = Math.round(optionValues.call);
				expect(callValue).to.equal(8);
            });
            it('should calculate put price correctly', function () {
				var putValue = Math.round(optionValues.put);
				expect(putValue).to.equal(51);
            });
		});
})();
