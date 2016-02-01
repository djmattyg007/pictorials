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
        this.container.html(html);
    }
};

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
            jQuery(self).trigger("browser_directories:change_dir", {relpath: event.target.dataset.relpath});
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

function BrowserFiles(container, activeRowClass, templater, paths, thumbnailFlFactory, fileDownloader)
{
    this.container = container;
    this.activeRowClass = activeRowClass;
    this.templater = templater;
    this.paths = paths;
    this.thumbnailLoader = thumbnailFlFactory.create(4);
    this.fileDownloader = fileDownloader;

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
        // 67 = 'l'
        keyListener.register(67, this._clearSelectedFilesEvent.bind(this));
    },

    render: function(files, finish) {
        var page = 0, html;
        var groupSize = 200;
        var pages = files.length / groupSize;
        var self = this;
        var iterFunc = function() {
            html = self.templater.render("browser-file-row", files.slice(page * groupSize, page * groupSize + groupSize));
            self.container.append(html);
            page++;
            if (page < pages) {
                setTimeout(iterFunc, 50);
            } else {
                finish();
            }
        };
        setTimeout(iterFunc, 40);
    },

    _renderPopover() {
        return '<img src="' + this.src + '" alt="">';
    },

    init: function() {
        this.thumbnailLoader.start(this.paths.getSelectedPathID(), this._imgLoad.bind(this), {size: "small"});
        this.container.find("tr").shiftcheckbox({
            checkboxSelector: "input.file-chk",
            ignoreClick: "a",
            onChange: this._rowClick.bind(this)
        });
        this.container.find("img.file-thumb").unveil(this._imgInView.bind(this), 100, 900);
    },

    deinit: function() {
        this.thumbnailLoader.stop();
        this.thumbnailLoader.removeAllFiles();
        if (this.container.html().trim() !== "") {
            this.container.find("tr").off(".shiftcheckbox");
            jQuery(window).off("unveil");
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

    _clearSelectedFilesEvent: function(event) {
        this.container.find(".file-chk:checked").click();
    }
};

function Browser(container, fileBrowserUrl, paths, loader, curpath, dirs, files)
{
    this.container = container;
    this.fileBrowserUrl = fileBrowserUrl;
    this.paths = paths;
    this.loader = loader;

    this.curpath = curpath;
    this.directories = dirs;
    this.files = files;
    this.loadBtn = container.find("[data-browser-load-btn]");

    this._containerVisible = false;
    this._dispatchLoadEventLock = false;
    this.initEvents();
}

Browser.prototype = {
    initEvents: function() {
        var self = this;
        jQuery(this.curpath).on("browser_curpath:change_dir", this._changeDirEvent.bind(this));
        jQuery(this.directories).on("browser_directories:change_dir", this._changeDirEvent.bind(this));
        this.loadBtn.on("click", this._dispatchLoadEvent.bind(this));

        jQuery(this.paths).on("paths:path_changed", function(event) {
            self.container.hide();
            self._containerVisible = false;
            self.deinit();
        });
        jQuery(this.paths).on("paths:path_chosen", function(event, eventData) {
            self.changeDir(eventData.pathID);
        });
    },

    registerWithKeyListener: function(keyListener) {
        keyListener.register(76, this._dispatchLoadEvent.bind(this));
    },

    _changeDirEvent: function(event, eventData) {
        this.changeDir(this.paths.getSelectedPathID(), eventData.relpath);
    },

    _dispatchLoadEvent: function(event) {
        if (this._dispatchLoadEventLock === true) {
            return;
        }
        this._dispatchLoadEventLock = true;
        var files = this.files.getSelected();
        if (files === null) {
            alert("No files selected");
            this._dispatchLoadEventLock = false;
            return;
        }
        var pathID = this.paths.getSelectedPathID();
        jQuery(this).trigger("browser:load_files", {pathID: pathID, files: files});
        this._dispatchLoadEventLock = false;
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
            self.curpath.render(self.paths.getLabel(pathID), relpath);
            self.directories.render(data.directories);
            self.files.render(data.files, function() {
                self.init();
                if (self._containerVisible === false) {
                    self.container.show();
                    self._containerVisible = true;
                }
                self.loader.hide();
            });
        }).fail(function(jqXHR, textStatus, errorThrown) {
            var msg = "An error occurred while loading '" + errorValue + "':\n" + textStatus;
            if (textStatus == "error") {
                msg += "\n" + errorThrown;
            }
            alert(msg);
            self.loader.hide();
        });
    },

    deinit: function() {
        this.directories.deinit();
        this.files.deinit();
    },

    init: function() {
        this.files.init();
    }
};
