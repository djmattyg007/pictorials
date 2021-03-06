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
        jQuery(document).on("pictorials:change_dir", this._changeDirEvent.bind(this));
        this.loadBtn.on("click", this._dispatchLoadEvent.bind(this));

        jQuery(document).on("pictorials:path_changed", function(event) {
            self.container.hide();
            self._containerVisible = false;
            self.deinit();
        });
        jQuery(document).on("pictorials:path_chosen", function(event, eventData) {
            self.changeDir(eventData.pathID);
        });

        jQuery(document).on("pictorials:browser_load_selected_files", function() {
            self._dispatchLoadEvent();
        });
        jQuery(document).on("pictorials:browser_add_selected_files_to_album", function() {
            jQuery(document).trigger("pictorials:add_files_to_album", { "pathID": self.paths.getSelectedPathID(), "files": self.files.getSelected() });
        });
        jQuery(document).on("pictorials:browser_share_selected_files", function() {
            jQuery(document).trigger("pictorials:share_files", { "pathID": self.paths.getSelectedPathID(), "files": self.files.getSelected() });
        });
    },

    registerWithKeyListener: function(keyListener) {
        // 76 = 'l'
        keyListener.register(76, this._dispatchLoadEvent.bind(this));
    },

    _changeDirEvent: function(event, eventData) {
        this.changeDir(this.paths.getSelectedPathID(), eventData.relpath);
    },

    _dispatchLoadEvent: function() {
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
        jQuery(document).trigger("pictorials:display_files", { "pathID": pathID, "files": files });
        this._dispatchLoadEventLock = false;
    },

    changeDir: function(pathID, relpath) {
        var prevDir = this.curpath.getCurrentPath();
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
            jQuery(document).trigger("pictorials:changing_dir_before", {prevDir: prevDir, newDir: relpath});
            self.deinit();
            self.curpath.update(self.paths.getLabel(pathID), relpath);
            self.directories.render(data.directories);
            self.files.render(data.files, function() {
                if (self._containerVisible === false) {
                    self.container.show();
                    self._containerVisible = true;
                }
                self.init();
                self.loader.hide(function() {
                    jQuery(document).trigger("pictorials:changing_dir_after", {prevDir: prevDir, newDir: relpath});
                });
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
