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
    var el = this.el || document.createElement('div'),
        x = this.x,
        y = this.y,
        type = this.type;

    el.className = ['shape', type].join(' ');

    this.el = el;
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
};

Shape.prototype.startGrip = function (e) {
    this.prevOffset = [e.pageX, e.pageY];
};

Shape.prototype.processGrip = function (e) {
    this.pos[0] += e.pageX - this.prevOffset[0];
    this.pos[1] += e.pageY - this.prevOffset[1];

    this.prevOffset = [e.pageX, e.pageY];

    this.posit();
};

Shape.prototype.endGrip = function () {
    this.emit('reposition', this);
};