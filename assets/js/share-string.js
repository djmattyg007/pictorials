function ShareString(base64)
{
    this.base64 = base64;
}

ShareString.PART_SEPARATOR = ":";

ShareString.prototype = {
    decode: function(shareString) {
        var parts = shareString.split(ShareString.PART_SEPARATOR);
        var pathID = parts.shift();
        return {
            "pathID": pathID,
            "files": parts
        };
    },

    decodeBase64: function(base64ShareString) {
        var shareString;
        try {
            shareString = this.base64.base64ToUtf8(base64ShareString);
        } catch (e) {
            // The caller doesn't care about why the string was invalid
            throw new Error("Invalid share string supplied.");
        }
        return this.decode(shareString);
    },

    encode: function(pathID, files) {
        var partsEncoded = files.join(ShareString.PART_SEPARATOR);
        return pathID + ShareString.PART_SEPARATOR + partsEncoded;
    },

    encodeBase64: function(pathID, files) {
        var base64Value;
        try {
            base64Value = this.base64.utf8ToBase64(this.encode(pathID, files));
        } catch (e) {
            // The caller doesn't care about why we couldn't encode the file info
            throw new Error("Failed to encode file info.");
        }
        return base64Value;
    }
};
