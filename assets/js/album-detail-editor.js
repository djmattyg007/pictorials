function AlbumDetailEditor(albumDetailsContainer, albums, loader, templater, notificationManager, albumGetDetailsUrl, albumEditUrl)
{
    this.albumDetailsContainer = albumDetailsContainer;
    this.albums = albums;
    this.loader = loader;
    this.templater = templater;
    this.notificationManager = notificationManager;
    this.albumGetDetailsUrl = albumGetDetailsUrl;
    this.albumEditUrl = albumEditUrl;

    this.initEvents();
}

AlbumDetailEditor.prototype = {
    initEvents: function() {
        var self = this;

        jQuery(document).on("pictorials:album_changed", function() {
            self.albumDetailsContainer.empty();
        });

        jQuery(document).on("pictorials:album_chosen", function(event, eventData) {
            self.prepareEditForm(eventData.albumID);
        });

        jQuery(document).on("submit", "[data-album-edit-form]", function(event) {
            event.preventDefault();
            var formData = jQuery(this).serializeObject();
            self.updateAlbum(formData);
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
    },

    updateAlbum: function(formData) {
        var albumID = this.albums.getSelectedAlbumID();
        formData["album"] = albumID;
        if (formData["album_name"]) {
            // Naming form fields "name" is a bad idea with HTML/JS, so accommodate
            // an alternative field name.
            formData["name"] = formData["album_name"];
            delete formData["album_name"];
        }

        var self = this;
        this.loader.show(false);
        jQuery.ajax({
            "method": "POST",
            "data": formData,
            "dataType": "text",
            "url": this.albumEditUrl
        }).done(function() {
            self.loader.hide();
            self.notificationManager.displaySuccess("Success");
            jQuery(document).trigger("pictorials:album_updated", {"albumID": albumID});
            self.prepareEditForm(albumID);
        }).fail(function(jqXHR, textStatus, errorThrown) {
            msg = "An error occurred while updating the selected album";
            if (textStatus === "error") {
                msg += ":\n" + errorThrown;
            }
            msg += "\nPlease try again, or report the error to the owner";
            self.loader.hide();
            self.notificationManager.displayError("Error", msg);
        });
    }
};
