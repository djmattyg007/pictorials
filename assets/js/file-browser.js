var ajaxUrls = JSON.parse(jQuery("#ajax-urls").html());
var mapboxConfigEl = jQuery("#mapbox-config");
var mapboxConfig = null;
if (mapboxConfigEl.length) {
    mapboxConfig = JSON.parse(mapboxConfigEl.html());
}

var clipboardHandler = new ClipboardHandler();
var shareString = new ShareString(ajaxUrls.shareReceive, ajaxUrls.shareSubmit);
var templater = new Templater(window.templates);
var modalManager = new ModalManager();
var userInputHandler = new BootboxWrapper(window.bootbox, modalManager);
var notificationManager = new NotificationManager();
var shareManager = new ShareManager(shareString, userInputHandler, clipboardHandler);
var loader = new Loader(jQuery("#loader"));
var toolbox = new Toolbox(jQuery("#available-actions"));
var galleryFlFactory = new FileLoaderFactory(notificationManager, ajaxUrls.download, ajaxUrls.sysload);
var downloadFlFactory = new FileLoaderFactory(notificationManager, ajaxUrls.downloadFile, ajaxUrls.sysload);
var thumbnailFlFactory = new CancellableFileLoaderFactory(notificationManager, ajaxUrls.download, ajaxUrls.sysload);
var fileDownloader = new Downloader(downloadFlFactory, loader);
var fileMap = new FileMap(jQuery("#map-modal"), modalManager);
if (mapboxConfig) {
    fileMap.setMapboxConfig(mapboxConfig);
}
var paths = new Paths(jQuery("#paths"));
var fileViewer = new FileViewer(jQuery("#files-modal"), loader, templater, modalManager, fileDownloader, fileMap, 3, galleryFlFactory);

var fileLocator = new FileLocator(shareString, userInputHandler);
var fileAlbumAdder = new FileAlbumAdder(paths, loader, userInputHandler, notificationManager, ajaxUrls.getalbumdetails, ajaxUrls.addFileToAlbum);

var $browserContainer = jQuery("#browser-container");
var browserCurpath = new BrowserCurPath($browserContainer.find("[data-browser-curpath]"));
var browserDirs = new BrowserDirectories($browserContainer.find("table tbody[data-browser-directories]"), templater);
var browserFiles = new BrowserFiles($browserContainer.find("table tbody[data-browser-files]"), "success", templater, paths, thumbnailFlFactory, fileDownloader);
var browser = new Browser($browserContainer, ajaxUrls.filebrowser, paths, loader, browserCurpath, browserDirs, browserFiles);

var documentKeyListener = new KeyListener(document);
browserFiles.registerWithKeyListener(documentKeyListener);
browser.registerWithKeyListener(documentKeyListener);
fileViewer.registerWithKeyListener(documentKeyListener);

jQuery("#keyboard-shortcut-notify").popover({
    html: true,
    trigger: "hover",
    content: document.getElementById("keyboard-shortcut-list").innerHTML
});
