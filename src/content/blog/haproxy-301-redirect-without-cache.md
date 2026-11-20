---
title: "Doing a (301) redirect with HAPROXY without cache"
description: "You are on the good page if you want to know how to do a redirect without cache with haproxy"
pubDate: 2019-06-04
updatedDate: 2020-04-09
tags: [infrastructure]
---

![Docker](../../assets/posts/haproxy.gif)

## Example configuration for haproxy.cfg

```bash
acl example-1 hdr(host) -i example-1.com
acl example-2 hdr(host) -i example-2.com

http-request redirect location https://www.%[hdr(host)]%[url]\r\nCache-Control:\ no-cache,\ no-store,\ max-age=0,\ must-revalidate code 301 if example-1 or example-2
```
