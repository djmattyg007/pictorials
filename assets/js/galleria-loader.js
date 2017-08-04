window.galleriaLoaderInit = function(albums, imageDownloaderFactory, dummyImage) {
    var imageDownloader = null;
    var currentPath = null;
    jQuery(document).on("pictorials:album_changed", function() {
        currentPath = null;
        if (imageDownloader) {
            imageDownloader.stop();
            imageDownloader.removeAllFiles();
            imageDownloader = null;
        }
    });
    jQuery(document).on("pictorials:album_chosen", function(event, eventData) {
        currentPath = albums.getPathID(eventData.albumID);
        imageDownloader = imageDownloaderFactory.create(currentPath, 3);
        imageDownloader.start();
    });

    var origPreload = Galleria.Picture.prototype.preload;
    var origLoad = Galleria.Picture.prototype.load;

    Galleria.Picture.prototype.preload = function(src) {
        if (this.cache[src]) {
            return;
        }
        if (!currentPath) {
            return;
        }
        var self = this;
        imageDownloader.addFile(src, function(filename, dataSrc) {
            self.cache[src] = dataSrc;
        });
    };

    Galleria.Picture.prototype.load = function(src, size, callback) {
        if (!currentPath) {
            return;
        }
        if (typeof size === "function") {
            callback = size;
            size = null;
        }

        if (this.cache[src]) {
            var wrapperCallback = function(picture) {
                delete picture.cache[picture.cache[src]];
                if (typeof callback === "function") {
                    callback.call(picture, picture);
                }
            };
            origLoad.call(this, this.cache[src], size, wrapperCallback);
        } else {
            var self = this;
            imageDownloader.addFile(src, function(filename, dataSrc) {
                var wrapperCallback = function(picture) {
                    delete picture.cache[dataSrc];
                    picture.cache[src] = dataSrc;
                    if (typeof callback === "function") {
                        callback.call(picture, picture);
                    }
                };
                origLoad.call(self, dataSrc, size, wrapperCallback);
            });
        }

        return this.container;
    };

    Galleria.configure({
        dummy: dummyImage,
        height: 0.5625, // 16 by 9
        imageCrop: false,
        imageTimeout: 60000,
        layerFollow: false,
        slideshowInterval: 5000,
        theme: "classicmod",
        transition: "fade"
    });
};
