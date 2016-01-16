function Paths(container)
{
    this.select = container.find("select");
    this.button = container.find("button[type='button']");

    this.initEvents();
}

Paths.prototype = {
    initEvents: function() {
        var self = this;
        this.button.on("click", function(event) {
            var curPathID = self.getSelectedPathID();
            if (curPathID == null) {
                alert("No path selected.");
                return;
            }
            jQuery(self).trigger("paths:path_chosen", {pathID: curPathID});
        });
        this.select.on("change", function(event) {
            jQuery(self).trigger("paths:path_changed");
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
