function FileLoaderFactory(download_url, sysload_url)
{
    this.download_url = download_url;
    this.sysload_url = sysload_url;
}

FileLoaderFactory.prototype = {
    create: function(pathID, files, concurrency_limit) {
        var fl;
        if (concurrency_limit) {
            fl = new FileLoader(pathID, files, this.download_url, concurrency_limit, this.sysload_url);
        } else {
            fl = new FileLoader(pathID, files, this.download_url);
        }
        return fl;
    }
};

function FileLoader(pathID, files, download_url, concurrency_limit, sysload_url)
{
    this.pathID = pathID;
    this.files = files;
    this.download_url = download_url;

    this.open_count = 0;
    this.orig_concurrency_limit = (!isNaN(parseInt(concurrency_limit)) && concurrency_limit > 2 ? concurrency_limit : 2);
    this.concurrency_limit = this.orig_concurrency_limit;
    this.sysload_url = sysload_url;

    this.file_count = this.files.length;
    this.processed_count = 0;
}

FileLoader.prototype = {
    load: function(loadCallback, errorCallback) {
        if (!errorCallback) {
            errorCallback = alert;
        }
        jQuery(this).trigger("file_loader:start_load");
        var self = this;
        if (this.sysload_url) {
            this._checkSysload();
        }
        jQuery.each(this.files, function(index, value) {
            var waitFunc = function() {
                if (self.open_count >= self.concurrency_limit) {
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
        self.open_count++;
        jQuery.ajax({
            method: "POST",
            data: {path: this.pathID, "filename": value},
            dataType: "native",
            url: this.download_url,
            xhrFields: {
                responseType: "blob"
            }
        }).done(function(data) {
            loadCallback(value, window.URL.createObjectURL(data));
        }).fail(function(jq, textStatus, errorThrown) {
            var msg = "An error occurred while loading '" + value + "':\n" + textStatus;
            if (textStatus == "error") {
                msg += "\n" + errorThrown;
            }
            errorCallback(msg);
        }).always(function() {
            self.open_count--;
            self.processed_count++;
            if (self.processed_count === self.file_count) {
                jQuery(self).trigger("file_loader:finish_load");
            }
        });
    },

    _checkSysload: function() {
        var self = this;
        jQuery.ajax(this.sysload_url).done(function(data) {
            if (isNaN(parseInt(data))) {
                // Assume an error occurred, and automatically scale back the concurrency.
                self.concurrency_limit = self.orig_concurrency_limit - 1;
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
            if (self.processed_count < self.file_count) {
                setTimeout(self._checkSysload.bind(self), 15 * 1000);
            }
        });
    }
};
