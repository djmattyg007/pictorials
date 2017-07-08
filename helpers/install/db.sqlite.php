<?php

use Aura\Sql\ExtendedPdo;

class PicDBInstall
{
    /**
     * @return array
     */
    public static function configure()
    {
        $io = PicCLI::getIO();

        if (!($path = PicCLI::getGetopt("--sqlite-path"))) {
            $io->outln("Please specify the full path to where the SQLite database file should be created.");
            $path = PicCLI::prompt("Path");
            if (!$path) {
                $io->errln("No path specified.");
                exit(PicCLI::EXIT_INPUT);
            }
        }
        if ($path[0] !== "/") {
            $io->errln("The SQLite database file path must be absolute, not relative.");
            exit(PicCLI::EXIT_INPUT);
        }
        if (file_exists($path)) {
            $io->errln("The path to SQLite database file already exists.");
            exit(PicCLI::EXIT_INPUT);
        }
        if (!is_writeable(dirname($path))) {
            $io->errln("The current user does not have permission to write to the SQLite database directory.");
            exit(PicCLI::EXIT_INPUT);
        }

        return array("path" => $path);
    }

    /**
     * @param array $config
     */
    public static function create(array $config)
    {
        /** @var $conn ExtendedPdo */
        $conn = loadPicFile("helpers/db/sqlite.php", array("config" => $config));

        $conn->exec("CREATE TABLE system (
            key TEXT NOT NULL,
            value TEXT NOT NULL
        )");
        $conn->exec("CREATE TABLE users (
            id INTEGER PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )");
        $conn->exec("CREATE TABLE groups (
            id INTEGER PRIMARY KEY NOT NULL,
            name TEXT UNIQUE NOT NULL
        )");
        $conn->exec("CREATE TABLE group_memberships (
            id INTEGER PRIMARY KEY NOT NULL,
            group_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
            UNIQUE (group_id, user_id)
        )");
        $conn->exec("CREATE TABLE mode_access (
            id INTEGER PRIMARY KEY NOT NULL,
            mode_type TEXT NOT NULL CHECK (mode_type IN ('manage', 'view_album')),
            auth_type TEXT NOT NULL CHECK (auth_type IN ('allow', 'deny')),
            id_type TEXT NOT NULL CHECK (id_type IN ('users', 'groups')),
            auth_id INTEGER NOT NULL CHECK (auth_id > 0),
            UNIQUE (mode_type, auth_type, id_type, auth_id)
        )");
        $conn->exec("CREATE TABLE paths (
            id INTEGER PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            path TEXT NOT NULL,
            sort_order INTEGER NOT NULL DEFAULT 1
        )");
        $conn->exec("CREATE TABLE path_permissions (
            id INTEGER PRIMARY KEY NOT NULL,
            path_id INTEGER NOT NULL,
            permission TEXT NOT NULL,
            FOREIGN KEY (path_id) REFERENCES paths (id) ON DELETE CASCADE ON UPDATE CASCADE,
            UNIQUE (path_id, permission)
        )");
        $conn->exec("CREATE TABLE path_access (
            id INTEGER PRIMARY KEY NOT NULL,
            path_id INTEGER NOT NULL,
            auth_type TEXT NOT NULL CHECK (auth_type IN ('allow', 'deny')),
            id_type TEXT NOT NULL CHECK (id_type IN ('users', 'groups')),
            auth_id INTEGER NOT NULL CHECK (auth_id > 0),
            FOREIGN KEY (path_id) REFERENCES paths (id) ON DELETE CASCADE ON UPDATE CASCADE,
            UNIQUE (path_id, auth_type, id_type, auth_id)
        )");
        $conn->exec("CREATE TABLE shares (
            id INTEGER PRIMARY KEY NOT NULL,
            share_id TEXT UNIQUE NOT NULL,
            path_id INTEGER NOT NULL,
            files TEXT NOT NULL,
            FOREIGN KEY (path_id) REFERENCES paths (id) ON DELETE CASCADE ON UPDATE CASCADE,
            UNIQUE (path_id, files)
        )");
        $conn->exec("CREATE TABLE albums (
            id INTEGER PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            user_id INTEGER NOT NULL,
            path_id INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (path_id) REFERENCES paths (id) ON DELETE CASCADE ON UPDATE CASCADE
        )");
        $conn->exec("CREATE TABLE album_files (
            id INTEGER PRIMARY KEY NOT NULL,
            album_id INTEGER NOT NULL,
            file TEXT NOT NULL,
            sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order > 0),
            FOREIGN KEY (album_id) REFERENCES albums (id) ON DELETE CASCADE ON UPDATE CASCADE,
            UNIQUE (album_id, file)
        )");
        $conn->exec("INSERT INTO system (key, value) VALUES ('version', '" . VERSION . "')");
    }

    /**
     * @param ExtendedPdo $conn
     * @param string $oldVersion
     */
    public static function upgrade(ExtendedPdo $conn, $oldVersion)
    {
        if (version_compare($oldVersion, "0.4.0-dev2", "<") === true) {
            $conn->exec("CREATE TABLE albums (
                id INTEGER PRIMARY KEY NOT NULL,
                name TEXT NOT NULL,
                user_id INTEGER NOT NULL,
                path_id INTEGER NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY (path_id) REFERENCES paths (id) ON DELETE CASCADE ON UPDATE CASCADE
            )");

            $conn->exec("CREATE TABLE album_files (
                id INTEGER PRIMARY KEY NOT NULL,
                album_id INTEGER NOT NULL,
                file TEXT NOT NULL,
                FOREIGN KEY (album_id) REFERENCES albums (id) ON DELETE CASCADE ON UPDATE CASCADE,
                UNIQUE (album_id, file)
            )");
        }

        if (version_compare($oldVersion, "0.4.0-dev3", "<") === true) {
            $conn->exec("ALTER TABLE album_files
                ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order > 0)
            ");
        }

        if (version_compare($oldVersion, "0.4.0-dev4", "<") === true) {
            $conn->beginTransaction();
            $select = PicDB::newSelect();
            $select->cols(array("id", "password"))
                ->from("users");
            $passwords = PicDB::fetch($select, "pairs");
            foreach ($passwords as $id => $password) {
                $hash = password_hash($password, PASSWORD_DEFAULT);
                $update = PicDB::newUpdate();
                $update->table("users")
                    ->cols(array("password" => $hash))
                    ->where("id = :id")
                    ->bindValue("id", (int) $id);
                PicDB::crud($update);
            }
            $conn->commit();
        }

        if (version_compare($oldVersion, "0.4.0-dev5", "<") === true) {
            $conn->exec("CREATE TABLE mode_access (
                id INTEGER PRIMARY KEY NOT NULL,
                mode_type TEXT NOT NULL CHECK (mode_type IN ('manage', 'view_album')),
                auth_type TEXT NOT NULL CHECK (auth_type IN ('allow', 'deny')),
                id_type TEXT NOT NULL CHECK (id_type IN ('users', 'groups')),
                auth_id INTEGER NOT NULL CHECK (auth_id > 0),
                UNIQUE (mode_type, auth_type, id_type, auth_id)
            )");

            $conn->beginTransaction();
            $conn->exec("CREATE TABLE path_access_new (
                id INTEGER PRIMARY KEY NOT NULL,
                path_id INTEGER NOT NULL,
                auth_type TEXT NOT NULL CHECK (auth_type IN ('allow', 'deny')),
                id_type TEXT NOT NULL CHECK (id_type IN ('users', 'groups')),
                auth_id INTEGER NOT NULL CHECK (auth_id > 0),
                FOREIGN KEY (path_id) REFERENCES paths (id) ON DELETE CASCADE ON UPDATE CASCADE,
                UNIQUE (path_id, auth_type, id_type, auth_id)
            )");
            $conn->exec("INSERT INTO path_access_new SELECT * FROM path_access");
            $conn->exec("DROP TABLE path_access");
            $conn->exec("ALTER TABLE path_access_new RENAME TO path_access");
            $conn->commit();
        }

        if (version_compare($oldVersion, "0.4.0-dev6", "<") === true) {
            $conn->exec("CREATE TABLE view_album_access (
                id INTEGER PRIMARY KEY NOT NULL,
                album_id INTEGER NOT NULL,
                auth_type TEXT NOT NULL CHECK (auth_type IN ('allow', 'deny')),
                id_type TEXT NOT NULL CHECK (id_type IN ('users', 'groups')),
                auth_id INTEGER NOT NULL CHECK (auth_id > 0),
                FOREIGN KEY (album_id) REFERENCES albums (id) ON DELETE CASCADE ON UPDATE CASCADE,
                UNIQUE (album_id, auth_type, id_type, auth_id)
            )");
        }
    }
}
