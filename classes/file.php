<?php

class PicFile
{
    /**
     * @var int
     */
    private $id;

    /**
     * @var string
     */
    private $filename;

    /**
     * @var int
     */
    private $pathID;

    /**
     * @var PicPath
     */
    private $path;

    /**
     * @var string
     */
    private $title;

    /**
     * @var string
     */
    private $description;

    /**
     * @var string
     */
    private $author;

    /**
     * @var string
     */
    private $location;

    /**
     * @var string[]
     */
    private $people;

    /**
     * @var string[]
     */
    private $tags;

    /**
     * @param int $id
     * @param string $filename
     * @param int $pathID
     * @param string $title
     * @param string $description
     * @param string $author
     * @param string $location
     */
    public function __construct($id, $filename, $pathID, $title, $description, $author, $location)
    {
        $this->id = $id;
        $this->filename = $filename;
        $this->pathID = $pathID;
        $this->title = $title;
        $this->description = $description;
        $this->author = $author;
        $this->location = $location;
    }

    public function __get($property)
    {
        if ($property === "id") {
            return $this->id;
        } elseif ($property === "filename") {
            return $this->filename;
        } elseif ($property === "pathID") {
            return $this->pathID;
        } elseif ($property === "path") {
            return $this->getPath();
        } elseif ($property === "title") {
            return $this->title;
        } elseif ($property === "description") {
            return $this->description;
        } elseif ($property === "author") {
            return $this->author;
        } elseif ($property === "location") {
            return $this->location;
        } elseif ($property === "people") {
            return $this->getPeople();
        } elseif ($property === "tags") {
            return $this->getTags();
        } else {
            throw new Exception("nope");
        }
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
     * @return string[]
     */
    private function getPeople()
    {
        if ($this->people === null) {
            $select = PicDB::newSelect();
            $select->cols(array("name"))
                ->from("file_metadata_people")
                ->where("file_id = :id")
                ->bindValue("id", $this->id);
            $this->people = PicDB::fetch($select, "col");
        }
        return $this->people;
    }

    /**
     * @return string[]
     */
    private function getTags()
    {
        if ($this->tags === null) {
            $select = PicDB::newSelect();
            $select->cols(array("tag"))
                ->from("file_metadata_tags")
                ->where("file_id = :id")
                ->bindValue("id", $this->id);
            $this->tags = PicDB::fetch($select, "col");
        }
        return $this->tags;
    }
}
