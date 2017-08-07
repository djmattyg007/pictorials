<?php

/**
 * Inspired by rssi by Mark Vasilkov (https://github.com/mvasilkov/rssi)
 */
class JsTemplateBuilder
{
    const REGEX = '/([#%@])\{(.*?)\}/';

    /**
     * @var int
     */
    private $indentation = 1;

    /**
     * @var string
     */
    private $template;

    /**
     * Accepts a JSON-encoded string with the start and end quotation marks chopped off.
     *
     * @param string $template
     */
    private function __construct($template)
    {
        $this->template = $template;
    }

    /**
     * @return string
     */
    private function _build()
    {
        $textParts = preg_split(self::REGEX, $this->template);
        preg_match_all(self::REGEX, $this->template, $templateParts, PREG_SET_ORDER);
        $partCount = count($templateParts);

        $result = "";
        for ($x = 0; $x < $partCount; $x++) {
            $result .= $this->buildTextPart($textParts[$x]);
            $result .= $this->buildTemplatePart($templateParts[$x][1], $templateParts[$x][2]);
        }
        $result .= $this->buildTextPart($textParts[$x]);

        return $result;
    }

    /**
     * Accepts a JSON-encoded string with the start and end quotation marks chopped off.
     *
     * @param string $template
     * @return string
     */
    public static function build($template)
    {
        return (new self($template))->_build();
    }

    /**
     * Accepts any string with template control characters.
     *
     * @param string $template
     * @return string
     */
    public static function prepareAndBuild($template)
    {
        return self::build(substr(json_encode($template), 1, -1));
    }

    /**
     * @param string $text
     * @param int $indentAdjustBefore The number of levels of indentation to change before formatting the text
     * @param int $indentAdjustAfter The number of levels of indentation to change after formatting the text
     */
    private function formatLine($text, $indentAdjustBefore = 0, $indentAdjustAfter = 0)
    {
        $this->indentation += $indentAdjustBefore;

        $formattedText = str_repeat(" ", $this->indentation * 4 + 4) . $text . "\n";

        $this->indentation += $indentAdjustAfter;

        return $formattedText;
    }

    /**
     * @param string $part
     * @return string
     */
    private function buildTextPart($part)
    {
        return $this->formatLine('result += "' . $part . '";');
    }

    /**
     * @param string $control
     * @param string $inside
     * @return string
     */
    private function buildTemplatePart($control, $inside)
    {
        if ($control === '#') {
            if (strpos($inside, "|") > 0) {
                $exploded = explode("|", $inside, 2);
                return $this->formatLine('result += escaper.escapeHTML(helper["' . $exploded[1] . '"](obj["' . $exploded[0] . '"]));');
            } else {
                // Escape for general HTML
                return $this->formatLine('result += escaper.escapeHTML(obj["' . $inside . '"]);');
            }
        } elseif ($control === '%') {
            // Do not escape
            return $this->formatLine('result += obj["' . $inside . '"];');
        } elseif ($control === '@') {
            $logic = explode(" ", $inside, 2);
            if ($logic[0] === 'if') {
                return $this->formatLine('if (typeof obj["' . $logic[1] . '"] !== "undefined" && obj["' . $logic[1] . '"]) {', 0, 1);
            } elseif ($logic[0] === 'else') {
                return $this->formatLine('} else {', -1, 1);
            } elseif ($logic[0] === 'endif') {
                return $this->formatLine('}', -1, 0);
            }
        }
    }
}
