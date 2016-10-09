<?php

/**
 * Inspired by rssi by Mark Vasilkov (https://github.com/mvasilkov/rssi)
 */
class JsTemplateBuilder
{
    const REGEX = '/([#\$%@])\{(.*?)\}/';

    /**
     * Accepts a JSON-encoded string with the start and end quotation marks chopped off.
     *
     * @param string $template
     * @return string
     */
    public static function build($template)
    {
        $textParts = preg_split(self::REGEX, $template);
        preg_match_all(self::REGEX, $template, $templateParts, PREG_SET_ORDER);
        $partCount = count($templateParts);

        $result = "";
        for ($x = 0; $x < $partCount; $x++) {
            $result .= self::buildTextPart($textParts[$x]);
            $result .= self::buildTemplatePart($templateParts[$x][1], $templateParts[$x][2]);
        }
        $result .= self::buildTextPart($textParts[$x]);

        return $result;
    }

    /**
     * @param string $part
     * @return string
     */
    private static function buildTextPart($part)
    {
        return 'result += "' . $part . '";' . "\n";
    }

    /**
     * @param string $control
     * @param string $inside
     * @return string
     */
    private static function buildTemplatePart($control, $inside)
    {
        if ($control === '#') {
            // Escape for general HTML
            return 'result += helper.escapeHtml(obj["' . $inside . '"], false);' . "\n";
        } elseif ($control === '$') {
            // Escape for HTML attribute
            return 'result += helper.escapeHtml(obj["' . $inside . '"], true);' . "\n";
        } elseif ($control === '%') {
            // Do not escape
            return 'result += obj["' . $inside . '"];' . "\n";
        } elseif ($control === '@') {
            $logic = explode(" ", $inside, 2);
            if ($logic[0] === 'if') {
                return 'if (obj["' . $logic[1] . '"]) {' . "\n";
            } elseif ($logic[0] === 'endif') {
                return '}' . "\n";
            }
        }
    }
}
