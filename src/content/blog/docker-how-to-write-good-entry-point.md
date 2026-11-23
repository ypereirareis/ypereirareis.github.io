---
title: "How to write a good Docker entry point"
description: "The one rule every Docker entry point must follow: it must not fail when run twice, because a restarted container keeps its previous state."
pubDate: 2016-09-28
updatedDate: 2020-04-09
tags: [platform]
---

## A good Docker entry point

To create a good docker entry point for your image or your container, you must take care of a simple thing.
**The entry point script must not fail if you run it twice or more.**

Indeed, in a container the data is persisted. If you stop and restart a container without removing it,
the state/data does not change and can lead to errors.

### A bad entry point example.

```bash
mv /tmp/nginx/conf.d/default /etc/nginx/conf.d/default
nginx &
```

### What is the problem?

- The first time the container is started, everything works fine.
- The second time the file `/tmp/nginx/conf.d/default` no more exists and the `mv` command generates an error.

To bypass the problem, you can remove the container with `docker rm -f container_id|name` and restart it.

### Conclusion

Test your entry points by executing them twice, at least...
