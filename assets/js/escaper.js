(function(root) {
    "use strict";

    var escapeHTMLMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };

    function Escaper()
    {
    }

    Escaper.prototype = {
        escapeHTML: function(value) {
            if (typeof value !== "string") {
                return value;
            }

            return value.replace(/[&<>'"]/g, function(char) {
                return escapeHTMLMap[char];
            });
        }
    };

    function EscaperFactory()
    {
    }

    EscaperFactory.prototype = {
        create: function() {
            return new Escaper();
        }
    };

    root.EscaperFactory = EscaperFactory;
})(window);
