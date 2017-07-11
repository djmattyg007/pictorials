function SysloadChecker(sysloadUrl)
{
    this.sysloadUrl = sysloadUrl;
    this.active = false;
    this.checking = false;
    this.timer = null;
    this.frequency = 15;
}

SysloadChecker.prototype = {
    start: function() {
        this.active = true;
        this.timer = setTimeout(this._check.bind(this), this.frequency * 1000);
    },

    stop: function() {
        this.active = false;
        clearTimeout(this.timer);
    },

    _check: function() {
        if (this.checking === true || this.active === false) {
            return;
        }
        this.checking = true;
        var self = this;
        jQuery.ajax(this.sysloadUrl).done(function(data) {
            var parsedData = parseInt(data);
            var concurrencyLevel;
            if (isNaN(parsedData)) {
                // Assume an error occurred. Assume low concurrency.
                concurrencyLevel = 1;
            } else if (parsedData === 2) {
                concurrencyLevel = 2;
            } else if (parsedData === 1) {
                concurrencyLevel = 1;
            } else {
                concurrencyLevel = 0;
            }
            jQuery(document).trigger("pictorials:sysload_update", {"concurrencyLevel": concurrencyLevel});
        }).always(function() {
            self.checking = false;
            if (self.active === true) {
                self.timer = setTimeout(self._check.bind(self), self.frequency * 1000);
            }
        });
    }
};
