/* globals PRICER, $, appTemplates */


// Could query Yahoo APIs for stock data select * from yahoo.finance.quotes where symbol in ("YHOO","AAPL","GOOG","MSFT")

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
        console.time('Calc range of options and draw graph');

		var params, optionValue, greeks;
		params = {
			daysToExpiry: this.daysToExpiry,
			spot: this.spot,
			strike: this.strike,
			riskFreeRate: this.riskFreeRate,
			volatility: this.volatility
		};
        var actualSpot = this.spot, callValues = {values: []}, deltas ={values: []};
		// Calculate
        if (variable === 'spot') {
            for (var i = low; i < high; i += resolution) {
                params.spot = i;
                optionValue = calc.calculateValues(params, 'call');

                callValues.values.push({x: i, y: optionValue});
                debugger;
                greeks = calc.calculateValues(params, 'call', ['delta']);
                deltas.values.push({x:i, y:greeks.delta});

            }
        }

        this.spot = actualSpot;
        params.spot = this.spot;
        this.call = calc.calculateValues(params, 'call');
        console.log(deltas);

        var data = deltas;
        var graphEl = $('#graph');
        var graph = new lineGraph.Graph(data, graphEl);
        graph.clearCanvas();
        graph.drawAxis();
        graph.drawLine();

        console.timeEnd('Calc range of options and draw graph');

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
        high = myOption.spot + 150;
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
