function BootboxWrapper(bootbox, modalManager, escaper)
{
    this.bootbox = bootbox;
    this.modalManager = modalManager;
    this.escaper = escaper;

    this.initEvents();
}

BootboxWrapper.prototype = {
    initEvents: function() {
        var self = this;
        jQuery(document).on("click", "[data-bootboxwrapper-copy-btn]", function() {
            var input = document.getElementById(this.dataset.bootboxwrapperCopyBtn);
            input.focus();
            input.setSelectionRange(0, input.value.length);
            var result = document.execCommand("copy");
        });
    },

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

    /**
     * @param {String} message
     * @param {String} text
     */
    showCopyBox: function(message, text) {
        var self = this;
        var inputID = "pic-copybox-" + Math.random();
        var escapedMessage = this.escaper.escapeHTML(message);
        var escapedValue = this.escaper.escapeHTML(text);
        var html = '<p>' + escapedMessage + '</p><div class="input-group">';
        html += '<input type="text" id="' + inputID + '" class="form-control" readonly value="' + escapedValue + '">';
        html += '<span class="input-group-btn"><button type="button" class="btn btn-default" data-bootboxwrapper-copy-btn="' + inputID + '">Copy</button></span>';
        html += '</div>';
        this._showAlert(html, function() {
            var input = document.getElementById(inputID);
            input.focus();
            input.setSelectionRange(0, input.value.length);
        });
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
