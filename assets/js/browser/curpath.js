function BrowserCurPath(container)
{
    this.container = container;

    this.initEvents();
}

BrowserCurPath.prototype = {
    initEvents: function() {
        var self = this;
        this.container.on("click", "a.dir", function(event) {
            event.preventDefault();
            event.stopPropagation();
            jQuery(self).trigger("browser_curpath:change_dir", {relpath: event.target.dataset.relpath});
        });
    },

    render: function(pathLabel, relpath) {
        var html = pathLabel;
        if (relpath) {
            html = '<a href="#" class="dir" data-relpath="">' + html + '</a>';
            var relpathParts = relpath.split("/");
            var lastRelpathPart = relpathParts.pop();
            var newrelpath = [];
            relpathParts.forEach(function(value, index) {
                newrelpath.push(value);
                html += ' &gt; <a href="#" class="dir" data-relpath="' + newrelpath.join("/") + '">' + value + '</a>';
            });
            html += " &gt; " + lastRelpathPart;
        }
        this.container.html(html);
    }
};
