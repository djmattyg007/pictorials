function KeyListener(subject)
{
    this.observers = {};

    jQuery(subject).on("keyup.pictorials.key-listener", "form input", function(e) { e.stopPropagation(); });
    jQuery(subject).on("keyup.pictorials.key-listener", this._keyupListener.bind(this));
}

KeyListener.prototype = {
    register: function(key, callback) {
        if (typeof this.observers[key] === "undefined") {
            this.observers[key] = [];
        }
        this.observers[key].push(callback);
    },

    _keyupListener: function(event) {
        if (typeof this.observers[event.which] === "undefined") {
            return;
        }
        this.observers[event.which].forEach(function(callback) {
            callback(event);
        });
    }
}
