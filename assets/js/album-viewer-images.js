function AlbumViewerImages(container, albums, loader, notificationManager, templater, thumbnailFlFactory, albumGetSortedFilesUrl)
{
    this.container = container;
    this.imagesContainer = container.find("[data-images-container]");
    this.albums = albums;
    this.loader = loader;
    this.notificationManager = notificationManager;
    this.templater = templater;
    this.thumbnailLoader = thumbnailFlFactory.create(4);
    this.albumGetSortedFilesUrl = albumGetSortedFilesUrl;

    this.lazyLoaderFactory = new window.LazyLoadFactory(this._imgInView.bind(this), 100, 900);
    this.lazyLoader = null;

    this._alive = false;

    this.initEvents();
}

AlbumViewerImages.prototype = {
    initEvents: function() {
        var self = this;

        jQuery(document).on("pictorials:album_changed", function() {
            self.deinit();
        });

        jQuery(document).on("pictorials:album_chosen", function() {
            self.open();
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
            self.notificationManager.displayError("Error", "There was a problem loading the images for the selected album. Please try again.");
        });
    },

    render: function(files, finish) {
        var curPage = 0;
        var html;
        var groupSize = 200;
        var totalPages = files.length / groupSize;
        var self = this;
        var iterFunc = function() {
            html = self.templater.render("album-image", files.slice(curPage * groupSize, curPage * groupSize + groupSize));
            self.imagesContainer.append(html);
            curPage++;
            if (curPage < totalPages) {
                setTimeout(iterFunc, 50);
            } else {
                finish();
            }
        };
        setTimeout(iterFunc, 40);
    },

    init: function() {
        if (this._alive === true) {
            return;
        }
        this.container.show();
        this.thumbnailLoader.start(this.albums.getPathID(this.albums.getSelectedAlbumID()), this._imgLoad.bind(this), {size: "small"});
        this.lazyLoader = this.lazyLoaderFactory.create(this.imagesContainer.find("img.album-thumb"));
        this._alive = true;
    },

    deinit: function() {
        if (this._alive === false) {
            return;
        }
        this.thumbnailLoader.stop();
        this.thumbnailLoader.removeAllFiles();
        this.lazyLoader.deinit();
        this.lazyLoader = null;
        this.imagesContainer.empty();
        this.container.hide();
        this._alive = false;
    },

    _imgInView: function(img) {
        this.thumbnailLoader.addFile(img.dataset.relpath);
    },

    _imgLoad: function(filename, imgsrc) {
        this.imagesContainer.find("img.album-thumb[data-relpath='" + filename + "']").attr("src", imgsrc);
    }
};
