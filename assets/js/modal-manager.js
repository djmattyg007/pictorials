// Inspired by https://codepen.io/maouida/pen/NPGaaN

function ModalManager()
{
    this.modalStack = [];

    this.$body = jQuery("body");
    this.initEvents();
}

ModalManager.prototype = {
    initEvents: function() {
        var self = this;
        jQuery(".modal").on("hide.bs.modal", function() {
            self.onRemoveModal();
        });
    },

    getCurrentModal: function() {
        if (this.modalStack.length) {
            return this.modalStack[this.modalStack.length - 1];
        } else {
            return null;
        }
    },

    addModal: function($newModal, callback) {
        var $currentModal = this.getCurrentModal();
        if ($currentModal) {
            $currentModal.addClass("aside");
        }

        $newModal.one("shown.bs.modal.picmanager.addcallback", function() {
            if (callback) {
                callback();
            }
            //$newModal.off("shown.bs.modal.picmanager.addcallback");
        });

        this.modalStack.push($newModal);
        $newModal.modal("show");
    },

    onRemoveModal: function() {
        var $oldModal = this.modalStack.pop();
        var $currentModal = this.getCurrentModal();
        if ($currentModal) {
            var self = this;
            $oldModal.one("hidden.bs.modal.picmanager.removecallback", function() {
                self.$body.addClass("modal-open");
                $currentModal.modal("handleUpdate");
            });
            $currentModal.removeClass("aside");
        }
    }
};
