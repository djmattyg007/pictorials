function CancellableFileLoaderFactory(downloadUrl, sysloadUrl)
{
    this.downloadUrl = downloadUrl;
    this.sysloadUrl = sysloadUrl;
}

CancellableFileLoaderFactory.prototype = {
    create: function(concurrencyLimit) {
        var cfl;
        if (concurrencyLimit) {
            cfl = new CancellableFileLoader(this.downloadUrl, concurrencyLimit, this.sysloadUrl);
        } else {
            cfl = new CancellableFileLoader(this.downloadUrl);
        }
        return cfl;
    }
};

function CancellableFileLoader(downloadUrl, concurrencyLimit, sysloadUrl)
{
    this.downloadUrl = downloadUrl;

    this.openCount = 0;
    this.origConcurrencyLimit = (!isNaN(parseInt(concurrencyLimit)) && concurrencyLimit > 2 ? concurrencyLimit : 2);
    this.concurrencyLimit = this.origConcurrencyLimit;
    this.sysloadUrl = sysloadUrl;

    this.files = [];
    this.pathID = null;
    this.loadCallback = null;
    this.running = false;
    this.timer = null;
    this.sysloadTimer = null;
}

CancellableFileLoader.prototype = {
    start: function(pathID, loadCallback) {
        if (this.running === true) {
            return;
        }
        this.pathID = pathID;
        this.loadCallback = loadCallback;
        this.running = true;
        if (this.sysloadUrl) {
            this._checkSysload();
        }
        this.timer = setTimeout(this._eventLoop.bind(this), 150);
    },

    stop: function() {
        if (this.running === false) {
            return;
        }
        clearTimeout(this.timer);
        clearTimeout(this.sysloadTimer);
        this.running = false;
        this.pathID = null;
        this.loadCallback = null;
    },

    _eventLoop: function() {
        if (this.openCount < this.concurrencyLimit && this.files.length) {
            this.openCount++;
            this._download(this.files.shift());
        }
        this.timer = setTimeout(this._eventLoop.bind(this), 150);
    },

    _download: function(filename) {
        var self = this;
        jQuery.ajax({
            method: "POST",
            data: {path: this.pathID, "filename": filename},
            dataType: "native",
            url: this.downloadUrl,
            xhrFields: {
                responseType: "blob"
            }
        }).done(function(data) {
            if (self.running === false) {
                // This could mean the path was changed, which is why it's important that
                // we don't attempt to do anything.
                return;
            }
            self.loadCallback(filename, window.URL.createObjectURL(data));
        }).fail(function(jqXHR, textStatus, errorThrown) {
            var msg = "An error occurred while loading '" + filename + "':\n" + textStatus;
            if (textStatus == "error") {
                msg += "\n" + errorThrown;
            }
            alert(msg);
        }).always(function() {
            self.openCount--;
        });
    },

    addFile: function(file) {
        this.files.push(file);
    },

    removeAllFiles: function() {
        this.files = [];
    },

    _checkSysload: function() {
        // TODO: Centralise ajax call
        var self = this;
        jQuery.ajax(this.sysloadUrl).done(function(data) {
            if (isNaN(parseInt(data))) {
                // Assume an error occurred, and automatically scale back the concurrency.
                self.concurrencyLimit = self.origConcurrencyLimit - 1;
            }
            if (data == "2") {
                self.concurrencyLimit = self.origConcurrencyLimit;
            } else if (data == "1") {
                self.concurrencyLimit = Math.max(2, self.origConcurrencyLimit - 1);
            } else {
                if (self.origConcurrencyLimit === 2) {
                    self.concurrencyLimit = 1;
                } else {
                    self.concurrencyLimit = self.origConcurrencyLimit - 2;
                }
            }
        }).always(function() {
            if (self.running === true) {
                self.sysloadTimer = setTimeout(self._checkSysload.bind(self), 15 * 1000);
            }
        });
    }
};
