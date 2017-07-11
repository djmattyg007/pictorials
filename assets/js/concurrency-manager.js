function ConcurrencyManagerFactory()
{
}

ConcurrencyManagerFactory.prototype = {
    create: function(concurrencyLimit) {
        return new ConcurrencyManager(concurrencyLimit);
    }
};

function ConcurrencyManager(concurrencyLimit)
{
    this.origConcurrencyLimit = (!isNaN(parseInt(concurrencyLimit)) && concurrencyLimit > 2 ? concurrencyLimit : 2);
    this.concurrencyLimit = this.origConcurrencyLimit;

    this.initEvents();
}

ConcurrencyManager.prototype = {
    initEvents: function() {
        var self = this;
        jQuery(document).on("pictorials:sysload_update", function(event, eventData) {
            switch (eventData.concurrencyLevel) {
                case 2:
                    self.concurrencyLimit = self.origConcurrencyLimit;
                    break;
                case 1:
                    self.concurrencyLimit = Math.max(2, self.origConcurrencyLimit - 1);
                    break;
                default:
                    if (self.origConcurrencyLimit === 2) {
                        self.concurrencyLimit = 1;
                    } else {
                        self.concurrencyLimit = self.origConcurrencyLimit - 2;
                    }
                    break;
            }
        });
    },

    getCLimit: function() {
        return this.concurrencyLimit;
    }
};
