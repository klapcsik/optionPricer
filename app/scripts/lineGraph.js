// Thanks to http://www.worldwidewhat.net/2011/06/draw-a-line-graph-using-html5-canvas/
// Slight modifications to fit to a more modular OO pattern, and also in some case refactored to 
// make slightly more readable (in my opinion)

module.exports = (function() {
    'use strict';

    var xPadding = 30;
    var yPadding = 30;
    var width = 200;
    var height = 300;
    var data;

    // slightly more generic 
    function Graph(graphData, el) {
        data = graphData;
        this.el = el;
        this.width = width;
        this.height = height;
        this.context = el[0].getContext('2d');

        // Set some drawing properties
        this.context.lineWidth = 2;
        this.context.strokeStyle = '#333';
        this.context.font = 'italic 8pt sans-serif';
        this.context.textAlign = 'center';
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
        max += 10 - max % 10;
        return max;
    };

    // maybe max x & y should be properties of the object?
    Graph.prototype.getDimensions = function() {
        var x, y;
        y = this.getMax('Y');
        x = this.getMax('X');
        return {x: x, y: y};
    };

    Graph.prototype.getXPixel = function(val) {
        var width, dims;
        dims = this.getDimensions();
        width = dims.x;
        var availableGraphWidth = width - xPadding;
        var pixelsPerUnit = availableGraphWidth / this.getMax('X');
        return xPadding + (pixelsPerUnit * data.values[val].X);
    };
 
    Graph.prototype.getYPixel = function(val) {
        var height, dims;
        dims = this.getDimensions();
        height = dims.y;
        var availableGraphHeight = height - yPadding;
        var pixelsPerUnit = availableGraphHeight / this.getMax('Y');
        return height - yPadding - (pixelsPerUnit * data.values[val].Y);
    };

    Graph.prototype.drawAxis = function() {
        var width, height, dims, ctx = this.context;
        dims = this.getDimensions();
        width = dims.x;
        height = dims.y;
        ctx.beginPath();
        ctx.moveTo(xPadding, 0);
        ctx.lineTo(xPadding, height - yPadding);
        ctx.lineTo(width, height - yPadding);
        console.log(width);
        console.log(height - yPadding);
        ctx.stroke();

        // axis labels
        for(var i = 0; i < data.values.length; i++) {
            // TODO: stop these values crashing into each other
            // Offset 20px from x or y axis
            ctx.fillText(data.values[i].X, this.getXPixel(i), height - yPadding + 20);
            ctx.fillText(data.values[i].Y, xPadding - 20, this.getYPixel(i));
        }

        // y axis labels
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
         
        for(var j = 0; j < data.values.length; j++) {
            ctx.fillText(j, xPadding - 10, this.getYPixel(j));
        }
    };

    Graph.prototype.drawLine = function() {
        var ctx = this.context;
        ctx.strokeStyle = '#f00';
        ctx.beginPath();
        ctx.moveTo(this.getXPixel(0), this.getYPixel(0));
         
        for(var i = 0; i < data.values.length; i++) {
            ctx.lineTo(this.getXPixel(i), this.getYPixel(i));
        }
        ctx.stroke();

        // Markers
        ctx.fillStyle = '#333';
 
        for(var j = 0; j < data.values.length; j++) {
            ctx.beginPath();
            ctx.arc(this.getXPixel(j), this.getYPixel(j), 4, 0, Math.PI * 2, true);
            ctx.fill();
        }
    };

    // TODO: Refactor as no need to expose all these methods publicly
    return {
        Graph: Graph
    };

}());