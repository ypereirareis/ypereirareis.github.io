---
title: "Unreachable hosts in Docker containers with external links"
description: "Why a shared service like Mailcatcher becomes unreachable from containers using docker-compose (external) links, and how to work around it."
pubDate: 2015-12-01
updatedDate: 2020-04-09
tags: [platform, infrastructure]
---

I recently added a new service stack in my dev process with docker.
This service stack is composed of many services I can use in different projects managed with **docker-compose**.

One of those services is [mailcatcher](http://mailcatcher.me/)
and is usable with docker thanks to [this image](https://hub.docker.com/r/zolweb/docker-mailcatcher/)...
or many others.

![Docker](../../assets/posts/docker.gif)

## Docker-compose service layer

There are two ways I know to use this **mailcatcher** service inside many projects:

- A **mailcatcher** container for each project (`docker-compose.yml`):

```bash
app:
    build: docker/app
    links:
      - mailcatcher

mailcatcher:
    image: zolweb/docker-mailcatcher

```

- A single **mailcatcher** container for all projects (catching all projects mails):

```bash
sudo docker run -d --name mailcatcher \
    zolweb/docker-mailcatcher
```

and inside your `docker-compose.yml` files:

```bash
app:
    build: docker/app
    external_links:
      - mailcatcher

```

Internally **docker** will automatically add new entry in the `/etc/hosts` file
of each container using the mailcatcher service with the targeted container IP address:

```bash
root@mydomain:/var/www# cat /etc/hosts
127.0.0.1	localhost
::1	localhost ip6-localhost ip6-loopback
fe00::0	ip6-localnet
ff00::0	ip6-mcastprefix
ff02::1	ip6-allnodes
ff02::2	ip6-allrouters
172.17.0.7	mailcatcher mailcatcher_web_1
```

It allows you to use this local domain name instead of the mailcatcher container IP address.
Useful because this IP will change each time the service container is restarted.

## The problem

Using links and external links can lead to problems.
Indeed, sometimes (do not really know why or when) the container that has dependencies on other services **cannot** reach the local host domains at startup.

I can see two reasons for this:

- The service container is starting and the startup process of the main/app container is not finished yet.
- The application you run (apache, nginx,...) starts before the `/etc/hosts` file has been updated internally by docker.

## The solution

So far, the only solution I have to fix the problem is to wait for local domains to become reachable,
thanks to a shell script (you need netcat/nc command installed):

**`docker_wait_hosts.sh`** ([gist](https://gist.github.com/ypereirareis/964cd2d2b608faa371f5))

```bash
wait_single_host() {
  local host=$1
  shift
  local port=$1
  shift

  echo "==> Check host ${host}:${port}"
  while ! nc ${host} ${port} > /dev/null 2>&1 < /dev/null; do echo "   --> Waiting for ${host}:${port}" && sleep 1; done;
}

wait_all_hosts() {
  if [ ! -z "$WAIT_FOR_HOSTS" ]; then
    local separator=':'
    for _HOST in $WAIT_FOR_HOSTS ; do
        IFS="${separator}" read -ra _HOST_PARTS <<< "$_HOST"
        wait_single_host "${_HOST_PARTS[0]}" "${_HOST_PARTS[1]}"
    done
  else
    echo "IMPORTANT : Waiting for nothing because no $WAIT_FOR_HOSTS env var defined !!!"
  fi
}

wait_all_hosts
```

Use this script in the CMD section of the `Dockerfile` or in a custom startup script.

You must set an environment variable to define hosts to wait for (with a specific format HOST:PORT):

- db:3306
- mailcatcher:1080
- google.com:80

```bash
app:
    build: docker/app
    environment:
      WAIT_FOR_HOSTS: db:3306 mailcatcher:1080 google.com:80
    links:
      - db
    external_links:
      - mailcatcher
```

**TIPS:**

- As you can see you can wait for an outside host to become available.
- You can wait for links AND external_links.
