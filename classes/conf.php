<?php

class PicConfCache
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
            self::$cache->setPrefixSize(0);
            self::$cache->setDirectoryMode(0775);
            self::$cache->setCacheDirectory(CACHE_DIR . "/config");
        }
        return self::$cache;
    }

    /**
     * @param string $filename
     * @return string|null
     */
    public function get($filename)
    {
        return self::cacheInstance()->get($filename);
    }

    /**
     * @param string $filename
     * @param array|string $content
     */
    public function set($filename, $content)
    {
        if (is_array($content)) {
            $content = json_encode($content, JSON_PRETTY_PRINT);
        }
        self::cacheInstance()->set($filename, $content);
    }

    /**
     * @param string $filename
     */
    public function remove($filename)
    {
        self::cacheInstance()->remove($filename);
    }
}
