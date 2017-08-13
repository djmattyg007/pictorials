(function(root) {
    function intSortFunc(a, b)
    {
        return a - b;
    }

    function parseIntMapper(i)
    {
        // You can't use parseInt() with Array.prototype.map() directly
        // because parseInt() accepts more than one argument.
        return parseInt(i);
    }

    function regexEscape(str)
    {
        return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    function sortAndConcat(obj)
    {
        var result = [];
        Object.keys(obj).map(parseIntMapper).sort(intSortFunc).reverse().forEach(function(key) {
            result = result.concat(obj[key]);
        });
        return result;
    }

    function AutocompleteSearcher(items)
    {
        this.items = items;
        this.addedItems = [];
        this.resultCache = {};
    }

    AutocompleteSearcher.prototype = {
        addNewItem: function(item) {
            if (this.addedItems.indexOf(item) > -1) {
                return;
            }
            var curPos = this.items.indexOf(item);
            if (curPos >= 0) {
                this.items.splice(curPos, 1);
            }
            this.addedItems.unshift(item);
            this.resultCache = {};
        },

        search: function(query) {
            var queryTrim = query.trim();
            if (typeof this.resultCache[queryTrim] !== "undefined") {
                return this.resultCache[queryTrim].slice();
            }
            var exactMatch = null,
                multiWordStartMatches = [],
                multiWordMatches = {},
                startMatches = {},
                substringMatches = {};
            var querySplit = queryTrim.split(/\s+/);

            var startRegex = new root.RegExp("^" + regexEscape(queryTrim), "i");
            var substringRegex = new root.RegExp(regexEscape(queryTrim), "i");
            var startPartRegexes = querySplit.map(function(queryPart) {
                return new root.RegExp("^" + regexEscape(queryPart), "i");
            });
            var substringPartRegexes = querySplit.map(function(queryPart) {
                return new root.RegExp(regexEscape(queryPart), "i");
            });

            var searchFunc = function(item) {
                if (item.trim().toLocaleUpperCase() === queryTrim.toLocaleUpperCase()) {
                    exactMatch = item;
                    return;
                }

                var itemSplit = item.trim().split(/\s+/);
                if (querySplit.length > 1 && itemSplit.length > 1) {
                    if (startRegex.test(item)) {
                        multiWordStartMatches.push(item);
                        return;
                    }
                    var score = 0;
                    for (var mx = 0; mx < querySplit.length && mx < itemSplit.length; mx++) {
                        if (querySplit[mx].toLocaleUpperCase() === itemSplit[mx].toLocaleUpperCase()) {
                            score += 10;
                        } else if (startPartRegexes[mx].test(itemSplit[mx])) {
                            score += 5;
                        } else if (substringPartRegexes[mx].test(itemSplit[mx])) {
                            score += 1;
                            break;
                        }
                    }
                    if (score > 0) {
                        if (typeof multiWordMatches[score] === "undefined") {
                            multiWordMatches[score] = [];
                        }
                        multiWordMatches[score].push(item);
                        return;
                    }
                }

                var startFindCount = 0;
                startPartRegexes.forEach(function(reg) {
                    itemSplit.forEach(function(itemPart) {
                        if (reg.test(itemPart)) {
                            startFindCount++;
                        }
                    });
                });
                if (startFindCount > 0) {
                    if (typeof startMatches[startFindCount] === "undefined") {
                        startMatches[startFindCount] = [];
                    }
                    startMatches[startFindCount].push(item);
                    return;
                }
                var substringFindCount = 0;
                substringPartRegexes.forEach(function(reg) {
                    itemSplit.forEach(function(itemPart) {
                        if (reg.test(itemPart)) {
                            substringFindCount++;
                        }
                    });
                });
                if (substringFindCount > 0) {
                    if (typeof substringMatches[substringFindCount] === "undefined") {
                        substringMatches[substringFindCount] = [];
                    }
                    substringMatches[substringFindCount].push(item);
                    return;
                }

                var itemJoint = itemSplit.join("");
                if (startRegex.test(itemJoint)) {
                    if (typeof startMatches[itemSplit.length] === "undefined") {
                        startMatches[itemSplit.length] = [];
                    }
                    startMatches[itemSplit.length].push(item);
                    return;
                }
                if (substringRegex.test(itemJoint)) {
                    if (typeof substringMatches[itemSplit.length] === "undefined") {
                        substringMatches[itemSplit.length] = [];
                    }
                    substringMatches[itemSplit.length].push(item);
                    return;
                }
            };

            this.addedItems.forEach(searchFunc);
            this.items.forEach(searchFunc);

            var result = [].concat(multiWordStartMatches)
                .concat(sortAndConcat(multiWordMatches))
                .concat(sortAndConcat(startMatches))
                .concat(sortAndConcat(substringMatches));
            if (exactMatch !== null) {
                result.unshift(exactMatch);
            }

            this.resultCache[queryTrim] = result;
            return result.slice();
        },

        searchForCallback: function(query, callback) {
            callback(this.search(query));
        },

        __ttAdapter: function() {
            return this.searchForCallback.bind(this);
        }
    };

    function AutocompleteSearcherFactory()
    {
    }

    AutocompleteSearcherFactory.prototype = {
        create: function(items) {
            return new AutocompleteSearcher(items);
        }
    };

    root.AutocompleteSearcherFactory = AutocompleteSearcherFactory;
})(window);
