function BootboxWrapper(bootbox, modalManager)
{
    this.bootbox = bootbox;
    this.modalManager = modalManager;
}

BootboxWrapper.prototype = {
    _showAlert: function(message, afterShowCallback) {
        var bAlert = this.bootbox.alert({
            "message": message,
            "backdrop": true,
            "closeButton": false,
            "show": false
        });
        this.modalManager.addModal(bAlert, afterShowCallback);
    },

    showSuccess: function(message) {
        this._showAlert('<div class="pictorials-alert alert-success" role="alert">' + message.replace(/\n/g, '<br>') + '</div>');
    },

    showError: function(message) {
        this._showAlert('<div class="pictorials-alert alert-danger" role="alert">' + message.replace(/\n/g, '<br>') + '</div>');
    },

    showMessage: function(message, afterShowCallback) {
        this._showAlert(message, afterShowCallback);
    },

    showPrompt: function(title, inputType, userCallback, ignoreCancel) {
        if (typeof ignoreCancel === "undefined") {
            ignoreCancel = true;
        }
        var self = this;
        var bPrompt = this.bootbox.prompt({
            "title": title,
            "inputType": inputType,
            "callback": function(value) {
                if (ignoreCancel === true && value === null) {
                    return true;
                }
                self.modalManager.safeHide(bPrompt, function() {
                    userCallback(value);
                });
                return false;
            },
            "show": false
        });
        this.modalManager.addModal(bPrompt);
    },

    showConfirmPrompt: function(message, goodPrompt, userCallback, ignoreCancel) {
        if (typeof ignoreCancel === "undefined") {
            ignoreCancel = true;
        }
        var self = this;
        var bPrompt = this.bootbox.confirm({
            "message": message,
            "buttons": {
                "confirm": {
                    "className": goodPrompt === true ? "btn-primary" : "btn-danger"
                }
            },
            "callback": function(result) {
                if (ignoreCancel === true && result === false) {
                    return true;
                }
                self.modalManager.safeHide(bPrompt, function() {
                    userCallback(result);
                });
                return false;
            },
            "show": false
        });
        this.modalManager.addModal(bPrompt);
    },

    showOptionsPrompt: function(title, inputType, inputOptions, userCallback, ignoreCancel) {
        if (typeof ignoreCancel === "undefined") {
            ignoreCancel = true;
        }
        var actualInputOptions;
        if (Array.isArray(inputOptions)) {
            actualInputOptions = inputOptions;
        } else {
            actualInputOptions = [];
            Object.keys(inputOptions).forEach(function(key) {
                actualInputOptions.push({
                    "value": key,
                    "text": inputOptions[key]
                });
            });
        }
        var self = this;
        var bPrompt = this.bootbox.prompt({
            "title": title,
            "inputType": inputType,
            "inputOptions": actualInputOptions,
            "callback": function(value) {
                if (ignoreCancel === true && value === null) {
                    return true;
                }
                self.modalManager.safeHide(bPrompt, function() {
                    userCallback(value);
                });
                return false;
            },
            "show": false
        });
        this.modalManager.addModal(bPrompt);
    }
};
