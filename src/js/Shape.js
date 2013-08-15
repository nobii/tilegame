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