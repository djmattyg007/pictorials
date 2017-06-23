jQuery(document).on("click", "[data-toggle='flip']", function() {
    var el;
    if (this.dataset.target) {
        el = document.querySelector(this.dataset.target);
    } else {
        el = jQuery(this).closest(".flip").find(".card").get(0);
    }
    el.classList.toggle("flipped");
});
