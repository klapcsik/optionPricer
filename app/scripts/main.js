/* globals PRICER, $, appTemplates */


// Could query Yahoo APIs for stock data select * from yahoo.finance.quotes where symbol in ("YHOO","AAPL","GOOG","MSFT")

var  calc = require('./calc');
var  lineGraph = require('./lineGraph');

PRICER.applicationController = (function() {
    'use strict';
    var currency;

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

    EquityOption.prototype.render = function(type) {
		// TODO template
		var template = '<div class="value center">' + this[type].toPrecision(3) + '</div>';
		this.el.html(template);
    };

    EquityOption.prototype.calculate = function(type, variable, low, high, resolution) {
        console.time('Calc range of options and draw graph');

		var params, optionValue, greeks;
		params = {
			daysToExpiry: this.daysToExpiry,
			spot: this.spot,
			strike: this.strike,
			riskFreeRate: this.riskFreeRate,
			volatility: this.volatility
		};
        var callValues = {values: []}, deltas ={values: []};
		// Calculate
        var copiedParams = {};
        for(var prop in params) {
            if(params.hasOwnProperty(prop)) {
                copiedParams[prop] = params[prop];
            }
        }
        if (variable === 'spot') {
            for (var i = low; i < high; i += resolution) {
                copiedParams.spot = i;
                optionValue = calc.calculateValues(copiedParams, type);

                callValues.values.push({x: i, y: optionValue});
                greeks = calc.calculateValues(copiedParams, type, ['delta']);
                deltas.values.push({x:i, y:greeks.delta});
            }
        }

        this[type] = calc.calculateValues(params, type);
        console.log(deltas);

        
        var valueGraph = new lineGraph.Graph(callValues, $('#graph-value'), {title: 'Value'});
        valueGraph.clearCanvas();
        valueGraph.drawAxis();
        valueGraph.drawLine();

        var deltaGraph = new lineGraph.Graph(deltas, $('#graph-delta'), {title: 'Delta'});
        deltaGraph.clearCanvas();
        deltaGraph.drawAxis();
        deltaGraph.drawLine();

        console.timeEnd('Calc range of options and draw graph');

    };

    function calculate(type) {
		var userForm = new OptionInputs({
			values: ['daysToExpiry', 'spot', 'strike', 'riskFreeRate', 'volatility']
		});
		userForm.getValues();

		var optionValueElement = $('#options-value');
		var myOption = new EquityOption(userForm.values, optionValueElement);
        // This takes about a 1ms
        var low, high, resolution;
        low = myOption.spot - 50;
        high = myOption.spot + 150;
        resolution = 1;
		myOption.calculate(type, 'spot', low, high, resolution);
        // I think it would be preferable to use events to call this rather than calling directly
		myOption.render(type);
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
        // $('.graph-container').html(appTemplates.lineGraph.render());
        // add click handlers
        $('#js-form-calc-call').on('click', function() {
            calculate('call');
        });
        $('#js-form-calc-put').on('click', function() {
            calculate('put');
        });
        $('#js-form-get-riskfreerate').on('click', function() {
            var daysToExpiry = $('#daysToExpiry').val();
            if (navigator && navigator.onLine === false) {
                console.log('Not available offline');
            } else {
                var url = 'api/riskfreerate/' + currency + '/' + daysToExpiry;
                $.ajax( url )
                    .done(function(data) {
                        $('#riskFreeRate').val(data.rate);
                    })
                    .fail(function() { console.log('Risk free rate request failed'); });
            }
        });
        $('.js-form-currency').on('click', function() {
            currency = this.dataset.currency;
            // remove active class from all and apply to appropriate one
            $('.js-form-currency').removeClass('active');
            $(this).toggleClass('active');

        });

    }

    return {
        start: start,
        calculate: calculate
    };
}());
