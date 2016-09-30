<?php

class_alias("\\Psr\\Log\\LogLevel", "LogLevel");
loadPicFile("classes/logger.php");
Logger::configure(loadPicFile("conf/logging.json", array(), true));
