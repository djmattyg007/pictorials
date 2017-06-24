jQuery.fn.serializeObject = function() {
    var result = {};
    this.serializeArray().forEach(function(pair) {
        var curElement = result[pair.name];
        if (typeof curElement !== "undefined" && curElement !== null) {
            if (Array.isArray(curElement)) {
                curElement.push(pair.value);
            } else {
                result[pair.name] = [curElement, pair.value];
            }
        } else {
            result[pair.name] = pair.value;
        }
    });
    return result;
};
