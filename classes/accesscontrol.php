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
     * @var array
     */
    private static $manageAlbumAuthConfig = null;

    /**
     * @var array
     */
    private static $viewAlbumAuthConfig = null;

    /**
     * @var AuthChecker
     */
    private static $pathChecker = null;

    /**
     * @var AuthChecker
     */
    private static $modeChecker = null;

    /**
     * @var AuthChecker
     */
    private static $manageAlbumChecker = null;

    /**
     * @var AuthChecker
     */
    private static $viewAlbumChecker = null;

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
     * @return array
     */
    private static function manageAlbumAuthConfig()
    {
        if (self::$manageAlbumAuthConfig === null) {
            self::$manageAlbumAuthConfig = loadPicFile("helpers/managealbumauthconfig.php");
        }
        return self::$manageAlbumAuthConfig;
    }

    /**
     * @return array
     */
    private static function viewAlbumAuthConfig()
    {
        if (self::$viewAlbumAuthConfig === null) {
            self::$viewAlbumAuthConfig = loadPicFile("helpers/viewalbumauthconfig.php");
        }
        return self::$viewAlbumAuthConfig;
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
     * @return AuthChecker
     */
    private static function getManageAlbumChecker()
    {
        if (self::$manageAlbumChecker === null) {
            $groups = self::buildGroups();
            $resources = self::manageAlbumAuthConfig();
            self::$manageAlbumChecker = new AuthChecker($groups, $resources);
        }
        return self::$manageAlbumChecker;
    }

    /**
     * @return AuthChecker
     */
    private static function getViewAlbumChecker()
    {
        if (self::$viewAlbumChecker === null) {
            $groups = self::buildGroups();
            $resources = self::viewAlbumAuthConfig();
            self::$viewAlbumChecker = new AuthChecker($groups, $resources);
        }
        return self::$viewAlbumChecker;
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
     * @param int $albumID
     * @param null|int $userID
     * @return bool
     */
    public static function manageAlbumCheck($albumID, $userID = null)
    {
        if ($userID === null) {
            $userID = USER_ID;
        }
        return self::getManageAlbumChecker()->check($albumID, $userID);
    }

    /**
     * @param int $albumID
     * @param null|int $userID
     * @return bool
     */
    public static function viewAlbumCheck($albumID, $userID = null)
    {
        if ($userID === null) {
            $userID = USER_ID;
        }
        return self::getViewAlbumChecker()->check($albumID, $userID);
    }

    /**
     * @param null|int $userID
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
     * @param null|int $userID
     * @return array
     */
    public static function getAllowedManageAlbums($userID = null)
    {
        if ($userID === null) {
            $userID = USER_ID;
        }
        $albumIDs = self::getManageAlbumChecker()->getAllowedResourceIds($userID);
        $pathIDs = self::getAllowedPaths($userID);

        $select = PicDB::newSelect();
        $select->from("albums")
            ->cols(array("id"))
            ->where("id IN (:album_ids)")
            ->where("path_id IN (:path_ids)")
            ->bindValue("album_ids", $albumIDs)
            ->bindValue("path_ids", $pathIDs);
        return PicDB::fetch($select, "col");
    }

    /**
     * @param null|int $userID
     * @return array
     */
    public static function getAllowedViewAlbums($userID = null)
    {
        if ($userID === null) {
            $userID = USER_ID;
        }
        $albumIDs = self::getViewAlbumChecker()->getAllowedResourceIds($userID);
        $pathIDs = self::getAllowedPaths($userID);

        $select = PicDB::newSelect();
        $select->from("albums")
            ->cols(array("id"))
            ->where("id IN (:album_ids)")
            ->where("path_id IN (:path_ids)")
            ->bindValue("album_ids", $albumIDs)
            ->bindValue("path_ids", $pathIDs);
        return PicDB::fetch($select, "col");
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
        if (empty($_GET["access_mode"])) {
            sendError(404);
        }
        if ($_GET["access_mode"] === "manage") {
            $allowedAlbums = self::getAllowedManageAlbums();
        } elseif ($_GET["access_mode"] === "view_album") {
            $allowedAlbums = self::getAllowedViewAlbums();
        } else {
            sendError(404);
        }
        $albumID = (int) $_POST["album"];
        if (!in_array($albumID, $allowedAlbums)) {
            sendError(404);
        }
        $album = loadPicFile("helpers/albums/load.php", array("albumID" => $albumID));
        if ($album === null) {
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

    /**
     * @param array $allowed
     */
    public static function verifyCurrentModeAccess(array $allowed)
    {
        if (empty($_GET["access_mode"])) {
            sendError(404);
        }
        switch ($_GET["access_mode"]) {
            case "manage":
            case "view_album":
                if (in_array($_GET["access_mode"], $allowed) === false) {
                    sendError(404);
                }
                if (self::modeCheckAny($_GET["access_mode"]) === false) {
                    sendError(404);
                }
                break;
            default:
                sendError(404);
        }
    }
}
