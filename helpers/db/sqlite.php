<?php

$pdo = new Aura\Sql\ExtendedPdo("sqlite:" . $config["path"]);
$pdo->exec("PRAGMA foreign_keys = ON");
return $pdo;
