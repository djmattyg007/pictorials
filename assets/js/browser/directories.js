function BrowserDirectories(container, templater)
{
    this.container = container;
    this.templater = templater;

    this.prevDirMapping = {};

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

        jQuery(document).on("pictorials:path_changed", function(event) {
            self.prevDirMapping = {};
        });

        jQuery(document).on("pictorials:changing_dir_before", function(event, eventData) {
            if (!eventData.newDir) {
                return;
            }
            var prevDirSegments = eventData.prevDir.split("/").length;
            var newDirSegments = eventData.newDir.split("/").length;
            if (prevDirSegments < newDirSegments) {
                self.prevDirMapping[eventData.prevDir] = eventData.newDir;
            }
        });

        jQuery(document).on("pictorials:changing_dir_after", function(event, eventData) {
            if (!eventData.newDir) {
                return;
            }
            var prevDirSegments = eventData.prevDir.split("/").length;
            var newDirSegments = eventData.newDir.split("/").length;
            if (prevDirSegments > newDirSegments && self.prevDirMapping[eventData.newDir]) {
                var dirLink = self.container.find("a.dir[data-relpath='" + self.prevDirMapping[eventData.newDir] + "']").closest("tr");
                DOMTools.focusElement(dirLink);
            }
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
