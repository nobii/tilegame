var Game = function (shapes, opts) {
    this.el = opts.el || document.body;
    this.grids = opts.grids || 6;

    this.initShapes(shapes || []);
    this.initWindow();

    if (location.hash.length > 1) {
        this.loadHash();
    } else {
        this.arrangeShapes();
    }
    this.initListener();
};

Game.prototype.initWindow = function () {
    var el = this.el,

        ww = window.innerWidth,
        wh = window.innerHeight,
        size = Math.min(ww, wh),
        gridSize = size / this.grids;

    el.style.width = size + 'px';
    el.style.height = size + 'px';

    if (ww > wh) {
        el.style.top = '0%';
        el.style.left = '50%';
        el.style.marginTop = '0px';
        el.style.marginLeft = - (size / 2) + 'px';
    } else {
        el.style.top = '50%';
        el.style.left = '0%';
        el.style.marginTop = - (size / 2) + 'px';
        el.style.marginLeft = '0px';
    }

    this.shapes.forEach(function (shape) {
        shape.el.style.width = gridSize + 'px';
        shape.el.style.height = gridSize + 'px';
    });

    this.size = size;
    this.gridSize = gridSize;
};

Game.prototype.initListener = function () {
    var self = this;

    window.addEventListener('resize', throttle(function () {
        self.initWindow();
        self.arrangeShapes();
    }, 500));

    window.addEventListener('hashchange', function () {
        self.loadHash();
    }, false);
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
    this.updateLink();
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

Game.prototype.updateLink = function () {
    var url = encodeURIComponent(location.href),

        linkURL = [
            'https://twitter.com/intent/tweet',
            '?original_referer=', url,
            '&text=tilegame',
            '&hashtags=tilegame',
            '&tw_p=tweetbutton',
            '&url=', url
        ].join(''),

    tweetbutton = document.getElementsByClassName('tweetbutton');

    for (var i = 0; i < tweetbutton.length; i++) {
        tweetbutton[i].href = linkURL;
    }
};