#!/usr/bin/env bash
docker network create nginx-proxy || true

echo "========================================================================================================="
id -u
id -g

docker network create webproxy || true

make install

NON_BLOG_URLS=5


cat _config.yml | grep -v .dev.zol.fr | grep -q https://ypereirareis.github.io

if [ $? != "0" ]; then
  echo "---------------------------------------"
  echo 'Problem with "site.url" configuration'
  echo "---------------------------------------"
  exit 1
fi


SITEMAP_COUNT=`cat _site/sitemap.xml| grep -E "https?:\/\/[^<]*" | grep -v www.w3.org | wc -l`
echo "---------------------------------------"
echo "$SITEMAP_COUNT URLs in the site map"
echo "---------------------------------------"
cat _site/sitemap.xml| grep -E "https?:\/\/[^<]*" | grep -v www.w3.org
echo "---------------------------------------"
echo ""
echo ""


POSTS_COUNT=`ls -al _posts | grep .markdown | wc -l`
echo "---------------------------------------"
echo "$POSTS_COUNT files in _posts"
echo "---------------------------------------"
ls -al _posts | grep .markdown
echo "---------------------------------------"


if [ "$SITEMAP_COUNT" != "$(($POSTS_COUNT+$NON_BLOG_URLS))" ]; then
  echo "---------------------------------------"
  echo 'Problem with sitemap count'
  echo "---------------------------------------"
  exit 1
fi
