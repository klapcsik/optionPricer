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
