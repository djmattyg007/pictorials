function AlbumDetailEditor(albumDetailsContainer, loader, templater, notificationManager, albumGetDetailsUrl)
{
    this.albumDetailsContainer = albumDetailsContainer;
    this.loader = loader;
    this.templater = templater;
    this.notificationManager = notificationManager;
    this.albumGetDetailsUrl = albumGetDetailsUrl;

    this.initEvents();
}

AlbumDetailEditor.prototype = {
    initEvents: function() {
        var self = this;
        jQuery(document).on("pictorials:album_chosen", function(event, eventData) {
            self.prepareEditForm(eventData.albumID);
        });
    },

    prepareEditForm: function(albumID) {
        var self = this;
        this.loader.show(false);
        jQuery.ajax({
            "method": "POST",
            "data": {"album": albumID},
            "dataType": "json",
            "url": this.albumGetDetailsUrl
        }).done(function(result) {
            var formHtml = self.templater.render("album-edit-form", result);
            self.albumDetailsContainer.html(formHtml);
            self.loader.hide();
        }).fail(function(jqXHR, textStatus, errorThrown) {
            msg = "An error occurred while fetching details about the selected album";
            if (textStatus === "error") {
                msg += ":\n" + errorThrown;
            }
            msg += "\nPlease select a different album, or refresh the page and try again";
            self.loader.hide();
            self.notificationManager.displayError("Error", msg);
        });
    }
};
