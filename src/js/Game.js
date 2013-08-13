var Game = function (shapes, opts) {
    this.el = opts.el || document.body;
    this.grids = opts.grids || 6;
    this.size = opts.size || 0;

    this.initShapes(shapes || []);
    this.initWindow();

    if (location.hash.length > 1) {
        this.loadHash();
    } else {
        this.arrangeShapes();
    }
};

Game.prototype.initWindow = function () {
    var size = this.size,
        gridSize = size / this.grids;

    this.shapes.forEach(function (shape) {
        shape.el.style.width = gridSize + 'px';
        shape.el.style.height = gridSize + 'px';
    });

    this.gridSize = gridSize;
};

Game.prototype.initShapes = function (options) {
    var self = this,
        el = this.el,
        shapes = [];

    options.forEach(function (option) {
        var shape = new Shape(option);

        shape.on('reposition', function (shape) {
            self.roundShapePosition(shape);
        });

        el.appendChild(shape.el);
        shapes.push(shape);
    });

    this.shapes = shapes;
};

Game.prototype.arrangeShapes = function () {
    var gridSize = this.gridSize;

    this.shapes.forEach(function (shape) {
        shape.posit(
            shape.x * gridSize,
            shape.y * gridSize
        );
    });

    this.updateHash();
};

Game.prototype.roundShapePosition = function (shape) {
    var gridSize = this.gridSize;

    shape.x = Math.round(shape.pos[0] / gridSize);
    shape.y = Math.round(shape.pos[1] / gridSize);

    this.arrangeShapes();
};

Game.prototype.loadHash = function () {
    var shapes = this.shapes,
        hash = location.hash.slice(1),
        hashCodes = hash.split(/_/);

    hashCodes.forEach(function (hashCode, index) {
        var parts = hashCode.split('.');
        shapes[index].x = parts[0];
        shapes[index].y = parts[1];
    });

    this.arrangeShapes();
};

Game.prototype.updateHash = function () {
    var hashCodes = [];

    this.shapes.forEach(function (shape) {
        hashCodes.push([
            shape.x,
            shape.y
        ].join('.'));
    });

    location.href = '#' + hashCodes.join('_');
};