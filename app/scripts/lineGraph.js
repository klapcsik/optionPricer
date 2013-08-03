// Thanks to http://www.worldwidewhat.net/2011/06/draw-a-line-graph-using-html5-canvas/
// Slight modifications to fit to a more modular OO pattern, and also in some case refactored to 
// make slightly more readable (in my opinion)

// TODO: Deltas can be between -1 & 1, graph currently doesn't show negative

module.exports = (function() {
    'use strict';

    var data;

    // slightly more generic 
    function Graph(graphData, el, opt) {
        var ctx;

        data = graphData;
        this.el = el;
        this.context = el[0].getContext('2d');

        this.padding = {};
        this.padding.x = 40;
        this.padding.y = 40;

        ctx = this.context;
        this.canvasSize = {};
        this.canvasSize.x = ctx.canvas.clientWidth;
        this.canvasSize.y = ctx.canvas.clientHeight;

        this.graphSize = {};
        this.graphSize.x = this.canvasSize.x - 2 * this.padding.x;
        this.graphSize.y = this.canvasSize.y - 2 * this.padding.y;

        this.max = {};
        this.max.x = this.getMax('x');
        this.max.y = this.getMax('y');

        this.pixelsPerUnit = {};
        this.pixelsPerUnit.x = this.graphSize.x / this.max.x;
        this.pixelsPerUnit.y = this.graphSize.y / this.max.y;

        this.origin = {};
        this.origin.x = this.padding.x;
        this.origin.y = this.graphSize.y;

        // Default drawing properties
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fff';
        ctx.fillStyle = '#fff';
        ctx.font = '8pt sans-serif';
        ctx.textAlign = 'center';

        // Optional parameters object
        this.opt = opt;

    }

    // specify setter for data so we can keep in sync
    Graph.prototype.setData = function(graphData) {
        data = graphData;
        // now re-render
    };

    Graph.prototype.getData = function() {
        return data;
    };

    // I wanted to add this to the prototype rather than as a 
    // private function as it's specific to the data structure
    Graph.prototype.getMax = function(el) {
        var max = 0;
        var nums = data.values;
        for (var i = 0; i < nums.length; i++) {
            if (nums[i][el] > max) {
                max = nums[i][el];
            }
        }

        // round to nearest ten
        max += 1 - max % 1;
        return max;
    };

    Graph.prototype.clearCanvas = function() {
        this.context.clearRect ( 0 , 0 , this.canvasSize.x , this.canvasSize.y );
    };

    Graph.prototype.getPixel = function(val, axis) {
        var rtn;
        if (axis === 'x') {
            rtn = this.origin.x + (this.pixelsPerUnit.x * val);
        }
        if (axis === 'y') {
            rtn = this.origin.y - (this.pixelsPerUnit.y * val);
        }
        return rtn;
    };
 

    Graph.prototype.drawAxis = function() {
        var ctx = this.context;

        ctx.beginPath();
        ctx.moveTo(this.origin.x, 0);
        ctx.lineTo(this.origin.x, this.origin.y);
        ctx.lineTo(this.origin.x + this.graphSize.x, this.origin.y);
        ctx.stroke();

        // y axis labels - one every X pixels
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        var spacing = {};
        var labelSpacing = 30;   // in pixels
        spacing.y = labelSpacing / this.pixelsPerUnit.y;
        spacing.x = labelSpacing / this.pixelsPerUnit.x;

        for(var i = 0; i < this.max.y; i += spacing.y) {
            ctx.fillText(i.toPrecision(3), this.origin.x, this.getPixel(i, 'y'));
        }

        ctx.textAlign = 'center';
        for(var j = 0; j < this.max.x; j += spacing.x) {
            ctx.fillText(j.toPrecision(3), this.getPixel(j, 'x'), (this.graphSize.y + 10));
        }

        // Add title
        if (this.opt) {
            if (this.opt.title) {
                ctx.font = '13pt sans-serif';
                ctx.fillText(this.opt.title, this.canvasSize.x / 2, 10);
            }
        }
    };

    Graph.prototype.drawLine = function() {
        var ctx = this.context;
        ctx.strokeStyle = '#f00';
        ctx.beginPath();
        ctx.moveTo(this.getPixel(data.values[0].x, 'x'), this.getPixel(data.values[0].y),'y');
         
        for(var i = 0; i < data.values.length; i++) {
            ctx.lineTo(this.getPixel(data.values[i].x, 'x'), this.getPixel(data.values[i].y, 'y'));
        }
        ctx.stroke();

        // Markers
        ctx.fillStyle = '#333';
 
        for(var j = 0; j < data.values.length; j++) {
            ctx.beginPath();
            ctx.arc(this.getPixel('x', data.values[j].x), this.getPixel('y', data.values[j].y), 4, 0, Math.PI * 2, true);
            ctx.fill();
        }
    };

    // TODO: Refactor as no need to expose all these methods publicly
    return {
        Graph: Graph
    };

}());