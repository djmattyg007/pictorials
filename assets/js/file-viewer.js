function FileViewer(modal, loader, templater, fileDownloader, concurrencyLimit, flFactory)
{
    this.modal = modal;
    this.carousel = modal.find("[data-modal-carousel]");
    this.carouselDots = modal.find("[data-modal-carousel-dots]");
    this.details = modal.find("[data-modal-image-details]");
    this.downloadBtn = modal.find("[data-modal-download-btn]");
    this.rotateBtns = modal.find("[data-modal-rotate-btn]");
    this.loader = loader;
    this.templater = templater;
    this.fileDownloader = fileDownloader;
    this.concurrencyLimit = concurrencyLimit;
    this.flFactory = flFactory;

    this._viewerActive = false;
    this._currentPathID = null;

    this.initEvents();
}

FileViewer.prototype = {
    initEvents: function() {
        var self = this;
        this.downloadBtn.on("click", function(event) {
            var file = self.getCurrentCarouselSlide().children().data("relpath");
            self.fileDownloader.downloadFile(self._currentPathID, file);
        });
        this.modal.on("shown.bs.modal", function() {
            self.carousel.slick({appendDots: self.carouselDots, dots: true, dotsClass: "slick-dots list-inline"});
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
            self.modal.modal("show");
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

    addImageToCarousel: function(fl, relpath, src, metadata) {
        var templateData = {"src": src, "relpath": relpath, "filename": relpath.split(/[\\/]/).pop(), "date_taken": "", "metadata": ""};
        if (metadata) {
            if (typeof metadata["date_taken"] !== "undefined" && metadata["date_taken"]) {
                templateData["date_taken"] = metadata["date_taken"];
                delete metadata["date_taken"];
            }
            if (metadata.length) {
                templateData["metadata"] = JSON.stringify(metadata);
            }
        }
        var html = this.templater.render("carousel-file", templateData);
        this.carousel.append(html);
        this.loader.updateProgress(fl.processedCount / fl.fileCount);
    },

    _showCurrentImageDetails: function() {
        var curImage = this.getCurrentCarouselSlide().find("img");
        var dateTaken = curImage.data("date-taken");
        if (dateTaken) {
            this.details.html("<b>Date Taken:</b> " + dateTaken);
        } else {
            this.details.html("<b>Date Taken:</b> unknown");
        }
    }
};
