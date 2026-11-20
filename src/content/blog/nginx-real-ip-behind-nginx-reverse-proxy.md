---
title: "Get the real user IP in Nginx behind an Nginx reverse proxy"
description: "Behind a reverse proxy, Nginx only sees the proxy IP. Configure the realip module to log and use the real IP address of your users."
pubDate: 2017-02-15
updatedDate: 2020-04-09
tags: [infrastructure]
---

Behind a reverse proxy, the user IP we get is often the reverse proxy IP itself. But for obvious reasons it's important to have access to the user real ip address.

![Docker](../../assets/posts/nginx.gif)

## Nginx reverse proxy configuration

_Tested for nginx/1.11.8_

The `http_realip_module` must be installed (`--with-http_realip_module`), of course!

Use this command to check:

```bash
2>&1 nginx -V | tr -- - '\n' | grep http_realip_module
```

- We need to tell the reverse proxy to pass information to the backend nginx server.
- We can add those lines as a global configuration or per location.

```bash
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $proxy_x_forwarded_proto;
```

## Nginx backend configuration

- We can add a custom log format and use it in addition with others.

```bash
http {

  # ...

    ##
    # Logging Settings
    ##

    log_format specialLog '$remote_addr forwarded for $http_x_real_ip - $remote_user [$time_local]  '
                          '"$request" $status $body_bytes_sent '
                          '"$http_referer" "$http_user_agent"';

    access_log /var/log/nginx/access-special.log specialLog;
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # ...

}
```

- Or we can override the default log format.

```bash
http {

  # ...

    ##
    # Logging Settings
    ##
    log_format combined '$http_x_real_ip - $remote_user [$time_local] '
                        '"$request" $status $body_bytes_sent '
                        '"$http_referer" "$http_user_agent"';

    access_log /var/log/nginx/access.log combined;
    error_log /var/log/nginx/error.log;

    # ...

}
```

### Be careful

In some cases you will need to add this configuration:

```bash
set_real_ip_from x.x.x.x/x; # Ip/network of the reverse proxy (or ip received into REMOTE_ADDR)
real_ip_header X-Forwarded-For;
```

## Resources

- [https://easyengine.io/tutorials/nginx/forwarding-visitors-real-ip/](https://easyengine.io/tutorials/nginx/forwarding-visitors-real-ip/)
