<?php

$album = Access::getCurrentAlbum();
header("Content-type: application/json");
echo json_encode($album);
