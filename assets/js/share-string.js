function ShareString(receiveUrl, submitUrl)
{
    this.receiveUrl = receiveUrl;
    this.submitUrl = submitUrl;
}

ShareString.prototype = {
    decode: function(shareID, successCallback, errorCallback) {
        jQuery.ajax({
            "method": "POST",
            "data": {"shareID": shareID},
            "dataType": "json",
            "url": this.receiveUrl
        }).done(function(result) {
            successCallback(result.path, result.files);
        }).fail(function(jqXHR, textStatus, errorThrown) {
            var msg = "An error occurred while looking up your share ID";
            if (textStatus == "error") {
                msg += ":\n" + errorThrown;
            }
            msg += "\nPlease report this to the owner";
            errorCallback(msg);
        });
    },

    encode: function(pathID, files, successCallback, errorCallback) {
        jQuery.ajax({
            "method": "POST",
            "data": {"path": pathID, "files": files},
            "dataType": "text",
            "url": this.submitUrl
        }).done(function(shareID) {
            successCallback(shareID);
        }).fail(function(jqXHR, textStatus, errorThrown) {
            var msg = "An error occurred while encoding the share ID for your selected files";
            if (textStatus == "error") {
                msg += ":\n" + errorThrown;
            }
            msg += "\nPlease report this to the owner"
            errorCallback(msg);
        });
    }
};
