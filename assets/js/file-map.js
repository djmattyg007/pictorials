function FileMap(modal, modalManager, mapboxMapId, mapboxAccessToken)
{
    this.modal = modal;
    this.mapContainer = jQuery("[data-map-container]");
    this.modalManager = modalManager;
    this.mapboxMapId = mapboxMapId;
    this.mapboxAccessToken = mapboxAccessToken;

    this.map = null;

    this.initEvents();
}

FileMap.prototype = {
    initEvents: function() {
        var self = this;
        this.modal.on("hide.bs.modal", function() {
            self.deactivateMap();
        });
    },

    activateMap: function(coords) {
        var self = this;
        this.modalManager.addModal(this.modal, function() {
            self._initMap(coords);
            L.marker(coords).addTo(self.map);
        });
    },

    deactivateMap: function() {
        this.map.remove();
        this.map = null;
    },

    _initMap: function(coords) {
        this.map = L.map(this.mapContainer.get(0), {
            "center": coords,
            "layers": [this._buildTileLayer()],
            "zoom": 15
        });
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
