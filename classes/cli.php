<?php

use Aura\Cli\CliFactory;
use Aura\Cli\Status;
use Aura\Cli\Stdio;

class PicCLI
{
    const EXIT_FAIL = Status::FAILURE;
    const EXIT_USAGE = Status::USAGE;
    const EXIT_INPUT = Status::DATAERR;

    /**
     * @var Aura\Cli\Context
     */
    private static $context = null;

    /**
     * @var Aura\Cli\Context\Getopt
     */
    private static $getopt = null;

    /**
     * @var AuraStdioWrapper
     */
    private static $io = null;

    /**
     * @param array $globals
     */
    public static function initCLI(array $globals = array())
    {
        $globals = !empty($globals) ? $globals : $GLOBALS;
        self::$context = (new CliFactory())->newContext($globals);
    }

    /**
     * @param array $commands
     * @return string
     */
    public static function initCommandCLI(array $commands)
    {
        if (in_array($GLOBALS["argv"][1], $commands)) {
            $command = $GLOBALS["argv"][1];
        } else {
            throw new Exception(sprintf("Unrecognised command: '%s'", $GLOBALS["argv"][1]));
        }
        $argv = $GLOBALS["argv"];
        unset($argv[1]);
        PicCLI::initCLI(array(
            "_SERVER" => $_SERVER,
            "argv" => array_values($argv),
        ));
        return $command;
    }

    /**
     * @param string $var
     * @param mixed $default
     * @return string
     */
    public static function getEnvVar($var, $default = null)
    {
        return self::$context->server->get($var, $default);
    }

    /**
     * @param array $options
     */
    public static function initGetopt(array $options)
    {
        self::$getopt = self::$context->getopt($options);
    }

    /**
     * @param int|string $key
     * @param mixed $default
     * @return string
     */
    public static function getGetopt($key, $default = null)
    {
        return self::$getopt->get($key, $default);
    }

    /**
     * @return AuraStdioWrapper
     */
    public static function getIO()
    {
        if (self::$io === null) {
            self::$io = new AuraStdioWrapper((new CliFactory())->newStdio());
        }
        return self::$io;
    }

    /**
     * @param string $label
     * @return string
     */
    public static function prompt($label)
    {
        $io = self::getIO();
        $io->out(sprintf("<<magenta>>%s:<<reset>> ", $label));
        return $io->in();
    }

    /**
     * @param string $message
     */
    public static function success($message = "Success!")
    {
        self::getIO()->outln(sprintf("<<green>>%s<<reset>>", $message));
    }

    /**
     * @param string $message
     */
    public static function warn($message)
    {
        self::getIO()->outln(sprintf("<<yellow>>%s<<reset>>", $message));
    }
}

class AuraStdioWrapper
{
    /**
     * @var Stdio
     */
    private $stdio;

    public function __construct(Stdio $stdio)
    {
        $this->stdio = $stdio;
    }

    /**
     * @param string $string
     */
    public function err($string)
    {
        $this->stdio->err("<<red>>{$string}<<reset>>");
    }

    /**
     * @param string $string
     */
    public function errln($string)
    {
        $this->stdio->errln("<<red>>{$string}<<reset>>");
    }

    /**
     * @param string $method
     * @param array $args
     * @return mixed
     */
    public function __call($method, array $args)
    {
        return call_user_func_array(array($this->stdio, $method), $args);
    }
}
