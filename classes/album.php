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
     * @var string[]
     */
    private $files;

    /**
     * @var string[]
     */
    private $sortedFiles;

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
            return count($this->getFiles());
        } elseif ($property === "pathID") {
            return $this->pathID;
        } elseif ($property === "userID") {
            return $this->userID;
        } elseif ($property === "path") {
            return $this->getPath();
        } elseif ($property === "files") {
            return $this->getFiles();
        } elseif ($property === "sortedFiles") {
            return $this->getSortedFiles();
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
            "picture_count" => count($this->getFiles()),
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

    /**
     * @return Aura\SqlQuery\Common\SelectInterface
     */
    private function prepareFileSelect()
    {
        $select = PicDB::newSelect();
        $select->cols(array("file"))
            ->from("album_files")
            ->where("album_id = :id")
            ->bindValue("id", $this->id);
        return $select;
    }

    /**
     * @return string[]
     */
    private function getFiles()
    {
        if ($this->files === null) {
            $this->files = PicDB::fetch($this->prepareFileSelect(), "col");
        }
        return $this->files;
    }

    /**
     * @return string[]
     */
    private function getSortedFiles()
    {
        if ($this->sortedFiles === null) {
            $select = $this->prepareFileSelect();
            $select->orderBy(array("sort_order ASC"));
            $this->sortedFiles = PicDB::fetch($select, "col");
        }
        return $this->sortedFiles;
    }
}
