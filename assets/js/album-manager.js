var ajaxUrls = JSON.parse(document.getElementById("ajax-urls").innerHTML);
var paths = JSON.parse(jQuery("#paths").html());

var formSerializerFactory = new FormSerializerFactory();
var modalManager = new ModalManager();
var escaper = (new EscaperFactory()).create();
var userInputHandler = new BootboxWrapper(window.bootbox, modalManager, escaper);
var notificationManager = new NotificationManager();
var loader = new Loader(jQuery("#loader"));
var templaterFactory = new TemplaterFactory(escaper, new TemplateHelper());
var templater = templaterFactory.create(window.templates);
var sysloadChecker = new SysloadChecker(ajaxUrls.sysload);
sysloadChecker.start();
var concurrencyManagerFactory = new ConcurrencyManagerFactory();
var thumbnailFlFactory = new ProgressiveFileLoaderFactory(notificationManager, ajaxUrls.download, concurrencyManagerFactory);

var albums = new Albums(jQuery("#albums"), notificationManager, ajaxUrls.getalbumdetails);
var albumCreator = new AlbumCreator(userInputHandler, notificationManager, loader, paths, ajaxUrls.createalbum);
var albumDetailEditor = new AlbumDetailEditor(jQuery("#album-details-container"), albums, loader, templater, formSerializerFactory, userInputHandler, notificationManager, ajaxUrls.getalbumdetails, ajaxUrls.editalbum, ajaxUrls.deletealbum);
var albumImageSorter = new AlbumImageSorter(jQuery("#album-image-sorter"), albums, loader, userInputHandler, notificationManager, templater, thumbnailFlFactory, ajaxUrls.getalbumsortedfiles, ajaxUrls.savealbumsortedfiles);

var searchAutocompleterFactory = new AutocompleteSearcherFactory();
var fileMetadataEditor = new FileMetadataEditor(jQuery("#filemetadataeditor-modal"), loader, modalManager, thumbnailFlFactory, searchAutocompleterFactory, formSerializerFactory, notificationManager, ajaxUrls.fileMetadataFormDownload, ajaxUrls.fileMetadataUpdate, ajaxUrls.fileMetadataAutocompleteData);
