function AlbumGallery(albums, loader, notificationManager, imageFlFactory, concurrencyManagerFactory, albumGetSortedFilesUrl)
{
    this.albums = albums;
    this.loader = loader;
    this.notificationManager = notificationManager;
    this.imageFactory = imageFlFactory;
    this.concurrencyManager = concurrencyManagerFactory.create(3);
    this.albumGetSortedFilesUrl = albumGetSortedFilesUrl;

    this.openCount = 0;
    this._alive = false;

    this.initEvents();
}

AlbumGallery.prototype = {
    initEvents: function() {
        var self = this;

        jQuery(document).on("click", "[data-gallery-activate]", function() {
            self.open();
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
            window.hmmmm = result;
            var bigSize;
            if (jQuery(window).height() > 950) {
                bigSize = "xlarge";
            } else {
                bigSize = "large";
            }
            window.beep = window.hmmmm.map(function(el) { return {"image": el.relpath + "?large", "thumb": el.relpath + "?small", "big": el.relpath + "?" + bigSize}; });
        }).fail(function(jqXHR, textStatus, errorThrown) {
            self.loader.hide();
            self.notificationManager.displayError("Error", "There was a problem loading the images for the selected album. Please try again.");
        });
    }
};
