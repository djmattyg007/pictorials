function AlbumImageSorter(container, albums, loader, notificationManager, templater, albumGetSortedFilesUrl, albumSaveSortedFilesUrl)
{
    this.container = container;
    this.sortContainer = container.find("[data-image-sorter-files]");
    this.albums = albums;
    this.loader = loader;
    this.notificationManager = notificationManager;
    this.templater = templater;
    this.albumGetSortedFilesUrl = albumGetSortedFilesUrl;
    this.albumSaveSortedFilesUrl = albumSaveSortedFilesUrl;

    this._alive = false;

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
            html = self.templater.render("album-image-sorter-row", files.slice(curPage * groupSize, curPage * groupSize + groupSize));
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
        this.loader.show(false);
        var files = this.sortContainer.sortable("toArray");
        var albumID = this.albums.getSelectedAlbumID();
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
        });
    },

    init: function() {
        if (this._alive === true) {
            return;
        }
        this.container.show();
        this.sortContainer.sortable({
            animation: 90,
            //handle: "[data-drag-handle]", can't use data attributes because it doesn't use element.matches()
            handle: ".drag-handle",
            draggable: "tr",
            dataIdAttr: "data-relpath"
        });
        this._alive = true;
    },

    deinit: function() {
        if (this._alive === false) {
            return;
        }
        this.sortContainer.sortable("destroy");
        this.sortContainer.empty();
        this.container.hide();
        this._alive = false;
    }
};
