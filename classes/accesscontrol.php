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
     * @var PicPath
     */
    private static $currentPath = null;

    /**
     * @var PicAlbum
     */
    private static $currentAlbum = null;

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
        if (!in_array($pathID, $allowedPaths)) {
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

        self::$currentPath = loadPicFile("helpers/paths/load.php", array("pathID" => $pathID));
        return self::$currentPath;
    }

    /**
     * @return PicAlbum
     */
    public static function verifyCurrentAlbumAccess()
    {
        if (!isset($_POST["album"]) || !is_numeric($_POST["album"])) {
            sendError(400);
        }
        $albumID = (int) $_POST["album"];
        $album = loadPicFile("helpers/albums/load.php", array("albumID" => $albumID));
        if ($album === null) {
            sendError(404);
        } elseif ($album->userID !== USER_ID) {
            sendError(404);
        }
        $allowedPaths = self::getAllowedPaths();
        if (!in_array($album->pathID, $allowedPaths, true)) {
            sendError(404);
        }
        return $album;
    }

    /**
     * @return PicAlbum
     */
    public static function getCurrentAlbum()
    {
        if (self::$currentAlbum !== null) {
            return self::$currentAlbum;
        }

        self::$currentAlbum = self::verifyCurrentAlbumAccess();
        return self::$currentAlbum;
    }
}
