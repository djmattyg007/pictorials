<?php

use MattyG\MonologCascade\Cascade;

class Logger
{
    /**
     * @param string $name
     * @param string $level
     * @param string $message
     * @param array $context
     */
    public static function log($name, $level, $message, $context = array())
    {
        Cascade::getLogger($name)->log($level, $message, $context);
    }

    /**
     * @param string $methodName The log level
     * @param array $arguments
     */
    public static function __callStatic($methodName, $arguments)
    {
        $name = array_shift($arguments);
        $level = $methodName;
        $message = array_shift($arguments);
        if (empty($arguments)) {
            $context = array();
        } else {
            $context = array_shift($arguments);
        }
        self::log($name, $level, $message, $context);
    }

    /**
     * @param string $jsonConfig
     */
    public function configure($jsonConfig)
    {
        $jsonConfig = str_replace("{{BASE_PATH}}", BASE_PATH, $jsonConfig);
        $config = json_decode($jsonConfig, true);
        Cascade::configure($config);
    }
}

class PictorialsLogProcessor
{
    /**
     * @param array $record
     * @return array
     */
    public function __invoke(array $record)
    {
        if (defined("USERNAME")) {
            $record["extra"]["username"] = USERNAME;
        }
        if (defined("USER_ID")) {
            $record["extra"]["user_id"] = USER_ID;
        }
        return $record;
    }
}
