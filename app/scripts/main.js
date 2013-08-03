/* globals PRICER, $, appTemplates */

var  calc = require('./calc');
var  lineGraph = require('./lineGraph');

PRICER.applicationController = (function() {
    'use strict';

	function EquityOption(params, resultsElement) {
		// Specific prices at values when calculated
        this.call = null;
		this.put = null;

        // Range of values for plotting graph
        this.callValues = {};
        this.putValues = {};

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

    EquityOption.prototype.calculate = function(variable, low, high, resolution) {
		var params, optionValues;
		params = {
			daysToExpiry: this.daysToExpiry,
			spot: this.spot,
			strike: this.strike,
			riskFreeRate: this.riskFreeRate,
			volatility: this.volatility
		};
        var actualSpot = this.spot, callValues = {values: []}, putValues = {};
		// Calculate
        if (variable === 'spot') {
            for (var i = low; i < high; i += resolution) {
                params.spot = i;
                optionValues = calc(params);

                callValues.values.push({x: i, y: optionValues.call * 10});
                putValues[i] = optionValues.put;
            }
        }
        console.log(callValues);
        this.spot = actualSpot;
        this.call = callValues[actualSpot];
        this.put = putValues[actualSpot];

        var data = callValues;
        var graphEl = $('#graph');
        var graph = new lineGraph.Graph(data, graphEl);
        graph.drawAxis();
        graph.drawLine();


    };

    function calculate() {
		var userForm = new OptionInputs({
			values: ['daysToExpiry', 'spot', 'strike', 'riskFreeRate', 'volatility']
		});
		userForm.getValues();

		var optionValueElement = $('#optionsValue');
		var myOption = new EquityOption(userForm.values, optionValueElement);
        // This takes about a 1ms
        var low, high, resolution;
        low = myOption.spot - 50;
        high = myOption.spot + 50;
        resolution = 1;
		myOption.calculate('spot', low, high, resolution);
        // I think it would be preferable to use events to call this rather than calling directly
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
