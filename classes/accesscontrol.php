<?php

use MattyG\FBPrivacyAuth\AuthChecker;

class Access
{
    /**
     * @var AuthChecker
     */
    private static $checker = null;

    /**
     * @var array
     */
    private static $allPaths = null;

    /**
     * @var array
     */
    private static $currentPathConfig = null;

    /**
     * @return array
     */
    private static function allPaths()
    {
        if (self::$allPaths === null) {
            self::$allPaths = loadPicFile("conf/paths.json");
        }
        return self::$allPaths;
    }

    /**
     * @return AuthChecker
     */
    private static function getChecker()
    {
        if (self::$checker === null) {
            $groups = loadPicFile("conf/auth.json")["groups"];
            $resources = array_column_maintain_keys(self::allPaths(), "auth");
            self::$checker = new AuthChecker($groups, $resources);
        }
        return self::$checker;
    }

    /**
     * @param int $pathID
     * @param null|string $username
     * @return bool
     */
    public static function check($pathID, $username = null)
    {
        if ($username === null) {
            $username = USERNAME;
        }
        return self::getChecker()->check($pathID, $username);
    }

    /**
     * @param null|string $username
     * @return array
     */
    public static function getAllowedPaths($username = null)
    {
        if ($username === null) {
            $username = USERNAME;
        }
        $allowedPathIDs = self::getChecker()->getAllowedResourceIds($username);
        return array_intersect_key(self::allPaths(), array_flip($allowedPathIDs));
    }

    /**
     * @return array
     */
    public static function getCurrentPathConfig()
    {
        if (self::$currentPathConfig !== null) {
            return self::$currentPathConfig;
        }
        if (!isset($_POST["path"]) || !is_numeric($_POST["path"])) {
            sendError(400);
        }
        $paths = self::getAllowedPaths();
        $pathID = (int) $_POST["path"];
        if (!isset($paths[$pathID])) {
            sendError(404);
        }
        self::$currentPathConfig = $paths[$pathID];
        return self::$currentPathConfig;
    }
}
