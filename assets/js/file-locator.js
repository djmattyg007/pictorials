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
        this.userInputHandler.showPrompt("Enter share string", "text", this._handlePromptResponse.bind(this));
    },

    _handlePromptResponse: function(base64Value) {
        var fileInfo;
        try {
            fileInfo = this.shareString.decodeBase64(base64Value.trim());
        } catch (e) {
            this.userInputHandler.showError(e.message);
            return;
        }
        jQuery(document).trigger("pictorials:display_files", fileInfo);
    }
};
