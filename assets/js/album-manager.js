var ajaxUrls = JSON.parse(jQuery("#ajax-urls").html());
var paths = JSON.parse(jQuery("#paths").html());

var modalManager = new ModalManager();
var userInputHandler = new BootboxWrapper(window.bootbox, modalManager);
var notificationManager = new NotificationManager();
var loader = new Loader(jQuery("#loader"));
var albums = new Albums(jQuery("#albums"));

var albumCreator = new AlbumCreator(userInputHandler, notificationManager, loader, paths, ajaxUrls.createalbum);
