/* globals PRICER, $, appTemplates */


// Could query Yahoo APIs for stock data select * from yahoo.finance.quotes where symbol in ("YHOO","AAPL","GOOG","MSFT")

var  calc = require('./calc');
var  lineGraph = require('./lineGraph');

PRICER.applicationController = (function() {
    'use strict';
    var currency = 'gbp';  // default to gbp

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
        $('.header-container').html(appTemplates.header.render());
		$('.left-container').html(appTemplates.userForm.render());
        updateCurrency(currency);
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
            updateCurrency(currency);
        });

        $('#daysToExpiry').bind('input', function() {
            var today, expiry, expiryMonth, expiryDay, expiryDate;
            today = new Date();
            expiry = new Date();
            expiry.setDate(today.getDate() + parseInt($('#daysToExpiry').val(), 10));
            expiryMonth = pad(expiry.getMonth()+1, 2);
            expiryDay = pad(expiry.getDate(), 2);
            expiryDate = expiry.getFullYear() + '-' + expiryMonth + '-' + expiryDay;
            $('#expiryDate').val(expiryDate);
        });
        $('#expiryDate').bind('input', function() {
            var daysToExpiry;
            var formExpiryDate = $('#expiryDate').val().split(/\s*\-\s*/g);
            var expiryDate = new Date(formExpiryDate[0], formExpiryDate[1]-1, formExpiryDate[2]);
            var today = new Date();
            var todayRounded = today.getTime() - (today.getHours())*(60*60*1000)-(today.getMinutes()*(60*1000))-(today.getSeconds()*1000);
            daysToExpiry = (expiryDate - todayRounded) / (1000*60*60*24);
            $('#daysToExpiry').val(Math.round(daysToExpiry));
            $('#expiryDate').blur();
        });

    }

    // Thanks to Hans Pufal for this: http://www.electrictoolbox.com/pad-number-javascript-hans-pufal/
    function pad (n, len, padding) {
        var sign = '', s = n;

        if (typeof n === 'number') {
            sign = n < 0 ? '-' : '';
            s = Math.abs (n).toString ();
        }

        if ((len -= s.length) > 0) {
            s = new Array(len + 1).join (padding || '0') + s;
        }

        return sign + s;
    }

    function updateCurrency(currency) {
        if (currency === 'gbp') {
            $('.js-currency-symbol').html('£');
        } else if (currency === 'usd') {
            $('.js-currency-symbol').html('$');
        }
    }

    return {
        start: start,
        calculate: calculate
    };
}());
