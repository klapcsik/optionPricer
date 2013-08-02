/* globals PRICER, $, appTemplates */

var  calc = require('./calc');

PRICER.applicationController = (function() {
    'use strict';

	function EquityOption(params, resultsElement) {
		this.call = null;
		this.put = null;
		this.el = resultsElement;
		this.daysToExpiry = params.daysToExpiry;
		this.spot = params.spot;
		this.strike = params.strike;
		this.riskFreeRate = params.riskFreeRate;
		this.volatility = params.volatility;
    }

    EquityOption.prototype.render = function() {
		// TODO template
		var template = '<div>Call = ' + this.call + '</div><div> Put = ' + this.put + '</div>';
		this.el.html(template);
    };

    EquityOption.prototype.calculate = function() {
		var params, optionValues;
		params = {
			daysToExpiry: this.daysToExpiry,
			spot: this.spot,
			strike: this.strike,
			riskFreeRate: this.riskFreeRate,
			volatility: this.volatility
		};
		// Calculate
		optionValues = calc(params);
		this.call = optionValues.call;
		this.put = optionValues.put;
    };

    function calculate() {
		var userForm = new OptionInputs({
			values: ['daysToExpiry', 'spot', 'strike', 'riskFreeRate', 'volatility']
		});
		userForm.getValues();

		var optionValueElement = $('#optionsValue');
		var myOption = new EquityOption(userForm.values, optionValueElement);
		myOption.calculate();
		myOption.render();
    }

    function OptionInputs(params)  {
		// this.formId = params.formId;
		// array of values
		this.values = params.values;
    }

    OptionInputs.prototype.getValues = function() {
		for (var i = 0; i < this.values.length; i++) {
			var attr = this.values[i];
			var valueSelector = '#' + attr;
			this.values[attr] = parseFloat($(valueSelector).val(),10);
		}
	};



    function start() {
		$('.option-form-container').html(appTemplates.userForm.render());
        $('.graph-container').html(appTemplates.lineGraph.render());
        // add click handlers
		$('#js-form-submit').on('click', function() {
			calculate();
		});
    }

    return {
        start: start,
        calculate: calculate
    };
}());
