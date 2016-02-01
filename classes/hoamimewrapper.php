<?php

use Hoa\Mime\Mime as HoaMime;

class HoaMimeWrapper extends HoaMime
{
    /**
     * @param string $extension
     * @return string[]
     */
    public static function picStaticGetOtherExtensions($extension)
    {
        $mimetype = static::getMimeFromExtension($extension);
        $extensions = static::getExtensionsFromMime($mimetype);
        $out = [];
        foreach ($extensions as $other) {
            if ($other !== $extension) {
                $out[] = $other;
            }
        }
        return $out;
    }

    /**
     * @param string $filename
     * @return string|null
     */
    public static function picGetMimeTypeFromFilename($filename)
    {
        $mimeType = @exif_imagetype($filename);
        switch ($mimeType)
        {
            case IMAGETYPE_GIF:
                return "image/gif";
            case IMAGETYPE_JPEG:
                return "image/jpeg";
            case IMAGETYPE_PNG:
                return "image/png";
            default:
                return null;
        }
    }
}
