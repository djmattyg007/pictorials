var ajaxUrls = JSON.parse(jQuery("#ajax-urls").html());
var templater = new Templater(window.templates);
var loader = new Loader(jQuery("#loader"));
var galleryFlFactory = new FileLoaderFactory(ajaxUrls.download, ajaxUrls.sysload);
var downloadFlFactory = new FileLoaderFactory(ajaxUrls.downloadFile, ajaxUrls.sysload);
var thumbnailFlFactory = new CancellableFileLoaderFactory(ajaxUrls.download, ajaxUrls.sysload);
var fileDownloader = new Downloader(downloadFlFactory, loader);
var paths = new Paths(jQuery("#paths"));
var fileViewer = new FileViewer(jQuery("#files-modal"), loader, templater, fileDownloader, 3, galleryFlFactory);

var $browserContainer = jQuery("#browser-container");
var browserCurpath = new BrowserCurPath($browserContainer.find("[data-browser-curpath]"));
var browserDirs = new BrowserDirectories($browserContainer.find("table tbody[data-browser-directories]"), templater);
var browserFiles = new BrowserFiles($browserContainer.find("table tbody[data-browser-files]"), "success", templater, paths, thumbnailFlFactory, fileDownloader);
var browser = new Browser($browserContainer, ajaxUrls.filebrowser, paths, loader, browserCurpath, browserDirs, browserFiles);

var documentKeyListener = new KeyListener(document);
browserFiles.registerWithKeyListener(documentKeyListener);
browser.registerWithKeyListener(documentKeyListener);
fileViewer.registerWithKeyListener(documentKeyListener);

// TODO: Find a better way of handling this while keeping the components decoupled
jQuery(browser).on("browser:load_files", fileViewer.loadFiles.bind(fileViewer));

jQuery("#keyboard-shortcut-notify").popover({
    html: true,
    trigger: "hover",
    content: document.getElementById("keyboard-shortcut-list").innerHTML
});
