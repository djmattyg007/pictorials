<?php

use MattyG\FBPrivacyAuth\AuthChecker;

class Access
{
    /**
     * @var array
     */
    private static $pathAuthConfig = null;

    /**
     * @var AuthChecker
     */
    private static $checker = null;

    /**
     * @var array
     */
    private static $allowedPaths = null;

    /**
     * @var array
     */
    private static $currentPath = null;

    /**
     * @return array
     */
    private static function buildGroups()
    {
        $select = PicDB::newSelect();
        $select->cols(array("group_id", "user_id"))
            ->from("group_memberships");
        return PicDB::fetch($select, "group");
    }

    /**
     * @return array
     */
    private static function pathAuthConfig()
    {
        if (self::$pathAuthConfig === null) {
            self::$pathAuthConfig = loadPicFile("helpers/pathauthconfig.php");
        }
        return self::$pathAuthConfig;
    }

    /**
     * @return AuthChecker
     */
    private static function getChecker()
    {
        if (self::$checker === null) {
            $groups = self::buildGroups();
            $resources = self::pathAuthConfig();
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
     * @param null|string $userID
     * @return array
     */
    public static function getAllowedPaths($userID = null)
    {
        if ($userID === null) {
            $userID = USER_ID;
        }
        return self::getChecker()->getAllowedResourceIds($userID);
    }

    /**
     * @return int
     */
    public static function verifyCurrentPathAccess()
    {
        if (!isset($_POST["path"]) || !is_numeric($_POST["path"])) {
            sendError(400);
        }
        $pathID = (int) $_POST["path"];
        $allowedPaths = self::getAllowedPaths();
        if (!isset($allowedPaths[$pathID])) {
            sendError(404);
        }
        return $pathID;
    }

    /**
     * @return PicPath
     */
    public static function getCurrentPath()
    {
        if (self::$currentPath !== null) {
            return self::$currentPath;
        }

        $pathID = self::verifyCurrentPathAccess();

        $pathSelect = PicDB::newSelect();
        $pathSelect->cols(array("name", "path"))
            ->from("paths")
            ->where("id = :id")
            ->bindValue("id", $pathID);
        $pathDetails = PicDB::fetch($pathSelect, "one");

        $permSelect = PicDB::newSelect();
        $permSelect->cols(array("permission"))
            ->from("path_permissions")
            ->where("path_id = :path_id")
            ->bindValue("path_id", $pathID);
        $permissions = PicDB::fetch($permSelect, "col");

        self::$currentPath = new PicPath($pathDetails["name"], $pathDetails["path"], $permissions);
        return self::$currentPath;
    }
}
