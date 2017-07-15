function BrowserCurPath(container)
{
    this.container = container;

    this.currentPath = "";

    this.initEvents();
}

BrowserCurPath.prototype = {
    initEvents: function() {
        var self = this;
        this.container.on("click", "a.dir", function(event) {
            event.preventDefault();
            event.stopPropagation();
            jQuery(document).trigger("pictorials:change_dir", {relpath: event.target.dataset.relpath});
        });

        jQuery(document).on("pictorials:path_changed", function(event) {
            self.currentPath = "";
        });
    },

    getCurrentPath: function() {
        return this.currentPath;
    },

    update: function(pathLabel, relpath) {
        var html = pathLabel;
        if (relpath) {
            this.currentPath = relpath;
            html = '<a href="#" class="dir" data-relpath="">' + html + '</a>';
            var relpathParts = relpath.split("/");
            var lastRelpathPart = relpathParts.pop();
            var newrelpath = [];
            relpathParts.forEach(function(value, index) {
                newrelpath.push(value);
                html += ' &gt; <a href="#" class="dir" data-relpath="' + newrelpath.join("/") + '">' + value + '</a>';
            });
            html += " &gt; " + lastRelpathPart;
        } else {
            this.currentPath = "";
        }
        this.container.html(html);
    }
};
