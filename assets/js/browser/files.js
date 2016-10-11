function BrowserFiles(container, activeRowClass, templater, paths, thumbnailFlFactory, fileDownloader)
{
    this.container = container;
    this.activeRowClass = activeRowClass;
    this.templater = templater;
    this.paths = paths;
    this.thumbnailLoader = thumbnailFlFactory.create(4);
    this.fileDownloader = fileDownloader;

    this.lazyLoaderFactory = new window.LazyLoadFactory(this._imgInView.bind(this), 100, 900);
    this.lazyLoader = null;

    this.initEvents();
}

BrowserFiles.prototype = {
    initEvents: function() {
        var self = this;
        this.container.on("click", "a.file-download", function(event) {
            event.preventDefault();
            var file = jQuery(event.target).closest("[data-relpath]").data("relpath");
            self.fileDownloader.downloadFile(self.paths.getSelectedPathID(), file);
        });
        this.container.on("change", "input.file-chk", function(event) {
            self._rowClick.call(self, this, this.checked);
        });

        jQuery(document).popover({
            html: true,
            selector: "img.file-thumb[data-toggle='popover']",
            trigger: "hover",
            content: this._renderPopover
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
        this.thumbnailLoader.start(this.paths.getSelectedPathID(), this._imgLoad.bind(this), {size: "small"});
        this.container.find("tr").shiftcheckbox({
            checkboxSelector: "input.file-chk",
            ignoreClick: "a",
            onChange: this._rowClick.bind(this)
        });
        this.lazyLoader = this.lazyLoaderFactory.create(this.container.find("img.file-thumb"));
    },

    deinit: function() {
        this.thumbnailLoader.stop();
        this.thumbnailLoader.removeAllFiles();
        if (this.container.html().trim() !== "") {
            this.container.find("tr").off(".shiftcheckbox");
            this.lazyLoader.deinit();
            this.lazyLoader = null;
        }
        this.container.empty();
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
        this.container.find(".file-chk:checked").each(function() {
            this.checked = false;
            self._rowClick.call(self, this, false);
        });
    }
};
