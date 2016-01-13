/**
 * Inspired by rssi by Mark Vasilkov (https://github.com/mvasilkov/rssi)
 */

function Templater()
{
    // TODO: Support pre-compiled templates for CSP compatibility
    this.templates = {};
}

Templater.prototype = {
    build: function(name) {
        var templateContainer = document.getElementById(name + "-template");
        if (templateContainer === null) {
            return null;
        }
        var out = JSON.stringify(templateContainer.innerHTML).replace(/#\{(.*?)\}/g, function(foo, bar) {
            return '"+obj["' + bar + '"]+"';
        });
        return Function('obj', 'return ' + out);
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
            return template(vals);
        }
        var result = "";
        vals.forEach(function(value) {
            result += template(value);
        });
        return result;
    }
};
