(function(root) {
    "use strict";

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
