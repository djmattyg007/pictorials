function BrowserFiles(container, activeRowClass, templater, paths, thumbnailFlFactory, fileDownloader)
{
    this.container = container;
    this.activeRowClass = activeRowClass;
    this.templater = templater;
    this.paths = paths;
    this.thumbnailLoaderFactory = thumbnailFlFactory;
    this.thumbnailLoader = null;
    this.fileDownloader = fileDownloader;

    this.lazyLoaderFactory = new window.LazyLoadFactory(this._imgInView.bind(this), 100, 900);
    this.lazyLoader = null;

    this.initEvents();
}

BrowserFiles.prototype = {
    initEvents: function() {
        var self = this;
        this.container.on("click", "[data-file-action='download']", function(event) {
            var file = jQuery(this).closest("[data-relpath]").data("relpath");
            self.fileDownloader.downloadFile(self.paths.getSelectedPathID(), file);
        });
        this.container.on("click", "[data-file-action='edit-metadata']", function(event) {
            var file = jQuery(this).closest("[data-relpath]").data("relpath");
            jQuery(document).trigger("pictorials:edit_file_metadata", {"relpath": file});
        });
        this.container.on("change", "input.file-chk", function(event) {
            self._rowClick.call(self, this, this.checked);
            var selectedCount = self.container.find("input.file-chk:checked").length;
            jQuery(document).trigger("pictorials:selection_changed", { "selectedCount": selectedCount });
        });

        jQuery(document).popover({
            html: true,
            selector: "img.file-thumb[data-toggle='popover']",
            trigger: "hover",
            content: this._renderPopover
        });

        jQuery(document).on("pictorials:browser_clear_selected_files", function() {
            self.clearSelectedFiles();
        });

        jQuery(document).on("shiftcheckbox:checkbox_clicked", function() {
            var selectedCount = self.container.find("input.file-chk:checked").length;
            jQuery(document).trigger("pictorials:selection_changed", { "selectedCount": selectedCount });
        });
    },

    registerWithKeyListener: function(keyListener) {
        var self = this;
        // 67 = 'c'
        keyListener.register(67, function() {
            self.clearSelectedFiles();
        });
    },

    render: function(files, finish) {
        var curPage = 0, html;
        var groupSize = 200;
        var totalPages = files.length / groupSize;
        var self = this;
        var iterFunc = function() {
            html = self.templater.render("browser-file-row", files.slice(curPage * groupSize, curPage * groupSize + groupSize));
            self.container.append(html);
            curPage++;
            if (curPage < totalPages) {
                setTimeout(iterFunc, 50);
            } else {
                finish();
            }
        };
        setTimeout(iterFunc, 40);
    },

    _renderPopover: function() {
        return '<img src="' + this.src + '" alt="">';
    },

    init: function() {
        if (this.container.html().trim() === "") {
            return;
        }
        this.thumbnailLoader = this.thumbnailLoaderFactory.create(this.paths.getSelectedPathID(), 4, this._imgLoad.bind(this), {size: "small"});
        this.thumbnailLoader.start();
        this.container.find("tr").shiftcheckbox({
            checkboxSelector: "input.file-chk",
            ignoreClick: "[data-file-action], img.file-thumb[data-toggle='popover'], [role='tooltip']",
            onChange: this._rowClick.bind(this)
        });
        this.lazyLoader = this.lazyLoaderFactory.create(this.container.find("img.file-thumb"));
    },

    deinit: function() {
        if (this.container.html().trim() !== "") {
            this.container.find("tr").off(".shiftcheckbox");
            this.lazyLoader.deinit();
            this.lazyLoader = null;
        }
        if (this.thumbnailLoader) {
            this.thumbnailLoader.stop();
            this.thumbnailLoader.removeAllFiles();
        }
        this.container.empty();
        jQuery(document).trigger("pictorials:selection_changed", { "selectedCount": 0 });
    },

    getSelected: function() {
        var selection = this.container.find("tr").has("input.file-chk:checked");
        if (selection.length === 0) {
            return null;
        }
        return selection.map(function() {
            return this.dataset.relpath;
        }).get();
    },

    _rowClick: function(checkbox, checked) {
        var $row = jQuery(checkbox).closest("tr");
        if (checked === true) {
            $row.addClass(this.activeRowClass);
        } else {
            $row.removeClass(this.activeRowClass);
        }
    },

    _imgInView: function(img) {
        this.thumbnailLoader.addFile(img.dataset.relpath);
    },

    _imgLoad: function(filename, imgsrc) {
        this.container.find("img.file-thumb[data-relpath='" + filename + "']").attr("src", imgsrc);
    },

    clearSelectedFiles: function() {
        var self = this;
        this.container.find("input.file-chk:checked").each(function() {
            this.checked = false;
            self._rowClick.call(self, this, false);
        });
        jQuery(document).trigger("pictorials:selection_changed", { "selectedCount": 0 });
    }
};
