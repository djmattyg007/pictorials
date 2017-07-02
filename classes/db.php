<?php

use Aura\Sql\ExtendedPdo;
use Aura\SqlQuery\AbstractDmlQuery;
use Aura\SqlQuery\Common\SelectInterface;
use Aura\SqlQuery\QueryFactory;

class PicDB
{
    /**
     * @var QueryFactory
     */
    private static $queryFactory = null;

    /**
     * @var ExtendedPdo
     */
    private static $conn = null;

    /**
     * @var string
     */
    private static $dbType = null;

    /**
     * @return ExtendedPdo
     */
    public static function initDB()
    {
        $dbConf = loadPicFile("conf/db.json");
        self::$queryFactory = new QueryFactory($dbConf["type"], QueryFactory::COMMON);
        self::$conn = loadPicFile("helpers/db/" . $dbConf["type"] . ".php", array("config" => $dbConf["config"]));
        self::$dbType = $dbConf["type"];
        return self::$conn;
    }

    /**
     * @return string
     */
    public static function getDBType()
    {
        return self::$dbType;
    }

    /**
     * @return SelectInterface
     */
    public static function newSelect()
    {
        return self::$queryFactory->newSelect();
    }

    /**
     * @return Aura\SqlQuery\Common\InsertInterface
     */
    public static function newInsert()
    {
        return self::$queryFactory->newInsert();
    }

    /**
     * @return Aura\SqlQuery\Common\UpdateInterface
     */
    public static function newUpdate()
    {
        return self::$queryFactory->newUpdate();
    }

    /**
     * @return Aura\SqlQuery\Common\DeleteInterface
     */
    public static function newDelete()
    {
        return self::$queryFactory->newDelete();
    }

    /**
     * @param SelectInterface $select
     * @param string $mode
     * @param int|null $extraArg
     * @return array|string|false
     */
    public static function fetch(SelectInterface $select, $mode = "assoc", $extraArg = null)
    {
        $method = "fetch" . ucwords($mode);
        if ($extraArg === null) {
            return self::$conn->{$method}($select->getStatement(), $select->getBindValues());
        } else {
            return self::$conn->{$method}($select->getStatement(), $select->getBindValues(), $extraArg);
        }
    }

    /**
     * @param AbstractDmlQuery $crudObj
     */
    public static function crud(AbstractDmlQuery $crudObj)
    {
        self::$conn->perform($crudObj->getStatement(), $crudObj->getBindValues());
    }

    public function beginTransaction()
    {
        self::$conn->beginTransaction();
    }

    public function commit()
    {
        self::$conn->commit();
    }

    /**
     * @return int
     */
    public static function lastInsertId()
    {
        return (int) self::$conn->lastInsertId();
    }

    /**
     * @param string $key
     * @return mixed
     */
    public static function getSystemVal($key)
    {
        $select = self::newSelect();
        $select->cols(array("value"))
            ->from("system")
            ->where("key = :key")
            ->bindValue("key", $key);
        return self::fetch($select, "value");
    }
}
