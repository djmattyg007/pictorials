<?php

use MattyG\FBPrivacyAuth\AuthChecker;

class Access
{
    /**
     * @var array
     */
    private static $groups = null;

    /**
     * @var array
     */
    private static $pathAuthConfig = null;

    /**
     * @var array
     */
    private static $modeAuthConfig = null;

    /**
     * @var AuthChecker
     */
    private static $pathChecker = null;

    /**
     * @var AuthChecker
     */
    private static $modeChecker = null;

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
        if (self::$groups === null) {
            $select = PicDB::newSelect();
            $select->cols(array("group_id", "user_id"))
                ->from("group_memberships");
            self::$groups = PicDB::fetch($select, "group");
        }
        return self::$groups;
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
     * @return array
     */
    private static function modeAuthConfig()
    {
        if (self::$modeAuthConfig === null) {
            self::$modeAuthConfig = loadPicFile("helpers/modeauthconfig.php");
        }
        return self::$modeAuthConfig;
    }

    /**
     * @return AuthChecker
     */
    private static function getPathChecker()
    {
        if (self::$pathChecker === null) {
            $groups = self::buildGroups();
            $resources = self::pathAuthConfig();
            self::$pathChecker = new AuthChecker($groups, $resources);
        }
        return self::$pathChecker;
    }

    /**
     * @return AuthChecker
     */
    private static function getModeChecker()
    {
        if (self::$modeChecker === null) {
            $groups = self::buildGroups();
            $resources = self::modeAuthConfig();
            self::$modeChecker = new AuthChecker($groups, $resources);
        }
        return self::$modeChecker;
    }

    /**
     * @param int $pathID
     * @param null|int $userID
     * @return bool
     */
    public static function check($pathID, $userID = null)
    {
        if ($userID === null) {
            $userID = USER_ID;
        }
        return self::getPathChecker()->check($pathID, $userID);
    }

    /**
     * @param string|string[] $modeType
     * @param null|int $userID
     * @return bool
     */
    public static function modeCheckAny($modeType, $userID = null)
    {
        if ($userID === null) {
            $userID = USER_ID;
        }
        $modeChecker = self::getModeChecker();
        if (is_array($modeType)) {
            foreach ($modeType as $_modeType) {
                if ($modeChecker->check($_modeType, $userID)) {
                    return true;
                }
            }
            return false;
        } else {
            return $modeChecker->check($modeType, $userID);
        }
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
        return self::getPathChecker()->getAllowedResourceIds($userID);
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
