---
layout: post
title: "Get real client IP address in NGINX behind HAPROXY reverse proxy"
excerpt: "It's often really useful to get and store real user ip address of users browsing your website. Let's see how to do it with Nginx behind haproxy reverse proxy."
tags: [nginx, haproxy, client, ip, address, real, header, forwardfor ]
image: haproxy.png
comments: true
---

![Docker](/images/posts/haproxy.png)

# Define a header in haproxy configuration to set real client IP address

In haproxy, you can get the client IP address from the request and pass it to another prox or application with a header.

* `%[src]` is the client IP address extracted from incoming request.
* `X-Real-IP` is the header we use to transfer IP address value.

```bash
frontend all_https
  option forwardfor header X-Real-IP
  http-request set-header X-Real-IP %[src]
```

# Configure a custom log format in Nginx

* Add a custom log format named "realip" (but name it the way you want...)

```bash
log_format realip '$http_x_real_ip - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent '
                    '"$http_referer" "$http_user_agent"';
```

* Use it in your `access_log` directive

```bash
access_log /dev/stdout realip;
access_log /path_to/log/file realip;
```