var TemplateHelper = {
    escapeHtmlMap: {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    },

    escapeHtml: function(val, forAttr) {
        return val.replace(forAttr ? /[&<>'"]/g : /[&<>]/g, function(c) {
            return TemplateHelper.escapeHtmlMap[c];
        });
    }
};

function Templater(templates)
{
    this.templates = templates;
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
        if (template === null) {
            return "";
        }
        if (!Array.isArray(vals)) {
            return template(TemplateHelper, vals);
        }
        var result = "";
        vals.forEach(function(value) {
            result += template(TemplateHelper, value);
        });
        return result;
    }
};
