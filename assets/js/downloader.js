function Downloader(flFactory, loader)
{
    this.flFactory = flFactory;
    this.loader = loader;
}

Downloader.prototype = {
    downloadFile: function(pathID, file) {
        this.download(pathID, [file]);
    },

    download: function(pathID, files) {
        var fl = this.flFactory.create(pathID, files);
        var self = this;
        jQuery(fl).on("file_loader:start_load", function() {
            self.loader.show();
        });
        jQuery(fl).on("file_loader:finish_load", function() {
            self.loader.hide();
        });
        fl.load(this._downloadCallback);
    },

    _downloadCallback: function(relpath, src) {
        var a = document.createElement("a");
        a.href = src;
        a.download = relpath.split(/[\\/]/).pop();
        document.body.appendChild(a);
        a.click();
        a.remove();
    }
};
