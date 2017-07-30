function FileLoaderFactory(notificationManager, downloadUrl, concurrencyManagerFactory)
{
    this.notificationManager = notificationManager;
    this.downloadUrl = downloadUrl;
    this.concurrencyManagerFactory = concurrencyManagerFactory;
}

FileLoaderFactory.prototype = {
    create: function(pathID, files, concurrencyLimit, loadCallback, errorCallback) {
        var concurrencyManager = this.concurrencyManagerFactory.create(concurrencyLimit);
        return new FileLoader(pathID, files, this.notificationManager, this.downloadUrl, concurrencyManager, loadCallback, errorCallback);
    }
};

function FileLoader(pathID, files, notificationManager, downloadUrl, concurrencyManager, loadCallback, errorCallback)
{
    this.pathID = pathID;
    this.files = files;
    this.notificationManager = notificationManager;
    this.downloadUrl = downloadUrl;
    this.concurrencyManager = concurrencyManager;
    this.loadCallback = loadCallback;
    this.errorCallback = errorCallback || this._defaultLoadErrorCallback.bind(this);

    this.openCount = 0;
    this.fileCount = this.files.length;
    this.startedCount = 0;
    this.processedCount = 0;
}
FileLoader.prototype = {
    load: function() {
        if (this.processedCount !== 0) {
            // This situation shouldn't ever occur, so just use an alert.
            alert("File loader is already in use");
            return;
        }
        jQuery(this).trigger("pictorials:file_load_start");

        setTimeout(this._eventLoop.bind(this), 100);
    },

    _eventLoop: function() {
        if (this.startedCount < this.fileCount && this.openCount < this.concurrencyManager.getCLimit()) {
            this.openCount++;
            var file = this.files[this.startedCount];
            this.startedCount++;
            this._download(file);
        }
        if (this.startedCount < this.fileCount) {
            setTimeout(this._eventLoop.bind(this), 50);
        }
    },

    _download: function(filename) {
        var self = this;
        jQuery.ajax({
            "method": "POST",
            "data": {"path": this.pathID, "filename": filename},
            "dataType": "native",
            "url": this.downloadUrl,
            "xhrFields": {
                responseType: "blob"
            }
        }).done(function(data, textStatus, jqXHR) {
            var metadataString = jqXHR.getResponseHeader("X-Pictorials-Pic-Metadata");
            var metadata = (metadataString ? JSON.parse(metadataString) : null);
            var gpsString = jqXHR.getResponseHeader("X-Pictorials-Pic-GPS");
            var gps = (gpsString ? JSON.parse(gpsString) : null);
            self.loadCallback(
                filename,
                window.URL.createObjectURL(data),
                {
                    "metadata": metadata,
                    "gps": gps
                }
            );
        }).fail(function(jqXHR, textStatus, errorThrown) {
            var msg = "An error occurred while loading '" + filename;
            if (textStatus == "error") {
                msg += ":\n" + errorThrown;
            }
            msg += "\nPlease report this to the owner"
            this.errorCallback(msg, filename);
        }).always(function() {
            self.openCount--;
            self.processedCount++;
            if (self.processedCount === self.fileCount) {
                jQuery(self).trigger("pictorials:file_load_finish");
            }
        });
    },

    _defaultLoadErrorCallback: function(msg, filename) {
        this.notificationManager.displayError("Error", msg);
    }
};
