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

function Templater()
{
    if (typeof window.templates === "undefined") {
        this.templates = {};
    } else {
        this.templates = window.templates;
    }
}

Templater.prototype = {
    build: function(name) {
        var templateContainer = document.getElementById(name + "-template");
        if (templateContainer === null) {
            return null;
        }
        /** Inspired by rssi by Mark Vasilkov (https://github.com/mvasilkov/rssi) */
        var out = JSON.stringify(templateContainer.innerHTML).replace(/([#\$%])\{(.*?)\}/g, function(foo, p1, p2) {
            if (p1 === "#") {
                return '"+helper.escapeHtml(obj["' + p2 + '"], false)+"';
            } else if (p1 === "$") {
                return '"+helper.escapeHtml(obj["' + p2 + '"], true)+"';
            } else {
                return '"+obj["' + p2 + '"]+"';
            }
        });
        return Function('helper', 'obj', 'return ' + out);
    },

    get: function(name) {
        if (typeof this.templates[name] === "undefined") {
            this.templates[name] = this.build(name);
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
