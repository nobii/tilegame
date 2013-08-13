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