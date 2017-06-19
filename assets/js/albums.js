function Albums(container)
{
    this.select = container.find("select");

    this.initEvents();
}

Albums.prototype = {
    initEvents: function() {
        var self = this;
        this.select.on("change", function(event) {
            jQuery(document).trigger("pictorials:album_changed");
            var curAlbumID = self.getSelectedAlbumID();
            if (curAlbumID == null) {
                return;
            }
            jQuery(document).trigger("pictorials:album_chosen", {albumID: curAlbumID});
        });
    },

    getSelectedAlbumID: function() {
        var val = this.select.val().trim();
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
        return this.select.find("option[value=" + albumID + "]").text();
    }
};
