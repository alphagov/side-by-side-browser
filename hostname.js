/*
 *  translate a hostname into the equivalent aka hostname
 */
exports.aka = function(hostname) {
    return hostname.replace(/^/, "aka-").replace(/-*www/,"");
}

/*
 *  deduce the upstream hostname from the requested host
 */
exports.upstream = function(host) {

    if (host && host.match(/\.side-by-side\./)) {
        return host.replace(/\.side-by-side.*$/, "");
    }

    return '';
}
