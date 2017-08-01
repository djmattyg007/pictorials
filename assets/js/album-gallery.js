function AlbumGallery(container, albums, loader, notificationManager, albumGetSortedFilesUrl)
{
    this.container = container;
    this.galleryContainer = container.find("[data-gallery-container]");
    this.albums = albums;
    this.loader = loader;
    this.notificationManager = notificationManager;
    this.albumGetSortedFilesUrl = albumGetSortedFilesUrl;

    this._alive = false;
    this.galleria = null;
    this.galleryData = null;

    this.initEvents();
}

AlbumGallery.prototype = {
    initEvents: function() {
        var self = this;

        jQuery(document).on("pictorials:album_changed", function() {
            self.close();
        });

        jQuery(document).on("pictorials:album_chosen", function() {
            self.open();
        });

        jQuery(document).on("click", "[data-gallery-fullscreen-activate]", function() {
            if (self.galleria) {
                self.galleria.enterFullscreen();
            } else {
                self.notificationManager.displayNotice("Gallery", "There is no gallery active. Cannot enter fullscreen.");
            }
        });
    },

    open: function() {
        if (this._alive === true) {
            return;
        }
        this._alive = true;
        var albumID = this.albums.getSelectedAlbumID();
        var self = this;
        this.loader.show(false);
        jQuery.ajax({
            "method": "POST",
            "data": {"album": albumID},
            "dataType": "json",
            "url": this.albumGetSortedFilesUrl
        }).done(function(result) {
            self.loader.hide();
            var galleryData = self._prepareGalleryData(result);
            self._startGalleria(galleryData);
        }).fail(function(jqXHR, textStatus, errorThrown) {
            self.loader.hide();
            self.notificationManager.displayError("Error", "There was a problem loading the images for the selected album. Please try again.");
        });
    },

    close: function() {
        if (this._alive === false) {
            return;
        }
        this._alive = false;
        this.galleria.destroy();
        this.galleria = null;
        this.container.hide();
        this.galleryData = null;
    },

    _prepareGalleryData(imageData) {
        var bigSize = jQuery(window).height() > 950 ? "xlarge" : "large";
        return imageData.map(function(image) {
            return {
                "image": image.relpath + "?large",
                "thumb": image.relpath + "?small",
                "big": image.relpath + "?" + bigSize
            };
        });
    },

    _startGalleria: function(galleryData) {
        this.container.show();
        this.galleryData = galleryData;
        this.galleryContainer.galleria({"dataSource": galleryData.slice(0, 10)});
        this.galleria = this.galleryContainer.data("galleria");

        var curPage = 1;
        var groupSize = 10;
        var totalPages = galleryData.length / groupSize;
        var self = this;
        var moreLoad = function() {
            if (self.galleria === null) {
                return;
            }
            var images = galleryData.slice(curPage * groupSize, curPage * groupSize + groupSize);
            self.galleria.push(images);
            curPage++;
            if (curPage < totalPages) {
                setTimeout(moreLoad, curPage <= 3 ? 2500 : 4000);
            }
        };
        setTimeout(moreLoad, 3000);
    }
};
