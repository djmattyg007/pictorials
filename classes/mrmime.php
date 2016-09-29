<?php

use Pekkis\MimeTypes\MimeTypes as BaseMimeTypes;

class MrMime
{
    /**
     * @var BaseMimeTypes
     */
    private static $instance = null;

    /**
     * @return BaseMimeTypes
     */
    private static function instance()
    {
        if (self::$instance === null) {
            self::$instance = new BaseMimeTypes();
        }
        return self::$instance;
    }

    /**
     * @param string $extension
     * @return string[]
     */
    public static function getOtherExtensions($extension)
    {
        $instance = self::instance();
        $mimetype = $instance->extensionToMimeType($extension);
        $extensions = $instance->mimeTypeToExtensions($mimetype);
        $out = [];
        foreach ($extensions as $other) {
            if ($other !== $extension) {
                $out[] = $other;
            }
        }
        return $out;
    }

    /**
     * @param string $extension
     * @return string
     */
    public static function extensionToMimeType($extension)
    {
        return self::instance()->extensionToMimeType($extension);
    }

    /**
     * @param string $filename
     * @return string
     */
    public static function resolveMimeType($filename)
    {
        return self::instance()->resolveMimeType($filename);
    }
}
