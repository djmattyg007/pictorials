function Browser(container, fileBrowserUrl, paths, loader, templater, fileDownloader, galleryFlFactory)
{
    this.container = container;
    this.fileBrowserUrl = fileBrowserUrl;
    this.paths = paths;
    this.loader = loader;
    this.templater = templater;
    this.fileDownloader = fileDownloader;
    this.galleryFlFactory = galleryFlFactory;

    // TODO: Split up browser into three objects: curpath, directories, files
    this.curpath = container.find("[data-browser-curpath]");
    this.directories = container.find("table tbody[data-browser-directories]");
    this.files = container.find("table tbody[data-browser-files]");
    this.loadBtn = container.find("[data-browser-load-btn]");

    this._dispatchLoadEventLock = false;
    this.initEvents();
}

Browser.prototype = {
    initEvents: function() {
        var self = this;
        this.curpath.on("click", "a.dir", this._changeDirEvent.bind(this));
        this.directories.on("click", "a.dir", this._changeDirEvent.bind(this));
        this.files.on("click", "a.file-download", this._downloadFileEvent.bind(this));
        this.files.on("change", "input.file-chk", function(event) {
            self._rowClick.call(this, this.checked);
        });
        this.loadBtn.on("click", this._dispatchLoadEvent.bind(this));

        jQuery(this.paths).on("paths:path_changed", function(event) {
            self.container.hide();
            self.deinit();
        });
        jQuery(this.paths).on("paths:path_chosen", function(event, eventData) {
            self.changeDir(eventData.pathID);
        });
    },

    registerWithKeyListener: function(keyListener) {
        keyListener.register(67, this._clearSelectedFilesEvent.bind(this));
        keyListener.register(76, this._dispatchLoadEvent.bind(this));
    },

    _changeDirEvent: function(event) {
        event.preventDefault();
        event.stopPropagation();
        this.changeDir(this.paths.getSelectedPathID(), event.target.dataset.relpath);
    },

    _downloadFileEvent: function(event) {
        event.preventDefault();
        var file = jQuery(event.target).closest("[data-relpath]").data("relpath");
        this.fileDownloader.downloadFile(this.paths.getSelectedPathID(), file);
    },

    _dispatchLoadEvent: function(event) {
        if (this._dispatchLoadEventLock === true) {
            return;
        }
        this._dispatchLoadEventLock = true;
        var files = this.getSelectedFiles();
        if (files === null) {
            alert("No files selected");
            this._dispatchLoadEventLock = false;
            return;
        }
        var pathID = this.paths.getSelectedPathID();
        jQuery(this).trigger("browser:load_files", {pathID: pathID, files: files});
        this._dispatchLoadEventLock = false;
    },

    _clearSelectedFilesEvent: function(event) {
        this.files.find(".file-chk:checked").click();
    },

    changeDir: function(pathID, relpath) {
        var postData = {"path": pathID};
        var errorValue;
        if (relpath) {
            postData["relpath"] = relpath;
            errorValue = relpath.split(/[\\/]/).pop();
        } else {
            errorValue = this.paths.getLabel(pathID);
        }
        var self = this;
        this.loader.show();
        jQuery.ajax({
            url: this.fileBrowserUrl,
            method: "POST",
            data: postData,
            dataType: "json"
        }).done(function(data) {
            self.deinit();
            self.renderCurPath(pathID, relpath);
            self.renderDirectories(data.directories);
            self.renderFiles(data.files);
            self.init();
            self.container.show();
        }).fail(function(jqXHR, textStatus, errorThrown) {
            var msg = "An error occurred while loading '" + errorValue + "':\n" + textStatus;
            if (textStatus == "error") {
                msg += "\n" + errorThrown;
            }
            alert(msg);
        }).always(function() {
            self.loader.hide();
        });
    },

    deinit: function() {
        if (this.files.html().trim() !== "") {
            this.files.find("tr").off(".shiftcheckbox");
            jQuery(window).off("unveil");
        }
        this.directories.empty();
        this.files.empty();
    },

    init: function() {
        this.files.find("tr").shiftcheckbox({
            checkboxSelector: 'input.file-chk',
            ignoreClick: "a",
            onChange: this._rowClick
        });
        this.files.find("img.file-thumb").unveil(this._rowThumbLoad, 100, 1000);
    },

    _rowClick: function(checked) {
        var $this = jQuery(this).closest("tr");
        if (checked === true) {
            $this.addClass("success");
        } else {
            $this.removeClass("success");
        }
    },

    _rowThumbLoad: function(img) {
        img.setAttribute("src", img.dataset.src);
    },

    renderDirectories: function(dirs) {
        var html = this.templater.render("browser-directory-row", dirs);
        this.directories.html(html);
    },

    renderFiles: function(files) {
        // TODO: re-work this so it doesn't lag the browser for very large file listings
        var html = this.templater.render("browser-file-row", files);
        this.files.html(html);
    },

    getSelectedFiles: function() {
        var selection = this.files.find("tr.file-row").has("input.file-chk:checked");
        if (selection.length === 0) {
            return null;
        }
        return selection.map(function() {
            return this.dataset.relpath;
        }).get();
    },

    renderCurPath: function(pathID, relpath) {
        var pathLabel = this.paths.getLabel(pathID);
        var html = pathLabel;
        if (relpath) {
            html = '<a href="#" class="dir" data-relpath="">' + html + '</a>';
            var relpathParts = relpath.split("/");
            var newrelpath = [];
            var lastIndex = relpathParts.length - 1;
            relpathParts.forEach(function(value, index) {
                newrelpath.push(value);
                html += " &gt; ";
                if (index === lastIndex) {
                    html += value;
                } else {
                    html += '<a href="#" class="dir" data-relpath="' + newrelpath.join("/") + '">' + value + '</a>';
                }
            });
        }
        this.curpath.html(html);
    }
};
