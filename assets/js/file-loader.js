function FileLoaderFactory(notificationManager, downloadUrl, sysloadUrl)
{
    this.notificationManager = notificationManager;
    this.downloadUrl = downloadUrl;
    this.sysloadUrl = sysloadUrl;
}
function FileLoaderFactory2(notificationManager, downloadUrl, concurrencyManagerFactory)
{
    this.notificationManager = notificationManager;
    this.downloadUrl = downloadUrl;
    this.concurrencyManagerFactory = concurrencyManagerFactory;
}

FileLoaderFactory.prototype = {
    create: function(pathID, files, concurrencyLimit) {
        var fl;
        if (concurrencyLimit) {
            fl = new FileLoader(this.notificationManager, pathID, files, this.downloadUrl, concurrencyLimit, this.sysloadUrl);
        } else {
            fl = new FileLoader(this.notificationManager, pathID, files, this.downloadUrl);
        }
        return fl;
    }
};
FileLoaderFactory2.prototype = {
    create: function(pathID, files, concurrencyLimit, loadCallback, errorCallback) {
        var concurrencyManager = this.concurrencyManagerFactory.create(concurrencyLimit);
        return new FileLoader2(pathID, files, this.notificationManager, this.downloadUrl, concurrencyManager, loadCallback, errorCallback);
    }
};

function FileLoader(notificationManager, pathID, files, downloadUrl, concurrency_limit, sysloadUrl)
{
    this.notificationManager = notificationManager;
    this.pathID = pathID;
    this.files = files;
    this.downloadUrl = downloadUrl;

    this.openCount = 0;
    this.orig_concurrency_limit = (!isNaN(parseInt(concurrency_limit)) && concurrency_limit > 2 ? concurrency_limit : 2);
    this.concurrency_limit = this.orig_concurrency_limit;
    this.sysloadUrl = sysloadUrl;

    this.fileCount = this.files.length;
    this.processedCount = 0;
}
function FileLoader2(pathID, files, notificationManager, downloadUrl, concurrencyManager, loadCallback, errorCallback)
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
FileLoader2.prototype = {
    load: function(loadCallback, errorCallback) { // Move these to constructor
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
            var msg = "An error occurred while loading '" + value;
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

    _defaultLoadErrorCallback: function(msg, value) {
        this.notificationManager.displayError("Error", msg);
    }
};
FileLoader.prototype = {
    load: function(loadCallback, errorCallback) {
        if (!errorCallback) {
            errorCallback = this._defaultLoadErrorCallback.bind(this);
        }
        jQuery(this).trigger("pictorials:file_load_start");
        var self = this;
        if (this.sysloadUrl) {
            this._checkSysload();
        }
        // TODO: Optimise to not have a billion timeouts happening at once
        // Also should be able to use Array.prototype.forEach
        jQuery.each(this.files, function(index, value) {
            var waitFunc = function() {
                if (self.openCount >= self.concurrency_limit) {
                    setTimeout(waitFunc, 200);
                } else {
                    self._load(loadCallback, errorCallback, value);
                }
            };
            waitFunc();
        });
    },

    _load: function(loadCallback, errorCallback, value) {
        var self = this;
        self.openCount++;
        jQuery.ajax({
            "method": "POST",
            "data": {"path": this.pathID, "filename": value},
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
            loadCallback(value, window.URL.createObjectURL(data), metadata, gps);
        }).fail(function(jqXHR, textStatus, errorThrown) {
            var msg = "An error occurred while loading '" + value;
            if (textStatus == "error") {
                msg += ":\n" + errorThrown;
            }
            msg += "\nPlease report this to the owner"
            errorCallback(msg, value);
        }).always(function() {
            self.openCount--;
            self.processedCount++;
            if (self.processedCount === self.fileCount) {
                jQuery(self).trigger("pictorials:file_load_finish");
            }
        });
    },

    _defaultLoadErrorCallback: function(msg, value) {
        this.notificationManager.displayError("Error", msg);
    },

    _checkSysload: function() {
        var self = this;
        jQuery.ajax(this.sysloadUrl).done(function(data) {
            if (isNaN(parseInt(data))) {
                // Assume an error occurred, and automatically scale back the concurrency.
                self.concurrency_limit = self.orig_concurrency_limit - 1;
                return;
            }
            if (data == "2") {
                self.concurrency_limit = self.orig_concurrency_limit;
            } else if (data == "1") {
                self.concurrency_limit = Math.max(2, self.orig_concurrency_limit - 1);
            } else {
                if (self.orig_concurrency_limit === 2) {
                    self.concurrency_limit = 1;
                } else {
                    self.concurrency_limit = self.orig_concurrency_limit - 2;
                }
            }
        }).always(function() {
            if (self.processedCount < self.fileCount) {
                setTimeout(self._checkSysload.bind(self), 15 * 1000);
            }
        });
    }
};
