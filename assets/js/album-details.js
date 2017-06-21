function AlbumCreator(userInputHandler, paths, albumCreateUrl)
{
    this.userInputHandler = userInputHandler;
    this.albumCreateUrl = albumCreateUrl;

    this.options = [];
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
        this.userInputHandler.showOptionsPrompt("Select path", "select", this.options, function(pathID) {
            self.userInputHandler.showPrompt("Enter album name", "text", self._handleCreatePromptResponse.bind(self, pathID));
        });
    },

    _handleCreatePromptResponse: function(pathID, albumName) {
        var self = this;
        jQuery.ajax({
            "method": "POST",
            "data": {"path": pathID, "name": albumName},
            "dataType": "text",
            "url": this.albumCreateUrl
        }).done(function(albumID) {
            self.userInputHandler.showSuccess("Your album was successfully created");
            jQuery(document).trigger("pictorials:album_created", {albumID: parseInt(albumID)})
        }).fail(function(jqXHR, textStatus, errorThrown) {
            msg = "An error occurred while attempting to create your album";
            if (textStatus === "error") {
                msg += ":\n" + errorThrown;
            }
            msg += "\nPlease report this to the owner";
            self.userInputHandler.showError(msg);
        });
    }
};
