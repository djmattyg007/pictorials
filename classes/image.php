<?php

use Gregwar\Cache\Cache;
use Gregwar\Image\Image;

class PicImage
{
    /**
     * @var Cache
     */
    private static $cache = null;

    /**
     * @return Cache
     */
    private static function cacheInstance()
    {
        if (self::$cache === null) {
            self::$cache = new Cache();
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
