(function(root, doc) {
    /**
     * @param {String} text
     * @return {HTMLELement}
     */
    function prepareFakeEl(text)
    {
        // This approach was inspired by https://clipboardjs.com/
        var isRTL = doc.documentElement.getAttribute("dir") === "rtl";

        var fakeEl = doc.createElement("textarea");
        fakeEl.style.fontSize = "12pt";
        fakeEl.style.border = "0";
        fakeEl.style.padding = "0";
        fakeEl.style.margin = "0";
        fakeEl.style.position = "absolute";
        fakeEl.style[isRTL ? "right" : "left"] = "-9999px";
        fakeEl.style.top = (window.pageYOffset || doc.documentElement.scrollTop) + "px";
        fakeEl.setAttribute("readonly", "");

        fakeEl.value = text;

        doc.body.appendChild(fakeEl);
        fakeEl.focus();
        fakeEl.setSelectionRange(0, fakeEl.value.length);

        return fakeEl;
    }

    /**
     * @param {HTMLElement} fakeEl
     */
    function cleanUpFakeEl(fakeEl)
    {
        doc.body.removeChild(fakeEl);
    }

    /**
     * @return {Boolean}
     */
    function copyText()
    {
        var result;
        try {
            result = doc.execCommand("copy");
        } catch (e) {
            result = false;
        }
        return result;
    }

    function ClipboardHandler()
    {
    }

    ClipboardHandler.prototype = {
        copy: function(text) {
            var fakeEl = prepareFakeEl(text);
            var result = copyText();
            cleanUpFakeEl(fakeEl);
            return result;
        }
    };

    root.ClipboardHandler = ClipboardHandler;
})(window, document);
