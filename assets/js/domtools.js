window.DOMTools = {
    focusElement: function($el) {
        DOMTools.scrollIfNeeded($el.get(0));
        $el.addClass("element-focus");
        setTimeout(function() {
            $el.removeClass("element-focus").addClass("element-focus-transition");
            setTimeout(function() {
                $el.removeClass("element-focus-transition");
            }, 1000);
        }, 500);
    },

    scrollIfNeeded: function(el) {
        var bod = document.body;
        var totalOffset = el.offsetTop;
        var parent = el.offsetParent;
        while (parent !== bod) {
            totalOffset += parent.offsetTop;
            parent = parent.offsetParent;
        }
        var winHeight = jQuery(window).height();
        var scrollTop = totalOffset;// - winHeight / 2;
        if (scrollTop < bod.scrollTop || scrollTop > bod.scrollTop + winHeight) {
            bod.scrollTop = scrollTop - winHeight / 2;
        } else {
            scrollTop -= winHeight / 2;
            if (scrollTop < bod.scrollTop || scrollTop > body.scrollTop + winHeight) {
                body.scrollTop = scrollTop;
            }
        }
    }
};
