---
title: "Get the real client IP in Nginx behind HAProxy"
description: "Behind HAProxy, Nginx only sees the proxy IP. Forward and trust the client address to log and use the real IP of your users."
pubDate: 2019-06-04
updatedDate: 2020-04-09
tags: [infrastructure]
---

![Docker](../../assets/posts/haproxy.gif)

## Define a header in haproxy configuration to set real client IP address

In haproxy, you can get the client IP address from the request and pass it to another proxy or application with a header.

- `%[src]` is the client IP address extracted from incoming request.
- `X-Real-IP` is the header we use to transfer IP address value.

```bash
frontend all_https
  option forwardfor header X-Real-IP
  http-request set-header X-Real-IP %[src]
```

## Configure a custom log format in Nginx

- Add a custom log format named "realip" (but name it the way you want...)

```bash
log_format realip '$http_x_real_ip - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent '
                    '"$http_referer" "$http_user_agent"';
```

- Use it in your `access_log` directive

```bash
access_log /dev/stdout realip;
access_log /path_to/log/file realip;
```
