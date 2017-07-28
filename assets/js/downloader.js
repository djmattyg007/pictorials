function Downloader(flFactory, loader)
{
    this.flFactory = flFactory;
    this.loader = loader;

    this.initEvents();
}

Downloader.prototype = {
    initEvents: function() {
        var self = this;
        jQuery(document).on("pictorials:download_file", function(event, eventData) {
            self.downloadFile(eventData.pathID, eventData.relpath);
        });
    },

    downloadFile: function(pathID, file) {
        var fl = this.flFactory.create(pathID, [file], 1, this._downloadCallback);
        var self = this;
        jQuery(fl).on("pictorials:file_load_start", function() {
            self.loader.show();
        });
        jQuery(fl).on("pictorials:file_load_finish", function() {
            self.loader.hide();
        });
        fl.load(this._downloadCallback);
    },

    _downloadCallback: function(relpath, src) {
        var a = document.createElement("a");
        a.href = src;
        a.download = relpath.split("/").pop();
        document.body.appendChild(a);
        a.click();
        a.remove();
    }
};
