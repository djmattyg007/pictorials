<?php

use Gregwar\Cache\Cache as BaseCache;

class PicCache extends BaseCache
{
    /**
     * @param string $filename
     */
    public function remove($filename)
    {
        $cacheFilename = $this->getCacheFile($filename, true);
        if (file_exists($cacheFilename)) {
            unlink($cacheFilename);
        }
    }
}
