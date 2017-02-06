<?php

$io = PicCLI::getIO();

$validateWebroot = function($webroot) {
    if ($webroot[0] !== "/") {
        throw new Exception("If supplying web root, must provide absolute path.");
    }
    if (!is_writeable($webroot)) {
        throw new Exception("Cannot create web root files automatically, web root is not writeable by current user.");
    }
};

if ($webroot = PicCLI::getGetopt("--webroot")) {
    try {
        $validateWebroot($webroot);
    } catch (Exception $e) {
        $io->errln($e->getMessage());
        exit(PicCLI::EXIT_USAGE);
    }
} elseif (getenv("PICTORIALS_INSTALL_NONINTERACTIVE") === "true") {
    $webroot = null;
} else {
    $io->outln("Pictorials can automatically create the web entry point and asset symlink/hook for you.");
    $io->outln("Enter the absolute path to the web root, or leave it empty so you can do this later.");
    $io->out("<<yellow>>Webroot: <<reset>>");
    $webroot = $io->in();
    if ($webroot) {
        try {
            $validateWebroot($webroot);
        } catch (Exception $e) {
            $io->errln($e->getMessage());
            exit(PicCLI::EXIT_INPUT);
        }
    } else {
        $webroot = null;
    }
}
return $webroot;
