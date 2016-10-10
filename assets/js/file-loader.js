function FileLoaderFactory(downloadUrl, sysloadUrl)
{
    this.downloadUrl = downloadUrl;
    this.sysloadUrl = sysloadUrl;
}

FileLoaderFactory.prototype = {
    create: function(pathID, files, concurrencyLimit) {
        var fl;
        if (concurrencyLimit) {
            fl = new FileLoader(pathID, files, this.downloadUrl, concurrencyLimit, this.sysloadUrl);
        } else {
            fl = new FileLoader(pathID, files, this.downloadUrl);
        }
        return fl;
    }
};

function FileLoader(pathID, files, downloadUrl, concurrency_limit, sysloadUrl)
{
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

FileLoader.prototype = {
    load: function(loadCallback, errorCallback) {
        if (!errorCallback) {
            errorCallback = alert;
        }
        jQuery(this).trigger("file_loader:start_load");
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
            method: "POST",
            data: {path: this.pathID, "filename": value},
            dataType: "native",
            url: this.downloadUrl,
            xhrFields: {
                responseType: "blob"
            }
        }).done(function(data, textStatus, jqXHR) {
            var metadataString = jqXHR.getResponseHeader("X-Pictorials-Pic-Metadata");
            var metadata = (metadataString ? JSON.parse(metadataString) : null);
            var gpsString = jqXHR.getResponseHeader("X-Pictorials-Pic-GPS");
            var gps = (gpsString ? JSON.parse(gpsString) : null);
            loadCallback(value, window.URL.createObjectURL(data), metadata, gps);
        }).fail(function(jqXHR, textStatus, errorThrown) {
            var msg = "An error occurred while loading '" + value + "':\n" + textStatus;
            if (textStatus == "error") {
                msg += "\n" + errorThrown;
            }
            msg += "\n" + "Please report this to the owner."
            errorCallback(msg);
        }).always(function() {
            self.openCount--;
            self.processedCount++;
            if (self.processedCount === self.fileCount) {
                jQuery(self).trigger("file_loader:finish_load");
            }
        });
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
