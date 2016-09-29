<?php

$paths = Access::getAllowedPaths();

if (empty($_POST)) {
    $appConf = loadPicFile("conf/app.json");
    loadPicTemplate("templates/filebrowser.phtml", array(
        "paths" => $paths,
        "imageSizes" => json_decode($appConf, true)["image_sizes"],
    ));
    exit();
}
if (!isset($_POST["path"]) || !is_numeric($_POST["path"])) {
    sendError(400);
}
$pathID = (int) $_POST["path"];
if (!isset($paths[$pathID])) {
    sendError(404);
}
$pathConfig = $paths[$pathID];
if (!empty($_POST["relpath"])) {
    $relpath = loadPicFile("helpers/filenamereject.php", array("filename" => $_POST["relpath"]));
}

use Symfony\Component\Finder\Finder;

$directoryFinder = new Finder();
$directoryFinder->directories()
    ->ignoreUnreadableDirs()
    ->depth(0)
    ->sortByName();
if (in_array("symlinks", $pathConfig["permissions"])) {
    $directoryFinder->followLinks();
}
if (!empty($relpath)) {
    $directoryFinder->path($relpath)
        ->depth(substr_count($relpath, "/") + 1);
}
if (!in_array("nsfw", $pathConfig["permissions"])) {
    $directoryFinder->notPath("/.*\/NSFW\/.*/")
        ->notPath("/NSFW\/.*/")
        ->notPath("/.*\/NSFW/");
}
$directoryIterator = $directoryFinder->in($pathConfig["path"]);

$directoryArray = array();
foreach ($directoryIterator as $directory) {
    $directoryArray[] = array(
        "path" => $directory->getRelativePathname(),
        "name" => $directory->getBasename(),
    );
}

$fileFinder = new Finder();
$fileFinder->files()
    ->ignoreUnreadableDirs()
    ->depth(0);
$allowedImageTypes = loadPicFile("helpers/imagetypes.php");
foreach ($allowedImageTypes as $imageType) {
    $fileFinder->name("*.{$imageType}");
}
foreach (array_map("strtoupper", $allowedImageTypes) as $imageType) {
    $fileFinder->name("*.{$imageType}");
}
$fileFinder->sortByName();
if (in_array("symlinks", $pathConfig["permissions"])) {
    $fileFinder->followLinks();
}
if (!empty($relpath)) {
    $fileFinder->path($relpath)
        ->depth(substr_count($relpath, "/") + 1);
}
if (!in_array("nsfw", $pathConfig["permissions"])) {
    $fileFinder->notPath("/.*\/NSFW\/.*/")
        ->notPath("/NSFW\/.*/")
        ->notPath("/.*\/NSFW/");
}
$fileIterator = $fileFinder->in($pathConfig["path"]);

$fileArray = array();
foreach ($fileIterator as $file) {
    $fileArray[] = array(
        "filename" => $file->getBasename(),
        "relpath" => $file->getRelativePathname(),
        "size" => humanFilesize($file->getSize()),
        "mtime" => date("Y-m-d H:i:s", $file->getMTime()),
    );
}

header("Content-type: application/json");
echo json_encode(array("directories" => $directoryArray, "files" => $fileArray));
