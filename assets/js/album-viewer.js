var ajaxUrls = JSON.parse(document.getElementById("ajax-urls").innerHTML);

var notificationManager = new NotificationManager();
var loader = new Loader(jQuery("#loader"));
var templater = new Templater(window.templates);
var thumbnailFlFactory = new CancellableFileLoaderFactory(notificationManager, ajaxUrls.download, ajaxUrls.sysload);

var albums = new Albums(jQuery("#albums"), notificationManager, ajaxUrls.getalbumdetails);
var albumViewerImages = new AlbumViewerImages(jQuery("#album-images"), albums, loader, notificationManager, templater, thumbnailFlFactory, ajaxUrls.getalbumsortedfiles);
