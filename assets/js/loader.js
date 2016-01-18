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
    this.indicator = container.find("[data-loader-indicator]");
    this.progressBar = new ProgressBar(container.find("[data-loader-progress]"));
}

Loader.prototype = {
    hide: function() {
        this.container.modal("hide");
        this.progressBar.hide();
    },

    show: function(includeProgressBar) {
        this.container.modal("show");
        if (includeProgressBar === true) {
            this.progressBar.reset().show();
        }
    },

    updateProgress: function(percentage) {
        this.progressBar.set(percentage);
    }
};
