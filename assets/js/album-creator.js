function AlbumCreator(userInputHandler, notificationManager, loader, paths, albumCreateUrl)
{
    this.userInputHandler = userInputHandler;
    this.notificationManager = notificationManager;
    this.loader = loader;
    this.albumCreateUrl = albumCreateUrl;

    this.options = [{"value": "", "text": ""}];
    Object.keys(paths).forEach(function(pathID) {
        this.options.push({
            "value": pathID,
            "text": paths[pathID]
        });
    }.bind(this));

    this.initEvents();
}

AlbumCreator.prototype = {
    initEvents: function() {
        var self = this;
        jQuery(document).on("click", "[data-album-creator-activate]", function() {
            self.runCreatePrompt();
        });
    },

    runCreatePrompt: function() {
        var self = this;
        this.userInputHandler.showOptionsPrompt("Select a path", "select", this.options, function(pathID) {
            self.userInputHandler.showPrompt("Enter album name", "text", self._handleCreatePromptResponse.bind(self, pathID));
        });
    },

    _handleCreatePromptResponse: function(pathID, albumName) {
        albumName = albumName.trim();
        if (albumName === "") {
            return;
        }
        var self = this;
        this.loader.show(false);
        jQuery.ajax({
            "method": "POST",
            "data": {"path": pathID, "name": albumName},
            "dataType": "text",
            "url": this.albumCreateUrl
        }).done(function(albumID) {
            self.loader.hide();
            self.notificationManager.displaySuccess("Success", "Your album was successfully created");
            jQuery(document).trigger("pictorials:album_created", {albumID: parseInt(albumID)})
        }).fail(function(jqXHR, textStatus, errorThrown) {
            msg = "An error occurred while attempting to create your album";
            if (textStatus === "error") {
                msg += ":\n" + errorThrown;
            }
            msg += "\nPlease report this to the owner";
            self.loader.hide();
            self.userInputHandler.showError(msg);
        });
    }
};
