var ajaxUrls = JSON.parse(jQuery("#ajax-urls").html());
var paths = JSON.parse(jQuery("#paths").html());

var modalManager = new ModalManager();
var userInputHandler = new BootboxWrapper(window.bootbox, modalManager);
var albums = new Albums(jQuery("#albums"));

var albumCreator = new AlbumCreator(userInputHandler, paths, ajaxUrls.createalbum);
