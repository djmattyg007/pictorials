var ajaxUrls = JSON.parse(jQuery("#ajax-urls").html());

var modalManager = new ModalManager();
var userInputHandler = new BootboxWrapper(window.bootbox, modalManager);
var albums = new Albums(jQuery("#albums"));
