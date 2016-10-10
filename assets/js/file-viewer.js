function FileViewer(modal, loader, templater, modalManager, fileDownloader, fileMap, concurrencyLimit, flFactory)
{
    this.modal = modal;
    this.carousel = modal.find("[data-modal-carousel]");
    this.carouselDots = modal.find("[data-modal-carousel-dots]");
    this.details = modal.find("[data-modal-image-details]");
    this.downloadBtn = modal.find("[data-modal-download-btn]");
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
        this.downloadBtn.on("click", function() {
            var file = self.getCurrentCarouselSlide().children().data("relpath");
            self.fileDownloader.downloadFile(self._currentPathID, file);
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

    loadFiles: function(event, eventData) {
        this._currentPathID = eventData.pathID;
        var fl = this.flFactory.create(eventData.pathID, eventData.files, this.concurrencyLimit);
        var self = this;
        jQuery(fl).on("file_loader:start_load", function() {
            self.loader.show(true);
        });
        jQuery(fl).on("file_loader:finish_load", function() {
            self.loader.hide();
            self.modalManager.addModal(self.modal);
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
        if (gps && this.fileMap) {
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
        if (this.fileMap) {
            gps = curImage.data("gps");
        }
        this.details.html(this.templater.render("carousel-file-details", { "date_taken": dateTaken, "metadata": metadataListHTML, "gps": (gps ? true : false) }));
    },

    _getCurrentMetadataList: function() {
        return jQuery("[data-metadata-container]").html();
    }
};
