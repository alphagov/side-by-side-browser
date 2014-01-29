/*
 *  translate a hostname into the equivalent aka hostname
 */
exports.aka = function(hostname) {
    return hostname.replace(/^/, "aka-").replace(/-*www/,"");
}
