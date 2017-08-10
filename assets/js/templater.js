(function(root) {
    "use strict";

    /**
     * @param {NodeList} nodes
     * @return {String}
     */
    function nodesToHtml(nodes)
    {
        var html = "";
        Array.prototype.forEach.call(nodes, function(node) {
            if (node.nodeType === 1) {
                html += node.outerHTML;
            } else if (node.nodeType === 3) {
                html += node.textContent;
            }
        });
        return html;
    }

    /**
     * @param {String} html
     * @return {String}
     */
    function htmlTrim(html)
    {
        var template = document.createElement("template");
        template.innerHTML = html;
        var trimElements = template.content.querySelectorAll("[data-templater-trim]");
        Array.prototype.forEach.call(trimElements, function(el) {
            el.innerHTML = el.innerHTML.trim();
            el.removeAttribute("data-templater-trim");
        });
        return nodesToHtml(template.content.childNodes);
    }

    function TemplateHelper()
    {
    }

    TemplateHelper.prototype = {
        /**
         * @param val
         * @return {Boolean}
         */
        notEmpty: function(val) {
            if (typeof val === "object") {
                // Arrays are considered objects by typeof
                return Object.keys(val).length > 0;
            } else {
                return Boolean(val);
            }
        },

        /**
         * @param {String} html
         * @return {String}
         */
        htmlTrim: function(html) {
            if (html.indexOf("data-templater-trim") >= 0) {
                return htmlTrim(html);
            } else {
                return html;
            }
        },

        /**
         * @param {String[]} strings
         * @return {String}
         */
        csv: function(strings) {
            return strings.join(", ");
        }
    };

    /**
     * @param {Object} templates
     * @param {Escaper} escaper
     * @param {TemplateHelper} helper
     */
    function Templater(templates, escaper, helper)
    {
        this.templates = templates;
        this.escaper = escaper;
        this.helper = helper;
    }

    Templater.prototype = {
        /**
         * @param {String} name
         * @return {Function}
         */
        get: function(name) {
            if (typeof this.templates[name] === "undefined") {
                throw new Error("Unrecognised template: " + name);
            }
            return this.templates[name];
        },

        /**
         * @param {String} name
         * @param {Object|Object[]} vals
         * @return {String}
         */
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

    /**
     * @param {Escaper} escaper
     * @param {TemplateHelper} helper
     */
    function TemplaterFactory(escaper, helper)
    {
        this.escaper = escaper;
        this.helper = helper;
    }

    TemplaterFactory.prototype = {
        /**
         * @param {Object[]} templates
         * @return {Templater}
         */
        create: function(templates) {
            return new Templater(templates, this.escaper, this.helper);
        }
    };

    root.TemplateHelper = TemplateHelper;
    root.TemplaterFactory = TemplaterFactory;
})(window);
