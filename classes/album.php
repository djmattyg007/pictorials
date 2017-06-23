<?php

class PicAlbum implements JsonSerializable
{
    /**
     * @return int
     */
    private $id;

    /**
     * @var string
     */
    private $name;

    /**
     * @var int
     */
    private $pictureCount = 0;

    /**
     * @var int
     */
    private $pathID;

    /**
     * @var int
     */
    private $userID;

    /**
     * @var PicPath
     */
    private $path;

    /**
     * @param int $id
     * @param string $name
     * @param int $pathID
     * @param int $userID
     */
    public function __construct($id, $name, $pathID, $userID)
    {
        $this->id = $id;
        $this->name = $name;
        $this->pathID = $pathID;
        $this->userID = $userID;
    }

    /**
     * @param string $property
     * @return string|int
     */
    public function __get($property)
    {
        if ($property === "id") {
            return $this->id;
        } elseif ($property === "name") {
            return $this->name;
        } elseif ($property === "pictureCount") {
            return $this->pictureCount;
        } elseif ($property === "pathID") {
            return $this->pathID;
        } elseif ($property === "userID") {
            return $this->userID;
        } elseif ($property === "path") {
            return $this->getPath();
        } else {
            throw new Exception("nope");
        }
    }

    /**
     * @return array
     */
    public function jsonSerialize()
    {
        return array(
            "id" => $this->id,
            "name" => $this->name,
            "picture_count" => $this->pictureCount,
            "path_name" => $this->getPath()->name,
        );
    }

    /**
     * @return PicPath
     */
    private function getPath()
    {
        if ($this->path === null) {
            $this->path = loadPicFile("helpers/paths/load.php", array("pathID" => $this->pathID));
        }
        return clone $this->path;
    }
}
