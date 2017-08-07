var ajaxUrls = JSON.parse(document.getElementById("ajax-urls").innerHTML);
var imageUrls = JSON.parse(document.getElementById("image-urls").innerHTML);

var notificationManager = new NotificationManager();
var loader = new Loader(jQuery("#loader"));
var escaper = (new EscaperFactory()).create();
var templaterFactory = new TemplaterFactory(escaper, new TemplateHelper());
var templater = templaterFactory.create(window.templates);
var sysloadChecker = new SysloadChecker(ajaxUrls.sysload);
sysloadChecker.start();
var concurrencyManagerFactory = new ConcurrencyManagerFactory();
var thumbnailFlFactory = new ProgressiveFileLoaderFactory(notificationManager, ajaxUrls.download, concurrencyManagerFactory);

var albums = new Albums(jQuery("#albums"), notificationManager, ajaxUrls.getalbumdetails);

window.galleriaLoaderInit(albums, thumbnailFlFactory, imageUrls.dummy);
var albumGallery = new AlbumGallery(jQuery("#album-gallery"), albums, loader, templater, notificationManager, ajaxUrls.getalbumsortedfiles);
