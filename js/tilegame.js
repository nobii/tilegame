var EventEmitter = new Function ();

EventEmitter.prototype.initEventEmitter = function () {
    this._listeners = {};
};

EventEmitter.prototype.initEventEmitterType = function (type) {
    if (!type) {
        return;
    }
    this._listeners[type] = [];
};

EventEmitter.prototype.hasEventListener = function (type, fn) {
    if (!this.listener) {
        return false;
    }

    if (type && !this.listener[type]) {
        return false;
    }

    return true;
};

EventEmitter.prototype.addListener = function (type, fn) {
    if (!this._listeners) {
        this.initEventEmitter();
    }
    if (!this._listeners[type]) {
        this.initEventEmitterType(type);
    }
    this._listeners[type].push(fn);

    this.emit('newListener', type, fn);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function (type, fn) {
    fn._onceListener = true;
    this.addListener(type, fn);
};

EventEmitter.prototype.removeListener = function (type, fn) {
    if (!this._listeners) {
        return;
    }
    if (!this._listeners[type]) {
        return;
    }
    if (!this._listeners[type].forEach) {
        return;
    }

    if (!type) {
        this.initEventEmitter();
        this.emit('removeListener', type, fn);
        return;
    }
    if (!fn) {
        this.initEventEmitterType(type);
        this.emit('removeListener', type, fn);
        return;
    }

    var self = this;
    this._listeners[type].forEach(function (listener, index) {
        if (listener === fn) {
            self._listeners[type].splice(index, 1);
        }
    });
    this.emit('removeListener', type, fn);
};

EventEmitter.prototype.emit = function (type) {
    if (!this._listeners) {
        return;
    }
    if (!this._listeners[type]) {
        return;
    }
    if (!this._listeners[type].forEach) {
        return;
    }

    var self = this,
        args = [].slice.call(arguments, 1);

    this._listeners[type].forEach(function (listener) {
        listener.apply(self, args);
        if (listener._onceListener) {
            self.removeListener(type, listener);
        }
    });
};

EventEmitter.prototype.listeners = function (type) {
    if (!type) {
        return undefined;
    }
    return this._listeners[type];
};

// jquery style alias
EventEmitter.prototype.trigger = EventEmitter.prototype.emit;
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
var inherits = function (Child, Parent) {
    for (var i in Parent.prototype) {
        if (Child.prototype[i]) {
            continue;
        }
        Child.prototype[i] = Parent.prototype[i];
    }
};
var Shape = function (opts) {
    this.x = opts.x || 0;
    this.y = opts.y || 0;
    this.type = opts.type || 'default';

    this.pos = [0, 0];
    this.offset = [0, 0];

    this.initEl();
    this.initListener();
};

inherits(Shape, EventEmitter);

Shape.prototype.initEl = function () {
    var el = this.el || document.createElement('div');
    this.el = el;

    this.updateClassname();
};

Shape.prototype.updateClassname = function () {
    var names = ['shape', this.type];
    if (this.gripped) {
        names.push('gripped');
    }
    this.el.className = names.join(' ');
};

Shape.prototype.posit = function (x, y) {
    var el = this.el;

    if (0 <= x && 0 <= y) {
        this.pos = [x, y];
    }

    el.style.left = this.pos[0] + 'px';
    el.style.top = this.pos[1] + 'px';
};

Shape.prototype.initListener = function () {
    var self = this,
        el = this.el;

    // touch
    el.addEventListener('touchstart', function (e) {
        var touch = e.touches[0];

        if (!touch) {
            return;
        }
        self.startGrip(touch);
    }, false);

    el.addEventListener('touchmove', function (e) {
        e.preventDefault();

        var touch = e.touches[0];

        if (!touch) {
            return;
        }
        self.processGrip(touch);
    }, false);

    el.addEventListener('touchend', function (e) {
        self.endGrip();
    }, false);

    // mouse
    el.addEventListener('mousedown', function (e) {
        self.startGrip(e);
    }, false);
    el.addEventListener('mousemove', function (e) {
        e.preventDefault();
        if (!self.gripped) {
            return;
        }
        self.processGrip(e);
    }, false);
    el.addEventListener('mouseup', function (e) {
        self.endGrip();
    }, false);
    el.addEventListener('mouseout', function (e) {
        self.endGrip();
    }, false);
};

Shape.prototype.startGrip = function (e) {
    this.gripped = true;
    this.prevOffset = [e.pageX, e.pageY];
    this.updateClassname();
};

Shape.prototype.processGrip = function (e) {
    this.pos[0] += e.pageX - this.prevOffset[0];
    this.pos[1] += e.pageY - this.prevOffset[1];

    this.prevOffset = [e.pageX, e.pageY];

    this.posit();
};

Shape.prototype.endGrip = function () {
    this.gripped = false;
    this.emit('reposition', this);
    this.updateClassname();
};
var throttle = function (fn, interval) {
    var is_throttled = false;

    return function () {
        if (is_throttled) {
            return;
        }

        is_throttled = true;
        setTimeout(function () {
            fn();
            is_throttled = false;
        }, interval);
    };
};
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
    var size = Math.min(window.innerWidth, window.innerHeight),
        gridSize = size / this.grids;

    this.el.style.width = size + 'px';
    this.el.style.height = size + 'px';

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
window.addEventListener('DOMContentLoaded', function () {
    var shapes = [
        { x: 0, y: 0, type: 'tri1' },
        { x: 0, y: 5, type: 'tri2' },
        { x: 5, y: 5, type: 'tri3' },
        { x: 5, y: 0, type: 'tri4' },

        { x: 3, y: 4, type: 'tri1' },
        { x: 4, y: 3, type: 'tri1' },

        { x: 3, y: 1, type: 'tri2' },
        { x: 4, y: 2, type: 'tri2' },

        { x: 1, y: 2, type: 'tri3' },
        { x: 2, y: 1, type: 'tri3' },

        { x: 1, y: 3, type: 'tri4' },
        { x: 2, y: 4, type: 'tri4' },

        { x: 2, y: 2, type: 'square' },
        { x: 2, y: 3, type: 'square' },
        { x: 3, y: 3, type: 'square' },
        { x: 3, y: 2, type: 'square' }
    ];

    new Game(shapes, {
        el: document.getElementById('tilegame'),
        size: Math.min(window.innerWidth, window.innerHeight),
        grids: 6
    });
}, false);