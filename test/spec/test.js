/*global describe, it, expect, before */
'use strict';
(function () {
	var calc = require('../../app/scripts/calc');
    describe('Black-Scholes calculation with preset values', function () {
			var params;
			before( function() {
				params = {
					daysToExpiry: 365,
					spot: 100,
					strike: 150,
					riskFreeRate: 5,
					volatility: 50
				};
			});
            it('should calculate call price correctly', function () {
                var callValue = Math.round(calc.calculateValues(params, 'call'));
				expect(callValue).to.equal(8);
            });
            it('should calculate put price correctly', function () {
				var putValue = Math.round(calc.calculateValues(params, 'put'));
				expect(putValue).to.equal(51);
            });
		});
})();
