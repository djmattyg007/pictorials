(function(root) {
    "use strict";

    var domParser = new root.DOMParser();

    function TemplateHelper()
    {
    }

    TemplateHelper.prototype = {
        notEmpty: function(val) {
            if (typeof val === "object") {
                // Arrays are considered objects by typeof
                return Object.keys(val).length > 0;
            } else {
                return Boolean(val);
            }
        },

        htmlTrim: function(html) {
            var doc = domParser.parseFromString(html, "text/html");
            var trimElements = doc.querySelectorAll("[data-templater-trim]");
            Array.prototype.forEach.call(trimElements, function(el) {
                el.innerHTML = el.innerHTML.trim();
            });
            return doc.querySelector("body").innerHTML;
        },

        csv: function(strings) {
            return strings.join(", ");
        }
    };

    function Templater(templates, escaper, helper)
    {
        this.templates = templates;
        this.escaper = escaper;
        this.helper = helper;
    }

    Templater.prototype = {
        get: function(name) {
            if (typeof this.templates[name] === "undefined") {
                throw new Error("Unrecognised template: " + name);
            }
            return this.templates[name];
        },

        render: function(name, vals) {
            var template = this.get(name);
            if (!Array.isArray(vals)) {
                return template(this.escaper, this.helper, vals);
            }
            var result = "";
            vals.forEach(function(value, index) {
                value.index = index;
                result += template(this.escaper, this.helper, value);
            }.bind(this));
            return result;
        }
    };

    function TemplaterFactory(escaper, helper)
    {
        this.escaper = escaper;
        this.helper = helper;
    }

    TemplaterFactory.prototype = {
        create: function(templates) {
            return new Templater(templates, this.escaper, this.helper);
        }
    };

    root.TemplateHelper = TemplateHelper;
    root.TemplaterFactory = TemplaterFactory;
})(window);
