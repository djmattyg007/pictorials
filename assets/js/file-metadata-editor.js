function FileMetadataEditor(modal, paths, loader, modalManager, imageDownloaderFactory, notificationManager, downloadFormUrl, metadataUpdateUrl)
{
    this.modal = modal;
    this.form = modal.find("form");
    this.formHeading = this.form.find("[data-form-heading]");
    this.formContainer = this.form.find("[data-form-container]");
    this.paths = paths;
    this.loader = loader;
    this.modalManager = modalManager;
    this.imageDownloaderFactory = imageDownloaderFactory;
    this.imageDownloader = null;
    this.notificationManager = notificationManager;
    this.downloadFormUrl = downloadFormUrl;
    this.metadataUpdateUrl = metadataUpdateUrl;

    this.initEvents();
}

FileMetadataEditor.prototype = {
    initEvents: function() {
        var self = this;

        jQuery(document).on("pictorials:edit_file_metadata", function(event, eventData) {
            self.open(eventData.relpath);
        });

        this.modal.on("hidden.bs.modal", function() {
            self.formContainer.empty();
        });

        this.form.on("submit", function(event) {
            event.preventDefault();
            var formData = jQuery(this).serializeObject();
            self.updateFile(formData);
        });

        jQuery(document).on("pictorials:path_changed", function() {
            if (self.imageDownloader) {
                self.imageDownloader.stop();
                self.imageDownloader.removeAllFiles();
                self.imageDownloader = null;
            }
        });
        jQuery(document).on("pictorials:path_chosen", function(event, eventData) {
            var currentPath = self.paths.getSelectedPathID();
            self.imageDownloader = self.imageDownloaderFactory.create(currentPath, 1, self._imgLoad.bind(self), {size: "medium"});
            self.imageDownloader.start();
        });
    },

    open: function(filename) {
        var self = this;
        this.loader.show(false);
        jQuery.ajax({
            "method": "POST",
            "data": {"path": this.paths.getSelectedPathID(), "filename": filename},
            "dataType": "html",
            "url": this.downloadFormUrl
        }).done(function(formHtml) {
            self.formHeading.text("Metadata for " + filename.split("/").pop());
            self.formContainer.html(formHtml);
            self.loader.hide();
            self.modalManager.addModal(self.modal, function() {
                self.imageDownloader.addFile(filename);
            });
        }).fail(function() {
            self.loader.hide();
            self.notificationManager.displayError("Error", "Failed to retrieve file metadata form.");
        });
    },

    _imgLoad: function(filename, imgsrc) {
        this.modal.find("img[data-relpath='" + filename + "']").attr("src", imgsrc);
    },

    updateFile: function(formData) {
        formData["path"] = this.paths.getSelectedPathID();

        var self = this;
        this.loader.show(false);
        jQuery.ajax({
            "method": "POST",
            "data": formData,
            "dataType": "text",
            "url": this.metadataUpdateUrl
        }).done(function() {
            self.loader.hide(function() {
                self.modal.modal("hide");
            });
            self.notificationManager.displaySuccess("Success");
        }).fail(function(jqXHR, textStatus, errorThrown) {
            msg = "An error occurred while updating the selected file";
            if (textStatus === "error") {
                msg += ":\n" + errorThrown;
            }
            msg += "\nPlease try again, or report the error to the owner";
            self.loader.hide();
            self.notificationManager.displayError("Error", msg);
        });
    }
};
