function FileViewer(modal, loader, templater, modalManager, fileDownloader, fileMap, concurrencyLimit, flFactory)
{
    this.modal = modal;
    this.carousel = modal.find("[data-modal-carousel]");
    this.carouselDots = modal.find("[data-modal-carousel-dots]");
    this.details = modal.find("[data-modal-image-details]");
    // TOOD: re-work download, share, edit buttons to use generic action system.
    // There's a bunch of logic that doesn't need to be in here, and the only
    // thing the file viewer actually needs to do is pass along the current relpath.
    this.downloadBtn = modal.find("[data-modal-download-btn]");
    this.shareBtn = modal.find("[data-modal-share-btn]");
    this.editMetadataBtn = modal.find("[data-modal-editmetadata-btn]");
    this.rotateBtns = modal.find("[data-modal-rotate-btn]");
    this.loader = loader;
    this.templater = templater;
    this.modalManager = modalManager;
    this.fileDownloader = fileDownloader;
    this.fileMap = fileMap;
    this.concurrencyLimit = concurrencyLimit;
    this.flFactory = flFactory;

    this._viewerActive = false;
    this._currentPathID = null;

    this.initEvents();
}

FileViewer.prototype = {
    initEvents: function() {
        var self = this;
        jQuery(document).on("pictorials:display_files", function(event, eventData) {
            self.loadFiles(eventData.pathID, eventData.files);
        });
        this.downloadBtn.on("click", function() {
            var file = self.getCurrentCarouselSlide().find("img").data("relpath");
            self.fileDownloader.downloadFile(self._currentPathID, file);
        });
        this.shareBtn.on("click", function() {
            var file = self.getCurrentCarouselSlide().find("img").data("relpath");
            jQuery(document).trigger("pictorials:share_files", { "pathID": self._currentPathID, "files": [file] });
        });
        this.editMetadataBtn.on("click", function() {
            var relpath = self.getCurrentCarouselSlide().find("img").data("relpath");
            jQuery(document).trigger("pictorials:edit_file_metadata", {relpath: relpath});
        });
        this.modal.on("shown.bs.modal", function() {
            self.carousel.slick({appendDots: self.carouselDots, dots: true, dotsClass: "slick-dots list-inline"});
            self.modal.modal("handleUpdate");
            self._viewerActive = true;
        });
        this.modal.on("hide.bs.modal", function() {
            self.carousel.slick("unslick");
            self._viewerActive = false;
            self._currentPathID = null;
        });
        this.rotateBtns.on("click", function() {
            self.rotateCurrentCarouselImage(this.dataset["rotateDirection"]);
        });
        this.carousel.on("init reInit afterChange", function() {
            // Without the short delay, there is a weird issue when slick is first initialised that breaks it completely.
            setTimeout(self._showCurrentImageDetails.bind(self), 50);
        });
        this.carousel.on("beforeChange", function() {
            self.details.find("[data-metadata-container-trigger]").popover("destroy");
        });
        this.details.on("click", "[data-metadata-container-trigger]", function() {
            var $this = jQuery(this);
            if (!$this.data("content")) {
                $this.data("content", self._getCurrentMetadataList.bind(self));
            }
            $this.popover("toggle");
        });
        this.details.on("click", "[data-map-display-trigger]", function() {
            var curImage = self.getCurrentCarouselSlide().find("img");
            var coords = curImage.data("gps");
            self.fileMap.activateMap([coords.lat, coords.lon]);
        });
        this.details.on("hidden.bs.popover", "[data-metadata-container-trigger]", function() {
            // I can't find any reliable way to determine the current state of the popover through
            // the programmatic API, so instead we'll just destroy the popover object every time.
            jQuery(this).popover("destroy");
        });
    },

    registerWithKeyListener: function(keyListener) {
        // 37 = Left arrow
        keyListener.register(37, this._prevSlideTriggerEvent.bind(this));
        // 39 = Right arrow
        keyListener.register(39, this._nextSlideTriggerEvent.bind(this));
    },

    _prevSlideTriggerEvent: function(event) {
        if (this.isActive()) {
            this.carousel.slick("slickPrev");
        }
    },

    _nextSlideTriggerEvent: function(event) {
        if (this.isActive()) {
            this.carousel.slick("slickNext");
        }
    },

    isActive: function() {
        return this._viewerActive;
    },

    loadFiles: function(pathID, files) {
        this._currentPathID = pathID;
        var fl = this.flFactory.create(pathID, files, this.concurrencyLimit);
        var self = this;
        jQuery(fl).on("pictorials:file_load_start", function() {
            self.loader.show(true);
        });
        jQuery(fl).on("pictorials:file_load_finish", function() {
            self.loader.hide();
            if (self.carousel.html().trim() !== "") {
                self.modalManager.addModal(self.modal);
            } else {
                alert("No images to show");
            }
        });
        this.carousel.empty();
        fl.load(this.addImageToCarousel.bind(this, fl));
    },

    getCurrentCarouselSlide: function() {
        var curSlide = this.carousel.slick("slickCurrentSlide");
        return this.carousel.find("[data-slick-index='" + curSlide + "']");
    },

    rotateCurrentCarouselImage: function(direction) {
        var curImage = this.getCurrentCarouselSlide().find("img");
        var rotation = curImage.data("current-rotation");
        var tempRotation = (rotation ? rotation : 0);
        // Javascript doesn't have an actual modulo operator
        if (direction === "left") {
            tempRotation = tempRotation - 90;
        } else {
            tempRotation = tempRotation + 90;
        }
        rotation = ((tempRotation % 360) + (tempRotation < 0 ? 360 : 0));
        curImage.data("current-rotation", rotation);
        curImage.css("transform", "rotate(" + rotation + "deg)");
    },

    addImageToCarousel: function(fl, relpath, src, metadata, gps) {
        var templateData = {"src": src, "relpath": relpath, "filename": relpath.split(/[\\/]/).pop(), "date_taken": "", "metadata": "", "gps": ""};
        if (metadata) {
            if (typeof metadata["date_taken"] !== "undefined" && metadata["date_taken"]) {
                templateData["date_taken"] = metadata["date_taken"];
                delete metadata["date_taken"];
            }
            if (metadata && jQuery.isEmptyObject(metadata) === false) {
                templateData["metadata"] = JSON.stringify(metadata);
            }
        }
        if (gps && this.fileMap.isAvailable()) {
            templateData["gps"] = JSON.stringify(gps);
        }
        var html = this.templater.render("carousel-file", templateData);
        this.carousel.append(html);
        this.loader.updateProgress(fl.processedCount / fl.fileCount);
    },

    _showCurrentImageDetails: function() {
        var curImage = this.getCurrentCarouselSlide().find("img");
        var dateTaken = curImage.data("date-taken");
        var metadata = curImage.data("metadata");
        var metadataListHTML = "";
        if (metadata) {
            metadataListHTML = this.templater.render("file-metadata-list", metadata);
        }
        var gps = null;
        if (this.fileMap.isAvailable()) {
            gps = curImage.data("gps");
        }
        this.details.html(this.templater.render("carousel-file-details", { "date_taken": dateTaken, "metadata": metadataListHTML, "gps": (gps ? true : false) }));
    },

    _getCurrentMetadataList: function() {
        return jQuery("[data-metadata-container]").html();
    }
};
