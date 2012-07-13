#!/bin/sh
#
# build.sh -- builds .deb package(s) for this application and emits their
# names to STDOUT. Requires fpm.
#

cd "$(dirname "$0")"

jsonkey () {
  ruby -rjson -e"puts JSON[STDIN.read]['${1}']"
}

BUILDDIR="build"

PKG_NAME=$(<package.json jsonkey name)
PKG_VERSION=$(git describe --tags)
PKG_PREFIX="/var/apps/review-o-matic-explore"

fpm -s dir -t deb \
  -a all \
  -n "$PKG_NAME" \
  -v "$PKG_VERSION" \
  --prefix "$PKG_PREFIX" \
  . |
jsonkey path
