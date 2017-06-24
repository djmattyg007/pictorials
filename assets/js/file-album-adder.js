function FileAlbumAdder(paths, loader, userInputHandler, notificationManager, albumGetDetailsUrl, albumFileAddUrl)
{
    this.paths = paths;
    this.loader = loader;
    this.userInputHandler = userInputHandler;
    this.notificationManager = notificationManager;
    this.albumGetDetailsUrl = albumGetDetailsUrl;
    this.albumFileAddUrl = albumFileAddUrl;

    this.initEvents();
}

FileAlbumAdder.prototype = {
    initEvents: function() {
        var self = this;
        
        jQuery(document).on("pictorials:add_files_to_album", function(event, eventData) {
            self.activate(eventData.pathID, eventData.files);
        });
    },

    activate: function(pathID, files) {
        var self = this;
        this.loader.show(false);
        jQuery.ajax({
            "method": "POST",
            "data": {"path": pathID},
            "dataType": "json",
            "url": this.albumGetDetailsUrl
        }).done(function(result) {
            self.loader.hide();
            if (Object.keys(result).length === 0) {
                self.userInputHandler.showError("There are no albums associated with the current path.");
            } else {
                self.userInputHandler.showOptionsPrompt("Select an album", "select", result, function(albumID) {
                    self.addFilesToAlbum(albumID, files);
                });
            }
        }).fail(function(jqXHR, textStatus, errorThrown) {
            self.loader.hide();
            self.notificationManager.displayError("Error", "Failed to load the list of albums for the current path. Please try again.");
        });
    },

    addFilesToAlbum: function(albumID, files) {
        var self = this;
        this.loader.show(false);
        jQuery.ajax({
            "method": "POST",
            "data": {"album": albumID, "files": files},
            "dataType": "text",
            "url": this.albumFileAddUrl
        }).done(function(result) {
            self.loader.hide();
            if (parseInt(result) === 1) {
                self.notificationManager.displaySuccess("Success", "1 file added.");
            } else {
                self.notificationManager.displaySuccess("Success", result + " files added.");
            }
        }).fail(function(jqXHR, textStatus, errorThrown) {
            self.loader.hide();
            self.notificationManager.displayError("Error", "Please try again.");
        });
    }
};
