jQuery(document).on("click", "[data-toggle='visible-state']", function() {
    var target = document.getElementById(this.dataset.target);
    if (target.dataset.visibleState === "open") {
        target.dataset.visibleState = "closed";
        this.setAttribute("aria-expanded", "false");
    } else {
        target.dataset.visibleState = "open";
        this.setAttribute("aria-expanded", "true");
    }
});
