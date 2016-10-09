<?php

/**
 * Inspired by rssi by Mark Vasilkov (https://github.com/mvasilkov/rssi)
 */
class JsTemplateBuilder
{
    const REGEX = '/([#\$%@])\{(.*?)\}/';

    /**
     * @var int
     */
    private static $indentation = 0;

    /**
     * Accepts a JSON-encoded string with the start and end quotation marks chopped off.
     *
     * @param string $template
     * @return string
     */
    public static function build($template)
    {
        self::$indentation = 1;
        $textParts = preg_split(self::REGEX, $template);
        preg_match_all(self::REGEX, $template, $templateParts, PREG_SET_ORDER);
        $partCount = count($templateParts);

        $result = "";
        for ($x = 0; $x < $partCount; $x++) {
            $result .= str_repeat(" ", self::$indentation * 4 + 4) . self::buildTextPart($textParts[$x]) . "\n";
            $result .= str_repeat(" ", self::$indentation * 4 + 4) . self::buildTemplatePart($templateParts[$x][1], $templateParts[$x][2]) . "\n";
        }
        $result .= str_repeat(" ", self::$indentation * 4 + 4) . self::buildTextPart($textParts[$x]) . "\n";

        return $result;
    }

    /**
     * @param string $part
     * @return string
     */
    private static function buildTextPart($part)
    {
        return 'result += "' . $part . '";';
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
            return 'result += helper.escapeHtml(obj["' . $inside . '"], false);';
        } elseif ($control === '$') {
            // Escape for HTML attribute
            return 'result += helper.escapeHtml(obj["' . $inside . '"], true);';
        } elseif ($control === '%') {
            // Do not escape
            return 'result += obj["' . $inside . '"];';
        } elseif ($control === '@') {
            $logic = explode(" ", $inside, 2);
            if ($logic[0] === 'if') {
                self::$indentation++;
                return 'if (typeof obj["' . $logic[1] . '"] !== "undefined" && obj["' . $logic[1] . '"]) {';
            } elseif ($logic[0] === 'else') {
                return '} else {';
            } elseif ($logic[0] === 'endif') {
                self::$indentation--;
                return '}';
            }
        }
    }
}
