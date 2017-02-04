<?php

class PicDBInstall
{
    /**
     * @return array
     */
    public static function configure()
    {
        $io = PicCLI::getIO();

        $io->outln("Please specify the full path to where the SQLite database file should be created.");
        $path = PicCLI::prompt("Path");
        if (!$path) {
            $io->errln("No path specified.");
            exit(PicCLI::EXIT_INPUT);
        }
        if ($path[0] !== "/") {
            $io->errln("Must provide absolute path.");
            exit(PicCLI::EXIT_INPUT);
        }
        if (file_exists($path)) {
            $io->errln("Path to database file already exists.");
            exit(PicCLI::EXIT_INPUT);
        }
        if (!is_writeable(dirname($path))) {
            $io->errln("The current user does not have permission to write to that directory.");
            exit(PicCLI::EXIT_INPUT);
        }

        return array("path" => $path);
    }

    /**
     * @param array $config
     */
    public static function create(array $config)
    {
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
            auth_id INTEGER NOT NULL,
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
        $conn->exec("INSERT INTO system (key, value) VALUES ('version', '" . VERSION . "')");
    }
}