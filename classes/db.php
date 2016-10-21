<?php

use Aura\SqlQuery\QueryFactory;
use Aura\SqlQuery\AbstractDmlQuery;
use Aura\SqlQuery\Common\SelectInterface;

class PicDB
{
    /**
     * @var QueryFactory
     */
    private static $queryFactory = null;

    /**
     * @var Aura\Sql\ExtendedPdo
     */
    private static $conn = null;

    public static function initDB()
    {
        $dbConf = loadPicFile("conf/db.json");
        self::$queryFactory = new QueryFactory($dbConf["type"], QueryFactory::COMMON);
        self::$conn = loadPicFile("helpers/db/" . $dbConf["type"] . ".php", array("config" => $dbConf["config"]));
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

    /**
     * @return int
     */
    public static function lastInsertId()
    {
        return (int) self::$conn->lastInsertId();
    }
}
