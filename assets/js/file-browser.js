var ajaxUrls = JSON.parse(document.getElementById("ajax-urls").innerHTML);
var mapboxConfigEl = jQuery("#mapbox-config");
var mapboxConfig = null;
if (mapboxConfigEl.length) {
    mapboxConfig = JSON.parse(mapboxConfigEl.html());
}

var clipboardHandler = new ClipboardHandler();
var formSerializerFactory = new FormSerializerFactory();
var shareString = new ShareString(ajaxUrls.shareReceive, ajaxUrls.shareSubmit);
var escaper = (new EscaperFactory()).create();
var templaterFactory = new TemplaterFactory(escaper, new TemplateHelper());
var templater = templaterFactory.create(window.templates);
var modalManager = new ModalManager();
var userInputHandler = new BootboxWrapper(window.bootbox, modalManager, escaper);
var notificationManager = new NotificationManager();
var shareManager = new ShareManager(shareString, userInputHandler, clipboardHandler);
var loader = new Loader(jQuery("#loader"));
var toolbox = new Toolbox(jQuery("#available-actions"));
var sysloadChecker = new SysloadChecker(ajaxUrls.sysload);
sysloadChecker.start();
var concurrencyManagerFactory = new ConcurrencyManagerFactory();
var galleryFlFactory = new FileLoaderFactory(notificationManager, ajaxUrls.download, concurrencyManagerFactory);
var downloadFlFactory = new FileLoaderFactory(notificationManager, ajaxUrls.downloadFile, concurrencyManagerFactory);
var progressiveFlFactory = new ProgressiveFileLoaderFactory(notificationManager, ajaxUrls.download, concurrencyManagerFactory);
var fileDownloader = new Downloader(downloadFlFactory, loader);
var map = new PictorialsMap(jQuery("#map-modal"), modalManager);
if (mapboxConfig) {
    map.setMapboxConfig(mapboxConfig);
}
var paths = new Paths(jQuery("#paths"));
var fileViewer = new FileViewer(jQuery("#files-modal"), loader, templater, modalManager, 3, galleryFlFactory);

var fileLocator = new FileLocator(shareString, userInputHandler);
var fileAlbumAdder = new FileAlbumAdder(paths, loader, userInputHandler, notificationManager, ajaxUrls.getalbumdetails, ajaxUrls.addFileToAlbum);

var $browserContainer = jQuery("#browser-container");
var browserCurpath = new BrowserCurPath($browserContainer.find("[data-browser-curpath]"));
var browserDirs = new BrowserDirectories($browserContainer.find("table tbody[data-browser-directories]"), templater);
var browserFiles = new BrowserFiles($browserContainer.find("table tbody[data-browser-files]"), "success", templater, paths, progressiveFlFactory);
var browser = new Browser($browserContainer, ajaxUrls.filebrowser, paths, loader, browserCurpath, browserDirs, browserFiles);

var searchAutocompleterFactory = new AutocompleteSearcherFactory();
var fileMetadataEditor = new FileMetadataEditor(jQuery("#filemetadataeditor-modal"), loader, modalManager, progressiveFlFactory, searchAutocompleterFactory, formSerializerFactory, notificationManager, ajaxUrls.fileMetadataFormDownload, ajaxUrls.fileMetadataUpdate, ajaxUrls.fileMetadataAutocompleteData);

var documentKeyListener = new KeyListener(document);
browserFiles.registerWithKeyListener(documentKeyListener);
browser.registerWithKeyListener(documentKeyListener);
fileViewer.registerWithKeyListener(documentKeyListener);

jQuery("#keyboard-shortcut-notify").popover({
    html: true,
    trigger: "hover",
    content: document.getElementById("keyboard-shortcut-list").innerHTML
});
