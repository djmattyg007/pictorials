function AlbumDetailEditor(albumDetailsContainer, albums, loader, templater, userInputHandler, notificationManager, albumGetDetailsUrl, albumEditUrl, albumDeleteUrl)
{
    this.albumDetailsContainer = albumDetailsContainer;
    this.albums = albums;
    this.loader = loader;
    this.templater = templater;
    this.userInputHandler = userInputHandler;
    this.notificationManager = notificationManager;
    this.albumGetDetailsUrl = albumGetDetailsUrl;
    this.albumEditUrl = albumEditUrl;
    this.albumDeleteUrl = albumDeleteUrl;

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

        jQuery(document).on("click", "[data-album-delete-activate]", function() {
            self.deleteCurrentAlbum();
        });

        jQuery(document).on("change", "[data-album-edit-form]", function(event) {
            jQuery(this).find("button[type='submit']").prop("disabled", false);
        });

        jQuery(document).on("submit", "[data-album-edit-form]", function(event) {
            event.preventDefault();
            var formData = jQuery(this).serializeObject();
            self.updateCurrentAlbum(formData);
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

    updateCurrentAlbum: function(formData) {
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
    },

    deleteCurrentAlbum: function() {
        var self = this;
        this.userInputHandler.showConfirmPrompt("Are you sure?", false, function(result) {
            if (result !== true) {
                return;
            }
            self.userInputHandler.showConfirmPrompt("Seriously, are you sure? This action is irreversible!", false, function(result) {
                if (result !== true) {
                    return;
                }
                self._deleteCurrentAlbum();
            });
        });
    },

    _deleteCurrentAlbum: function() {
        var albumID = this.albums.getSelectedAlbumID();

        this.loader.show(false);
        jQuery.ajax({
            "method": "POST",
            "data": {"album": albumID},
            "dataType": "text",
            "url": this.albumDeleteUrl
        }).done(function() {
            self.loader.hide();
            self.notificationManager.displaySuccess("Success", "The album '" + self.albums.getLabel(albumID) + "' was successfully deleted.");
            jQuery(document).trigger("pictorials:album_deleted", {"album": albumID});
            jQuery(document).trigger("pictorials:album_changed");
        }).fail(function(jqXHR, textStatus, errorThrown) {
            msg = "An error occurred while deleting the selected album";
            if (textStatus === "error") {
                msg += ":\n" + errorThrown;
            }
            msg += "\nPlease try again, or report the error to the owner";
            self.loader.hide();
            self.notificationManager.displayError("Error", msg);
        });
    }
};
