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
    private static $paths = null;

    /**
     * @return AuthChecker
     */
    private static function getChecker()
    {
        if (self::$checker === null) {
            $groups = json_decode(loadPicFile("conf/auth.json"), true)["groups"];
            self::$paths = json_decode(loadPicFile("conf/paths.json"), true);
            $resources = array_column_maintain_keys(self::$paths, "auth");
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
        return array_intersect_key(self::$paths, array_flip($allowedPathIDs));
    }
}
