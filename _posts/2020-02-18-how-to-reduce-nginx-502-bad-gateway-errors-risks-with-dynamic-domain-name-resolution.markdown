---
layout: post
title: "How to reduce Nginx 502 bad gateway errors and risks with dynamic domain name resolution for proxy_pass and fastcgi_pass"
excerpt: "When deploying a projet it's a very common case to have 502 Bad gateway error as PHP-FPM is restarting while Nginx is still up and running. But we can avoid Nginx reload or restart and reduce 502 Bad gateway errors"
tags: [nginx, error, 502, bad gateway, php-fpm, php, fpm, dns, dynamic, domain name, resolution, connection refused, server failure, no route to host]
image: nginx.png
comments: true
---

![PHP-FPM](/images/posts/nginx.png)

# TLDR: questions answered in this article.

* How to avoid Nginx reload on php-fpm restart ?
* How to reduce 502 Bad gateway errors with Nginx and php-fpm ?
* How to configure dynamic domain name (DNS) resolution in Nginx ?

# Nginx common errors leading to 502 Bad Gateway

```bash
[error] 12#0: *16 connect() failed (111: Connection refused) while connecting to upstream
```

```bash
[error] 12#0: *20 php could not be resolved (2: Server failure)
```

```bash
[error] 12#0: *36 connect() failed (113: No route to host) while connecting to upstream
```

# A common PHP upstream configuration generating problems

**/etc/nginx/conf.d/upstream.conf**

```bash
upstream php-upstream { server php:9000; }
```

**/etc/nginx/sites-enabled/app.conf**

```bash
server {
    root /var/www/html/web;
    listen *:80;
    location ~ ^/index\.php(/|$) {
        fastcgi_pass php-upstream;
        ...
        internal;
    }
}
```

With that kind of configuration the domain name resolution for "php" is done only once when Nginx is started or reloaded.
So any problem with php-fpm going down for instance, will need a restart or reload for Nginx.
**It's not a very resilient configuration.**

Let's say we are running PHP-FPM in a docker container
and our container is restarted by the orchestrator, or we deploy a new version of our stack not including any Nginx changes we will need to restart or reload Nginx too or we will have a lot of 502 Bad Gateway errors.
**To avoid this we need to use dynamic domain name resolution !!!**

# Dynamic domain name resolution configuration for Nginx

## Resources

* [https://github.com/rancher/rancher/issues/7691#issuecomment-277635645](https://github.com/rancher/rancher/issues/7691#issuecomment-277635645)
* [https://stackoverflow.com/questions/35744650/docker-network-nginx-resolver#answer-37656784](https://stackoverflow.com/questions/35744650/docker-network-nginx-resolver#answer-37656784)
* [https://www.nginx.com/blog/dns-service-discovery-nginx-plus/#Methods-for-Service-Discovery-with-DNS-for-NGINX-and-NGINX&nbsp;Plus](https://www.nginx.com/blog/dns-service-discovery-nginx-plus/#Methods-for-Service-Discovery-with-DNS-for-NGINX-and-NGINX&nbsp;Plus)

**No more upstream configuration needed !!!** 

And the application configuration file becomes: 

**/etc/nginx/sites-enabled/app.conf**

```bash
server {
    root /var/www/html/web;
    listen *:80;
    location ~ ^/index\.php(/|$) {
        resolver 127.0.0.11 valid=10s ipv6=off;
        set $backendfpm "php:9000";
        fastcgi_pass $backendfpm;
        ...
        internal;
    }
}
```

* **127.0.0.11** is the internal docker DNS address name.
* **valid=10s** because we want to re‑resolve names every 10 seconds.
* **ipv6=off** because we do not want to use IPv6.
* **fastcgi_pass $backendfpm;** would be the same for proxy_pass.

When you use a variable to specify the domain name in the proxy_pass directive,
NGINX re‑resolves the domain name when its TTL expires.
You must include the resolver directive to explicitly specify the name server (NGINX does not refer to /etc/resolv.conf as in the first two methods).
By including the valid parameter to the resolver directive, you can tell NGINX to ignore the TTL and re‑resolve names at a specified frequency instead.
Here we tell NGINX to re‑resolve names every 10 seconds.

This method eliminates two drawbacks of the first method,
in that the NGINX startup or reload operation doesn’t fail when the domain name can’t be resolved,
and we can control how often NGINX re‑resolves the name.

# Docker Swarm and Kubernetes

It's a common problem with docker Swarm and Kubernetes as everything is containerized and a lot of networking stuffs comes into game.

## Docker swarm services

**Let's take this simple docker Swarm configuration**

```yaml
version: '3.5'
services:
  php:
    image: private.docker-registry.tld/php
    networks:
    - default
  nginx:
    image: private.docker-registry.tld/nginx
    networks:
    - default
    ports:
    - 80:80
networks:
  default:
```

* Then start this docker swarm stack

```bash
docker stack deploy -c docker-compose.yml --with-registry-auth my-super-project
```

* You will have 2 services starting one for nginx, one for php

```bash
>{% raw %}docker service ls --format="{{.Name}}" | grep my-super-project{% endraw %}
my-super-project_nginx
my-super-project_php
```

* You will have 1 network created for the entire stack

```bash
>{% raw %}docker network ls --format="{{.Name}}" | grep my-super-project{% endraw %}
my-super-project_default
```

* You will have many containers (some for nginx, some for php)

```bash
>{% raw %}docker stack ps my-super-project --format="{{.ID }} {{.Node }} {{.Name}}"{% endraw %}
v15bn01z2yd3 node01 my-super-project_php.1
v236jgodsm4k node02 my-super-project_nginx.1
7omiwzm4i1wj node02 my-super-project_php.2
g9c55nzn13lr node01 my-super-project_nginx.2
```

* Then, go into a nginx container and then ping PHP

```bash
>docker exec -it my-super-project_nginx.2.g9c55nzn13lr5z0kulegfpu0q bash
root@node01:/# ping php
PING php (10.224.248.16) 56(84) bytes of data.
64 bytes from 10.224.248.16: icmp_seq=1 ttl=64 time=0.353 ms
```

**But what is this IP address ?**

* It's not so obvious to find out the first time. It's actually the (virtual) IP of the PHP service: **my-super-project_php**.
* And this PHP service is associated to the network to act as a load balancer between PHP containers.
* And it's this particular IP that is resolved by Nginx.

**How to find this IP in the docker networking mess ?**

Please note the important `--verbose` option here

```bash
docker network inspect my-super-project_default --verbose
```

```yaml
"my-super-project_php": {
    "VIP": "10.224.248.16",
    "Ports": [],
    "LocalLBIndex": 2646,
    "Tasks": [
        {
            "Name": "my-super-project_php.1.v15bn01z2yd3q5ftu7aog87pg",
            ...
        },
        {
            "Name": "my-super-project_php.2.7omiwzm4i1wj1whqfuwku6921",
            ...
        }
    ]
},
```

* **AND NOW...**, if you want to have a big beautiful 502 Bad gateway error, just remove this PHP service.

No more ways to contact PHP containers.

```bash
docker service rm my-super-project_php
```

* Start this service again and you will see that this vurtual IP has changed, so a re-resolution domain name is required for Nginx

**Tadaaam!!**
