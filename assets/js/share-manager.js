function ShareManager(shareString, userInputHandler, clipboardHandler)
{
    this.shareString = shareString;
    this.userInputHandler = userInputHandler;
    this.clipboardHandler = clipboardHandler;

    this.initEvents();
}

ShareManager.prototype = {
    initEvents: function() {
        var self = this;
        jQuery(document).on("pictorials:share_files", function(event, eventData) {
            self.activate(eventData.pathID, eventData.files);
        });
        jQuery(document).on("pictorials:share_file", function(event, eventData) {
            self.activate(eventData.pathID, [eventData.relpath]);
        });
    },

    activate: function(pathID, files) {
        var self = this;
        this.shareString.encode(pathID, files, function(shareID) {
            var check = self.clipboardHandler.copy(shareID);
            if (check) {
                self._handleCopySuccess();
            } else {
                self._handleCopyFailure(shareID);
            }
        }, function(errorMsg) {
            self.userInputHandler.showError(errorMsg);
        });
    },

    _handleCopySuccess: function() {
        this.userInputHandler.showSuccess('The share ID was successfully copied to your clipboard.');
    },

    _handleCopyFailure: function(shareID) {
        this.userInputHandler.showCopyBox("Copy the share ID and send it to your friends", shareID);
    }
};
