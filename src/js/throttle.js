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