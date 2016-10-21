<?php

class PicPath
{
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
     * @param string $name
     * @param string $path
     * @param array $permissions
     */
    public function __construct($name, $path, array $permissions)
    {
        $this->name = $name;
        $this->path = $path;
        $this->permissions = $permissions;
    }

    /**
     * @param string $property
     * @return string
     */
    public function __get($property)
    {
        if ($property === "name") {
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
