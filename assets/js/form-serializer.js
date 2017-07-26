(function(root, $) {
    "use strict";

    var formElementTypesRegex = /^(?:input|select|textarea)/i;
    var submitterInputTypesRegex = /^(?:submit|button|image|reset|file)$/i;
    var checkableInputTypesRegex = /^(?:checkbox|radio)$/i;
    var newlineNormalizerRegex = /\r?\n/g;

    function getFormElements($form, includeDisabled)
    {
        return $form.map(function() {
            var elements = $.prop(this, "elements");
            return $.makeArray(elements);
        }).filter(function() {
            return this.name &&
                (includeDisabled === true || $(this).is(":disabled") === false) &&
                formElementTypesRegex.test(this.nodeName) === true &&
                submitterInputTypesRegex.test(this.type) === false &&
                (this.checked === true || checkableInputTypesRegex.test(this.type) === false);
        });
    }

    function serializeFormElements($elements)
    {
        var formData = {};
        $elements.each(function() {
            var val = $(this).val();
            var result;
            if (Array.isArray(val)) {
                result = val.map(function(item) {
                    return item.replace(newlineNormalizerRegex, "\r\n");
                });
            } else {
                result = val.replace(newlineNormalizerRegex, "\r\n");
            }
            formData[this.name] = result;
        });
        return formData;
    }

    function FormSerializer($form, includeDisabled)
    {
        this.$form = $form;
        this.includeDisabled = includeDisabled;
    }

    FormSerializer.prototype = {
        getFormElements: function() {
            return getFormElements(this.$form, this.includeDisabled).get();
        },

        getSerializedFormData: function() {
            return serializeFormElements(getFormElements(this.$form, this.includeDisabled));
        }
    };

    function FormSerializerFactory()
    {
    }

    FormSerializerFactory.prototype = {
        create: function($form, includeDisabled) {
            return new FormSerializer($form, includeDisabled === true ? true : false);
        }
    };

    root.FormSerializerFactory = FormSerializerFactory;
})(window, jQuery);
