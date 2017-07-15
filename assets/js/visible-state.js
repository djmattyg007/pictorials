(function() {
    var update = function(open, el) {
        el.dataset.visibleState = (open === true ? "open" : "closed");
    };
    jQuery(document).on("click", "[data-toggle='visible-state']", function() {
        // If currently open, close. Otherwise, open.
        var open = this.getAttribute("aria-expanded") === "true" ? false : true;
        var targets = document.querySelectorAll(this.dataset.target);
        Array.prototype.forEach.call(targets, update.bind(null, open));
        this.setAttribute("aria-expanded", String(open));
    });
})();
