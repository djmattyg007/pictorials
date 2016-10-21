<?php

use Gregwar\Image\Image;

class PicImage
{
    /**
     * @var PicCache
     */
    private static $cache = null;

    /**
     * @return PicCache
     */
    private static function cacheInstance()
    {
        if (self::$cache === null) {
            self::$cache = new PicCache();
            self::$cache->setDirectoryMode(0775);
            self::$cache->setCacheDirectory(CACHE_DIR . "/images");
        }
        return self::$cache;
    }

    /**
     * @param string $filename
     * @return Image
     */
    public static function open($filename)
    {
        $image = Image::open($filename);
        $image->setCacheSystem(self::cacheInstance());
        return $image;
    }
}
