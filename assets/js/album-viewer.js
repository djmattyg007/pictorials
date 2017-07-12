var ajaxUrls = JSON.parse(document.getElementById("ajax-urls").innerHTML);
var imageUrls = JSON.parse(document.getElementById("image-urls").innerHTML);

var notificationManager = new NotificationManager();
var loader = new Loader(jQuery("#loader"));
var templater = new Templater(window.templates);
var sysloadChecker = new SysloadChecker(ajaxUrls.sysload);
sysloadChecker.start();
var concurrencyManagerFactory = new ConcurrencyManagerFactory();
var thumbnailFlFactory = new ProgressiveFileLoaderFactory(notificationManager, ajaxUrls.download, concurrencyManagerFactory);

var albums = new Albums(jQuery("#albums"), notificationManager, ajaxUrls.getalbumdetails);
var albumViewerImages = new AlbumViewerImages(jQuery("#album-images"), albums, loader, notificationManager, templater, thumbnailFlFactory, ajaxUrls.getalbumsortedfiles);

window.galleriaLoaderInit(albums, thumbnailFlFactory, imageUrls.dummy);
var albumGallery = new AlbumGallery(albums, loader, notificationManager, thumbnailFlFactory, concurrencyManagerFactory, ajaxUrls.getalbumsortedfiles);