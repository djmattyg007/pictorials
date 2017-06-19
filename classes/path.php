<?php

class PicPath
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
     * @var string
     */
    private $path;

    /**
     * @var array
     */
    private $permissions;

    /**
     * @param int $id
     * @param string $name
     * @param string $path
     * @param array $permissions
     */
    public function __construct($id, $name, $path, array $permissions)
    {
        $this->id = $id;
        $this->name = $name;
        $this->path = $path;
        $this->permissions = $permissions;
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
        } elseif ($property === "path") {
            return $this->path;
        } else {
            throw new Exception("nope");
        }
    }

    /**
     * @param string $permission
     */
    public function hasPermission($permission)
    {
        return in_array($permission, $this->permissions);
    }
}
