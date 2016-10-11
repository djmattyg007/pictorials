function Paths(container)
{
    this.select = container.find("select");

    this.initEvents();
}

Paths.prototype = {
    initEvents: function() {
        var self = this;
        this.select.on("change", function(event) {
            jQuery(document).trigger("pictorials:path_changed");
            var curPathID = self.getSelectedPathID();
            if (curPathID == null) {
                return;
            }
            jQuery(document).trigger("pictorials:path_chosen", {pathID: curPathID});
        });
    },

    getSelectedPathID: function() {
        var val = this.select.val().trim();
        if (val === "") {
            return null;
        }
        var pathID = parseInt(val);
        if (isNaN(pathID)) {
            return null;
        }
        return pathID;
    },

    getLabel: function(pathID) {
        return this.select.find("option[value=" + pathID + "]").text();
    }
};
