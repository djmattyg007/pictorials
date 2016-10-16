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
        jQuery(document).on("hide.bs.modal", ".modal", function() {
            self._onRemoveModal();
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
        });

        this.modalStack.push($newModal);
        $newModal.modal("show");
    },

    _onRemoveModal: function() {
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
    },

    safeHide: function($modal, callback) {
        $modal.one("hidden.bs.modal.picmanager.saferemovecallback", function() {
            callback();
        });
        $modal.modal("hide");
    }
};
