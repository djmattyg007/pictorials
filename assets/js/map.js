(function(root, L, $) {
    "use strict";

    /**
     * @param {jQuery} modal
     * @param {ModalManager} modalManager
     */
    function Map(modal, modalManager)
    {
        this.modal = modal;
        this.mapContainer = modal.find("[data-map-container]");
        this.modalManager = modalManager;

        this.map = null;
        this.mapboxMapId = null;
        this.mapboxAccessToken = null;

        this._initObservers();
    }

    Map.prototype = {
        _initObservers: function() {
            var self = this;

            this.modal.on("hide.bs.modal", function() {
                self.deactivateMap();
            });

            $(document).on("pictorials:show_map", function(event, eventData) {
                self.activateMap(eventData.latitude, eventData.longitude);
            });
        },

        /**
         * @param {Object} config
         */
        setMapboxConfig: function(config) {
            if (typeof config["mapId"] !== "undefined") {
                this.mapboxMapId = config["mapId"];
            }
            if (typeof config["accessToken"] !== "undefined") {
                this.mapboxAccessToken = config["accessToken"];
            }
        },

        /**
         * @return {Boolean}
         */
        isAvailable: function() {
            if (this.mapboxMapId && this.mapboxAccessToken) {
                return true;
            }
            return false;
        },

        /**
         * @param lat
         * @param lon
         */
        activateMap: function(lat, lon) {
            if (this.isAvailable() === false) {
                alert("Map not currently available");
                return;
            }
            var self = this;
            this.modalManager.addModal(this.modal, function() {
                self._initMap(lat, lon);
            });
        },

        deactivateMap: function() {
            this.map.remove();
            this.map = null;
        },

        /**
         * @param lat
         * @param lon
         */
        _initMap: function(lat, lon) {
            this.map = L.map(this.mapContainer.get(0), {
                "center": [lat, lon],
                "layers": [this._buildTileLayer()],
                "zoom": 15
            });
            L.marker([lat, lon]).addTo(this.map);
        },

        _buildTileLayer: function() {
            return L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
                attribution: 'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="https://mapbox.com">Mapbox</a>',
                maxZoom: 18,
                id: this.mapboxMapId,
                accessToken: this.mapboxAccessToken
            });
        }
    };

    root.PictorialsMap = Map;
})(window, L, jQuery);
