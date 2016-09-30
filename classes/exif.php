<?php

use PHPExif\Reader\Reader as ExifReader;

class Exif
{
    /**
     * @var ExifReader
     */
    private static $instance = null;

    /**
     * @var array
     */
    private static $readCache = array();

    /**
     * @return ExifReader
     */
    private static function instance()
    {
        if (self::$instance === null) {
            self::$instance = ExifReader::factory(ExifReader::TYPE_NATIVE);
        }
        return self::$instance;
    }

    /**
     * @param string $filename
     * @return PHPExif\Exif
     */
    public function read($filename)
    {
        if (isset(self::$readCache[$filename])) {
            return self::$readCache[$filename];
        }
        $exif = self::instance()->read($filename);
        self::$readCache[$filename] = $exif;
        return $exif;
    }
}
