function Toolbox(container)
{
    this.container = container;
    this.toolbox = container.find("[role='menu']");
    this.toggleContainer = container.find("[data-toggle-container]");

    this.initEvents();
}

Toolbox.prototype = {
    initEvents: function() {
        var self = this;

        this.container.on("click", "[data-dismiss='toolbox']", function() {
            self.close();
        });
        this.container.on("click", "[data-open='toolbox']", function() {
            self.open();
        });
        this.container.on("click", "[data-toggle='toolbox']", function() {
            if (self.toolbox.is(":visible")) {
                self.close();
            } else {
                self.open();
            }
        });

        jQuery(this).on("shown.pictorials", function() {
            self.toggleContainer.hide();
        });
        jQuery(this).on("hidden.pictorials", function() {
            self.toggleContainer.show();
        });

        this.toolbox.on("click", "button[data-event]", function() {
            jQuery(document).trigger("pictorials:" + this.dataset.event);
        });

        jQuery(document).on("pictorials:path_changed", function() {
            self.container.hide();
        });
        jQuery(document).on("pictorials:path_chosen", function() {
            self.container.show();
        });
        jQuery(document).on("pictorials:selection_changed", function(event, eventData) {
            self.toolbox.find("[data-toolbox-selected-count]").text(eventData.selectedCount);
            self.toolbox.find("[data-toolbox-selected-only]").prop("disabled", eventData.selectedCount === 0);
        });
    },

    open: function() {
        this.toolbox.show();
        this.container.find("[data-toggle='toolbox']").attr("aria-expanded", "true");
        jQuery(this).trigger("shown.pictorials");
    },

    close: function() {
        this.toolbox.hide();
        this.container.find("[data-toggle='toolbox']").attr("aria-expanded", "false");
        jQuery(this).trigger("hidden.pictorials");
    }
};
