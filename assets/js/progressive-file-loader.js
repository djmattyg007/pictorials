function ProgressiveFileLoaderFactory(notificationManager, downloadUrl, concurrencyManagerFactory)
{
    this.notificationManager = notificationManager;
    this.downloadUrl = downloadUrl;
    this.concurrencyManagerFactory = concurrencyManagerFactory;
}

ProgressiveFileLoaderFactory.prototype = {
    create: function(pathID, concurrencyLimit, defaultLoadCallback, extraRequestData) {
        var concurrencyManager = this.concurrencyManagerFactory.create(concurrencyLimit);
        return new ProgressiveFileLoader(pathID, defaultLoadCallback, extraRequestData, this.notificationManager, this.downloadUrl, concurrencyManager);
    }
};

function ProgressiveFileLoader(pathID, defaultLoadCallback, extraRequestData, notificationManager, downloadUrl, concurrencyManager)
{
    this.pathID = pathID;
    this.notificationManager = notificationManager;
    this.downloadUrl = downloadUrl;
    this.concurrencyManager = concurrencyManager;

    this.openCount = 0;
    this.files = [];
    this.defaultLoadCallback = defaultLoadCallback || null;
    this.extraRequestData = extraRequestData || {};
    this.running = false;
    this.timer = null;
}

ProgressiveFileLoader.prototype = {
    start: function() {
        if (this.running === true) {
            return;
        }
        this.running = true;
        this.timer = setTimeout(this._eventLoop.bind(this), 150);
    },

    stop: function() {
        if (this.running === false) {
            return;
        }
        clearTimeout(this.timer);
        this.running = false;
    },

    _eventLoop: function() {
        if (this.files.length && this.openCount < this.concurrencyManager.getCLimit() && this.running === true) {
            this.openCount++;
            var file = this.files.shift();
            this._download(file["filename"], file["callback"]);
        }
        this.timer = setTimeout(this._eventLoop.bind(this), 150);
    },

    _download: function(filename, callback) {
        var self = this;
        var size = null;
        if (filename.indexOf("?") > 0) {
            var filenameSplit = filename.split("?");
            filename = filenameSplit[0];
            size = filenameSplit[1];
        }
        if (!callback) {
            callback = this.defaultLoadCallback;
        }
        jQuery.ajax({
            method: "POST",
            data: jQuery.extend({path: this.pathID, filename: filename, size: size}, this.extraRequestData),
            dataType: "native",
            url: this.downloadUrl,
            xhrFields: {
                responseType: "blob"
            }
        }).done(function(data) {
            if (self.running === false) {
                return;
            }
            callback(filename, window.URL.createObjectURL(data));
        }).fail(function(jqXHR, textStatus, errorThrown) {
            var msg = "An error occurred while loading '" + filename + "':\n" + textStatus;
            if (textStatus === "error") {
                msg += "\n" + errorThrown;
            } else if (textStatus === "parsererror") {
                msg += "\n" + errorThrown;
            }
            self.notificationManager.displayError("Error", msg);
        }).always(function() {
            self.openCount--;
        });
    },

    addFile: function(filename, callback) {
        this.files.push({"filename": filename, "callback": callback});
    },

    removeAllFiles: function() {
        this.files = [];
    }
};
