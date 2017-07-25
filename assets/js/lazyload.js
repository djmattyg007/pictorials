(function($) {
    "use strict";

    var $w = $(window);
    var wh = $w.height();
    $w.on("resize.lazyload", function() {
        wh = $w.height();
    });

    var isInView = function(threshold) {
        var $e = $(this);
        var winTop = $w.scrollTop(),
            winBot = winTop + wh,
            elTop = $e.offset().top,
            elBot = elTop + $e.height();
        return elBot >= winTop - threshold && elTop <= winBot + threshold;
    };

    var LazyLoadFactory = function(callback, threshold, timeout) {
        this.callback = callback;
        this.threshold = threshold;
        this.timeout = timeout;
    }

    LazyLoadFactory.prototype = {
        create: function(images) {
            return new LazyLoad(images, this.callback, this.threshold, this.timeout);
        }
    };

    var LazyLoad = function(images, callback, threshold, timeout) {
        this.images = images;
        this.callback = callback;
        this.threshold = threshold || 0;
        this.timeout = timeout || 200;

        this.timer = null;
        this.running = false;
        this.ns = "ll" + Math.random().toString().substr(2, 8);

        this.initEvents();
    };

    LazyLoad.prototype = {
        initEvents: function() {
            var self = this;
            $w.on("scroll.lazyload." + this.ns + " resize.lazyload." + this.ns, function(event) {
                clearTimeout(self.timer);
                self.running = false;
                self.timer = setTimeout(self.load.bind(self), self.timeout);
            });
            self.timer = setTimeout(self.load.bind(self), self.timeout);
        },

        deinit: function() {
            $w.off(".lazyload." + this.ns);
            this.running = false;
            clearTimeout(this.timer);
            this.images = [];
        },

        load: function() {
            this.running = true;
            var self = this;
            var inview = this.images.filter(function() {
                return isInView.call(this, self.threshold);
            });
            if (!inview.length) {
                return;
            }
            var loaded = [];
            var callbackReturn;
            inview.each(function(index, element) {
                callbackReturn = self.callback(element);
                if (callbackReturn === false || self.running === false) {
                    return false;
                }
                loaded.push(element);
            });
            this.images = this.images.not(loaded);
        }
    };

    window.LazyLoadFactory = LazyLoadFactory;
    window.LazyLoad = LazyLoad;
})(jQuery);
