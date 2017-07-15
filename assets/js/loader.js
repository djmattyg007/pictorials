function ProgressBar(container)
{
    this.container = container;
    this.bar = container.find("[data-progress-bar]");
    this.reset();
}

ProgressBar.prototype = {
    reset: function() {
        return this.set(0);
    },

    set: function(percentage) {
        this.progress = (percentage < 1 ? percentage * 100 : percentage);
        this.bar.css({"width": this.progress + "%"});
        return this;
    },

    get: function() {
        return this.progress;
    },

    hide: function() {
        this.container.hide();
        return this;
    },

    show: function() {
        this.container.show();
        return this;
    }
};

function Loader(container)
{
    this.container = container;
    this.progressBar = new ProgressBar(container.find("[data-loader-progress]"));
    this._showTimeout = null;
    this._modalAlreadyOpen = null;
    this._$body = jQuery("body");
}

Loader.prototype = {
    hide: function(callback) {
        if (this._showTimeout) {
            clearTimeout(this._showTimeout);
            this._showTimeout = null;
        } else {
            if (callback) {
                this.container.one("hidden.bs.modal", callback);
            }
            this.container.modal("hide");
            if (this._modalAlreadyOpen === true) {
                this._$body.addClass("modal-open");
            }
            this._modalAlreadyOpen = null;
            this.progressBar.hide();
        }
    },

    show: function(includeProgressBar) {
        var self = this;
        this._showTimeout = setTimeout(function() {
            self._showTimeout = null;
            self._modalAlreadyOpen = self._$body.hasClass("modal-open");
            self.container.modal("show");
            if (includeProgressBar === true) {
                self.progressBar.reset().show();
            }
        }, 110);
    },

    updateProgress: function(percentage) {
        this.progressBar.set(percentage);
    }
};
