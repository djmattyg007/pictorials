function FileMetadataEditor(modal, loader, modalManager, imageDownloaderFactory, autocompleteSearcherFactory, formSerializerFactory, notificationManager, downloadFormUrl, metadataUpdateUrl, autocompleteDataUrl)
{
    this.modal = modal;
    this.form = modal.find("form");
    this.formHeading = this.form.find("[data-form-heading]");
    this.formContainer = this.form.find("[data-form-container]");
    this.loader = loader;
    this.modalManager = modalManager;
    this.imageDownloaderFactory = imageDownloaderFactory;
    this.imageDownloader = null;
    this.autocompleteSearcherFactory = autocompleteSearcherFactory;
    this.formSerializer = formSerializerFactory.create(this.form);
    this.notificationManager = notificationManager;
    this.downloadFormUrl = downloadFormUrl;
    this.metadataUpdateUrl = metadataUpdateUrl;
    this.autocompleteDataUrl = autocompleteDataUrl;

    this.autocompleters = {};
    this.pathID = null;

    this.initEvents();
}

FileMetadataEditor.prototype = {
    initEvents: function() {
        var self = this;

        jQuery(document).on("pictorials:edit_file_metadata", function(event, eventData) {
            self.open(eventData.relpath);
        });

        this.modal.on("hidden.bs.modal", function() {
            self.form.find("input[name='author']").typeahead("destroy");
            self.form.find("input[name='location']").typeahead("destroy");
            self.form.find("select[name='people']").tagsinput("destroy");
            self.form.find("select[name='tags']").tagsinput("destroy");
            self.formContainer.empty();
        });

        this.form.on("submit", function(event) {
            event.preventDefault();
            var formData = self.formSerializer.getSerializedFormData();
            self.updateFile(formData);
        });

        jQuery(document).on("pictorials:path_changed", function() {
            self.pathID = null;
            self.autocompleters = {};
            if (self.imageDownloader) {
                self.imageDownloader.stop();
                self.imageDownloader.removeAllFiles();
                self.imageDownloader = null;
            }
        });
        jQuery(document).on("pictorials:path_chosen", function(event, eventData) {
            self.pathID = eventData.pathID;
            self.imageDownloader = self.imageDownloaderFactory.create(self.pathID, 1, self._imgLoad.bind(self), {size: "medium"});
            self.imageDownloader.start();
        });
    },

    _initAutocompleteData: function(callback) {
        var self = this;
        jQuery.ajax({
            "method": "POST",
            "data": {"path": this.pathID},
            "dataType": "json",
            "url": this.autocompleteDataUrl
        }).done(function(data) {
            self.autocompleters["author"] = self.autocompleteSearcherFactory.create(data["author"]);
            self.autocompleters["location"] = self.autocompleteSearcherFactory.create(data["location"]);
            self.autocompleters["people"] = self.autocompleteSearcherFactory.create(data["people"]);
            self.autocompleters["tags"] = self.autocompleteSearcherFactory.create(data["tags"]);
            if (callback) {
                callback();
            }
        }).fail(function() {
            // show a warning, maybe
        });
    },

    open: function(filename) {
        var self = this;
        this.loader.show(false);
        jQuery.ajax({
            "method": "POST",
            "data": {"path": this.pathID, "filename": filename},
            "dataType": "html",
            "url": this.downloadFormUrl
        }).done(function(formHtml) {
            self.formHeading.text("Metadata for " + filename.split("/").pop());
            self.formContainer.html(formHtml);
            self.loader.hide();
            self.modalManager.addModal(self.modal, function() {
                self.imageDownloader.addFile(filename);
                self._initForm();
            });
        }).fail(function() {
            self.loader.hide();
            self.notificationManager.displayError("Error", "Failed to retrieve file metadata form.");
        });
    },

    _imgLoad: function(filename, imgsrc) {
        this.modal.find("img[data-relpath='" + filename + "']").attr("src", imgsrc);
    },

    _initForm: function() {
        if (Object.keys(this.autocompleters).length === 0) {
            this._initAutocompleteData(this._initForm.bind(this));
            return;
        }
        var typeaheadConfig = function(fieldName) {
            return [{
                hint: true,
                highlight: true,
                minLength: 1
            }, {
                name: fieldName,
                source: this.autocompleters[fieldName],
                limit: 8
            }];
        }.bind(this);
        jQuery.fn.typeahead.apply(this.form.find("input[name='author']"), typeaheadConfig("author"));
        jQuery.fn.typeahead.apply(this.form.find("input[name='location']"), typeaheadConfig("location"));
        this.form.find("select[name='people']").tagsinput({
            trimValue: true,
            allowDuplicates: false,
            typeaheadjs: typeaheadConfig("people")
        });
        this.form.find("select[name='tags']").tagsinput({
            trimValue: true,
            allowDuplicates: false,
            typeaheadjs: typeaheadConfig("tags")
        });
    },

    _updateAutocompleteData: function(formData) {
        Object.keys(this.autocompleters).forEach(function(fieldName) {
            if (typeof formData[fieldName] === "string" && formData[fieldName].trim()) {
                this.autocompleters[fieldName].addNewItem(formData[fieldName].trim());
            }
        }.bind(this));
    },

    updateFile: function(formData) {
        formData["path"] = this.pathID;

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
            self._updateAutocompleteData(formData);
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
