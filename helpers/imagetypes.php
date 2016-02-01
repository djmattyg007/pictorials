<?php

$imageTypes = json_decode(loadPicFile("conf/app.json"), true)["image_types"];
$allImageTypes = array();
foreach ($imageTypes as $imageType) {
    $allImageTypes = array_merge($allImageTypes, array_merge([$imageType], HoaMimeWrapper::picStaticGetOtherExtensions($imageType)));
}
return $allImageTypes;
