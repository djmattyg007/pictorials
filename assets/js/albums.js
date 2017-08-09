function Albums(container, notificationManager, albumGetDetailsUrl)
{
    this.container = container;
    this.notificationManager = notificationManager;
    this.albumGetDetailsUrl = albumGetDetailsUrl;

    this.__curAlbumID = null;
    this.initEvents();
    this._loadAlbums();
}

Albums.prototype = {
    initEvents: function() {
        var self = this;

        this.container.on("change", "select", function(event) {
            jQuery(document).trigger("pictorials:album_changed");
            var oldPathID = self.__curAlbumID === null ? null : self.getPathID(self.__curAlbumID);
            self.__curAlbumID = self.getSelectedAlbumID();
            if (self.__curAlbumID == null) {
                jQuery(document).trigger("pictorials:path_changed");
                return;
            }
            var newPathID = self.getPathID(self.__curAlbumID);
            if (newPathID != oldPathID) {
                jQuery(document).trigger("pictorials:path_changed");
            }

            jQuery(document).trigger("pictorials:album_chosen", {albumID: self.__curAlbumID});
            if (newPathID != oldPathID) {
                jQuery(document).trigger("pictorials:path_chosen", {pathID: newPathID});
            }
        });

        jQuery(document).on("pictorials:album_created", function() {
            self._loadAlbums();
        });
        jQuery(document).on("pictorials:album_updated", function() {
            self._loadAlbums();
        });
        jQuery(document).on("pictorials:album_deleted", function() {
            self._loadAlbums();
        });
    },

    _loadAlbums: function() {
        var $select = this.container.find("select");
        $select.prop("disabled", true);
        var selectedItem = $select.val();

        jQuery.ajax({
            "method": "GET",
            "dataType": "json",
            "url": this.albumGetDetailsUrl
        }).done(function(result) {
            var fragment = document.createDocumentFragment();
            fragment.appendChild(document.createElement("option"));
            result.forEach(function(album) {
                var opt = document.createElement("option");
                opt.textContent = album.name;
                opt.value = album.id;
                opt.dataset.path = album.path_id;
                fragment.appendChild(opt);
            });
            $select.html(jQuery(fragment));
            $select.val(selectedItem);
        }).fail(function(jqXHR, textStatus, errorThrown) {
            msg = "An error occurred while fetching the list of albums";
            if (textStatus === "error") {
                msg += ":\n" + errorThrown;
            }
            msg += "\nPlease refresh the page";
            self.notificationManager.displayError("Error", msg);
        }).always(function() {
            $select.prop("disabled", false);
        });
    },

    getSelectedAlbumID: function() {
        var val = this.container.find("select").val().trim();
        if (val === "") {
            return null;
        }
        var albumID = parseInt(val);
        if (isNaN(albumID)) {
            return null;
        }
        return albumID;
    },

    getLabel: function(albumID) {
        return this.container.find("select option[value=" + albumID + "]").text();
    },

    getPathID: function(albumID) {
        return this.container.find("select option[value=" + albumID + "]").data("path");
    }
};
