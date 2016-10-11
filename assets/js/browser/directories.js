function BrowserDirectories(container, templater)
{
    this.container = container;
    this.templater = templater;

    this.initEvents();
}

BrowserDirectories.prototype = {
    initEvents: function() {
        var self = this;
        this.container.on("click", "a.dir", function(event) {
            event.preventDefault();
            event.stopPropagation();
            jQuery(document).trigger("pictorials:change_dir", {relpath: event.target.dataset.relpath});
        });
    },

    render: function(dirs) {
        var html = this.templater.render("browser-directory-row", dirs);
        this.container.html(html);
    },

    deinit: function() {
        this.container.empty();
    }
};
