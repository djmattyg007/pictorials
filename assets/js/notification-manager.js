PNotify.prototype.options.addclass = "stack-bottomright";
PNotify.prototype.options.styling = "fontawesome";
PNotify.prototype.options.title_escape = true;
PNotify.prototype.options.text_escape = true;

function NotificationManager()
{
    this.stack = {"dir1": "left", "dir2": "up", "push": "top"};
}

NotificationManager.prototype = {
    _displayNotification: function(type, title, msg) {
        var options = {
            "stack": this.stack,
            "title": title,
            "type": type
        };
        if (msg) {
            options["msg"] = msg;
        }
        new PNotify(options);
    },

    displaySuccess: function(title, msg) {
        this._displayNotification("success", title, msg);
    },

    displayInfo: function(title, msg) {
        this._displayNotification("info", title, msg);
    },

    displayNotice: function(title, msg) {
        this._displayNotification("notice", title, msg);
    },

    displayError: function(title, msg) {
        this._displayNotification("error", title, msg);
    }
};
