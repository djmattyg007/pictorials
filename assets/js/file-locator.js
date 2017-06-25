function FileLocator(shareString, userInputHandler)
{
    this.shareString = shareString;
    this.userInputHandler = userInputHandler;

    this.initEvents();
}

FileLocator.prototype = {
    initEvents: function() {
        var self = this;
        jQuery(document).on("click", "[data-file-locator-activate]", function() {
            self.runPrompt();
        });
    },

    runPrompt: function() {
        this.userInputHandler.showPrompt("Enter share ID", "text", this._handlePromptResponse.bind(this));
    },

    _handlePromptResponse: function(shareID) {
        shareID = shareID.trim();
        if (shareID === "") {
            return;
        }
        var self = this;
        this.shareString.decode(shareID, function(pathID, files) {
            jQuery(document).trigger("pictorials:display_files", {"pathID": pathID, "files": files});
        }, function(errorMsg) {
            self.userInputHandler.showError(errorMsg);
        });
    }
};
