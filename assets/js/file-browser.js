var ajaxUrls = JSON.parse(jQuery("#ajax-urls").html());
var templater = new Templater();
var loader = new Loader(jQuery("#loader"));
var galleryFlFactory = new FileLoaderFactory(ajaxUrls.download, ajaxUrls.sysload);
var downloadFlFactory = new FileLoaderFactory(ajaxUrls.downloadFile, ajaxUrls.sysload);
var fileDownloader = new Downloader(downloadFlFactory, loader);
var paths = new Paths(jQuery("#paths"));
var browser = new Browser(jQuery("#browser-container"), ajaxUrls.filebrowser, paths, loader, templater, fileDownloader, galleryFlFactory);
var fileViewer = new FileViewer(jQuery("#files-modal"), loader, templater, fileDownloader, 3, galleryFlFactory);
var documentKeyListener = new KeyListener(document);
browser.registerWithKeyListener(documentKeyListener);
fileViewer.registerWithKeyListener(documentKeyListener);

function sgBindEvents() {
    jQuery(browser).on("browser:load_files", fileViewer.loadFiles.bind(fileViewer));
}
sgBindEvents();
