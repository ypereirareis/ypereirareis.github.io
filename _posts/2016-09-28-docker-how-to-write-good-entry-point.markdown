---
layout: post
title: "How to write a good docker entry point for docker images and containers"
excerpt: "A docker image entry point not following this simple rule will not be correct..."
tags: [docker, entrypoint, entry, point, cmd]
image: docker.gif
comments: true
---

![Docker](/images/posts/docker.gif)

# A good Docker entry point

To create a good docker entry point for your image or your container, you must take care of a simple thing.
**The entry point script must not fail if you run it twice or more.**

Indeed, in a container the data is persisted. If you stop and restart a container without removing it,
the state/data does not change and can leads to errros.

## A bad entry point example.


```
mv /tmp/nginx/conf.d/default /etc/nginx/conf.d/default
nginx &
```

## What is the problem ?

* The first time the container is started, everything works fine.
* The second time the file `/tmp/nginx/conf.d/default` no more exists and the `mv` command generates an error.

To bypass the problem, you can remove the container with `docker rm -f container_id|name` and restart it.

## Conclusion

Test your entry points by executing them twice, at least...
