function FileViewer(modal, loader, templater, fileDownloader, concurrencyLimit, flFactory)
{
    this.modal = modal;
    this.carousel = modal.find("[data-modal-carousel]");
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
            self.carousel.slick({dots: true, dotsClass: "slick-dots list-inline"});
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

    addImageToCarousel: function(fl, relpath, src) {
        var html = this.templater.render("carousel-file", {"src": src, "relpath": relpath, "filename": relpath.split(/[\\/]/).pop()});
        this.carousel.append(html);
        this.loader.updateProgress(fl.processedCount / fl.fileCount);
    }
};
