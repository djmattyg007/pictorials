function AlbumImageSorter(container, albums, loader, userInputHandler, notificationManager, templater, thumbnailFlFactory, albumGetSortedFilesUrl, albumSaveSortedFilesUrl)
{
    this.container = container;
    this.sortContainer = container.find("[data-image-sorter-files]");
    this.albums = albums;
    this.loader = loader;
    this.userInputHandler = userInputHandler;
    this.notificationManager = notificationManager;
    this.templater = templater;
    this.thumbnailLoader = thumbnailFlFactory.create(4);
    this.albumGetSortedFilesUrl = albumGetSortedFilesUrl;
    this.albumSaveSortedFilesUrl = albumSaveSortedFilesUrl;

    this.lazyLoaderFactory = new window.LazyLoadFactory(this._imgInView.bind(this), 100, 900);
    this.lazyLoader = null;

    this._alive = false;
    this._warnDelete = false;

    this.initEvents();
}

AlbumImageSorter.prototype = {
    initEvents: function() {
        var self = this;

        jQuery(document).on("click", "[data-album-sortimages-activate]", function() {
            self.open();
        });

        jQuery(document).on("pictorials:album_changed", function() {
            self.deinit();
        });

        jQuery(document).on("click", "[data-album-image-sorter-save]", function() {
            self.save();
        });

        jQuery(document).on("click", "[data-album-image-sorter-close]", function() {
            self.deinit();
        });

        jQuery(document).on("click", "[data-album-file-remove]", function(event) {
            jQuery(this).closest("[data-album-image]").remove();
            self._warnDelete = true;
            if (this.tagName === "A") {
                event.preventDefault();
                return false;
            }
        });
    },

    open: function() {
        if (this._alive === true) {
            return;
        }
        var albumID = this.albums.getSelectedAlbumID();
        var self = this;
        this.loader.show(false);
        jQuery.ajax({
            "method": "POST",
            "data": {"album": albumID},
            "dataType": "json",
            "url": this.albumGetSortedFilesUrl
        }).done(function(result) {
            if (result.length) {
                self.render(result, function() {
                    self.init();
                    self.loader.hide();
                });
            } else {
                self.loader.hide();
                self.notificationManager.displayNotice("No Images", "There are no images associated with this album.");
            }
        }).fail(function(jqXHR, textStatus, errorThrown) {
            self.loader.hide();
            self.notificationManager.displayError("Error", "There was a problem loading the files for the selected album. Please try again.");
        });
    },

    render: function(files, finish) {
        var curPage = 0;
        var html;
        var groupSize = 200;
        var totalPages = files.length / groupSize;
        var self = this;
        var iterFunc = function() {
            html = self.templater.render("album-image-sorter-block", files.slice(curPage * groupSize, curPage * groupSize + groupSize));
            self.sortContainer.append(html);
            curPage++;
            if (curPage < totalPages) {
                setTimeout(iterFunc, 50);
            } else {
                finish();
            }
        };
        setTimeout(iterFunc, 40);
    },

    save: function() {
        if (this._alive === false) {
            return;
        }
        if (this._warnDelete === true) {
            var self = this;
            this.userInputHandler.showConfirmPrompt("You're about to remove some images from this album. Are you sure?", true, function(result) {
                if (result === true) {
                    self._save();
                }
            });
        } else {
            this._save();
        }
    },

    _save: function() {
        this.loader.show(false);
        var files = this.sortContainer.sortable("toArray");
        var albumID = this.albums.getSelectedAlbumID();
        var self = this;
        jQuery.ajax({
            "method": "POST",
            "data": {"album": albumID, "files": files},
            "dataType": "text",
            "url": this.albumSaveSortedFilesUrl
        }).done(function() {
            self.loader.hide();
            self.notificationManager.displaySuccess("Success", "Your changes were saved successfully.");
        }).fail(function(jqXHR, textStatus, errorThrown) {
            self.loader.hide();
            self.notificationManager.displayError("Error", "Something went wrong while saving your changes. Please try again.");
        }).always(function() {
            self._warnDelete = false;
        });
    },

    init: function() {
        if (this._alive === true) {
            return;
        }
        this.container.show();
        this.thumbnailLoader.start(this.albums.getPathID(this.albums.getSelectedAlbumID()), this._imgLoad.bind(this), {size: "small"});
        this.sortContainer.sortable({
            aimation: 80,
            draggable: ".album-thumb-container",
            dataIdAttr: "data-relpath"
        });
        this.lazyLoader = this.lazyLoaderFactory.create(this.sortContainer.find("img.album-thumb"));
        this._alive = true;
        this._warnDelete = false;
    },

    deinit: function() {
        if (this._alive === false) {
            return;
        }
        this.thumbnailLoader.stop();
        this.thumbnailLoader.removeAllFiles();
        this.sortContainer.sortable("destroy");
        this.lazyLoader.deinit();
        this.lazyLoader = null;
        this.sortContainer.empty();
        this.container.hide();
        this._alive = false;
        this._warnDelete = false;
    },

    _imgInView: function(img) {
        this.thumbnailLoader.addFile(img.dataset.relpath);
    },

    _imgLoad: function(filename, imgsrc) {
        this.sortContainer.find("img.album-thumb[data-relpath='" + filename + "']").attr("src", imgsrc);
    }
};
