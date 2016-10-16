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
    },

    activate: function(pathID, files) {
        var toShare = this.shareString.encodeBase64(pathID, files);
        var check = this.clipboardHandler.copy(toShare);
        if (check) {
            this._handleShareSuccess();
        } else {
            this._handleShareFailure(toShare);
        }
    },

    _handleShareSuccess: function() {
        this.userInputHandler.showSuccess('The share ID was successfully copied to your clipboard.');
    },

    _handleShareFailure: function(toShare) {
        var inputId = "pic-share-copy-" + Math.random();
        var message = '<p>Copy the share ID and send it to your friend</p><input type="text" id="' + inputId + '" class="form-control" readonly value="' + toShare + '">';
        this.userInputHandler.showMessage(message, function() {
            var input = document.getElementById(inputId);
            input.focus();
            input.setSelectionRange(0, input.value.length);
        });
    }
};
