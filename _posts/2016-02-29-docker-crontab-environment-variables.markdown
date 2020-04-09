---
layout: post
title: "Access environment variables from crontab into a docker container"
excerpt: "How to use docker environment variables from a crontab running inside a docker container."
tags: [docker, crontab, cron, environment, variables, env, vars, var, source]
image: docker.gif
comments: true
---

Docker allows us to pass environment variables into running containers, and there are mainly two ways of doing this:

* Command options `-e` and `--env`
* Variables files `--env-file`

![Docker](/images/posts/docker.gif)

# Access to docker container environment variables

## Command line

In CLI mode your environment variables are directly available inside your container.
If you want to see this in action, just log into your container and print env variables:

```shell
$ docker exec -it CONTAINER_ID_OR_NAME bash
root@46b3db827c89:/app# printenv
HOSTNAME=46b3db827c89
DOCKER_HOST=unix:///tmp/docker.sock
DOCKER_GEN_VERSION=0.4.2
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
PWD=/app
NGINX_VERSION=1.9.6-1~jessie
SHLVL=1
HOME=/root
_=/usr/bin/printenv
root@46b3db827c89:/app#
```
Every script or application using environment variables will work properly,
you have nothing more to do about those environment variables.
If you work with Apache or Nginx for instance you will need to add extra configurations to allow your applications access env vars.

## Crontab

### Simple configuration

If you want to run a cron job inside a running container, you can, but if your script needs environment variables you will probably have some problems.
Indeed, the crontab application does not use or forward those variables.

Steps to add a cron job into a running container can be:

* Create a configuration file for your crontab job.
* Add it into your docker image with an `ADD/COPY` instruction in your `Dockerfile`, or add it on runtime thanks to a `VOLUME`.

```shell
ADD conf/CONFIG_FILE /etc/cron.d/CONFIG_FILE
```

```shell
...
-v './conf/CONFIG_FILE:/etc/cron.d/CONFIG_FILE'
...
```

* The configuration file must be located in `/etc/cron.d/CONFIG_FILE`
* Start the `cron` deamon when your container starts, it could be `cron &` from a `startup.sh` script (or better, a supervisord entry).
* Your `CONFIG_FILE` should look like (Symfony command example):

```shell
* * * * * root php /var/www/app/console doctrine:schema:update >> /var/log/cron.log 2>&1
```

### Environment variables

If your crontab script needs env vars you need to source them before:

```shell
* * * * * root . /root/project_env.sh; php /var/www/app/console doctrine:schema:update >> /var/log/cron.log 2>&1
```

But what is this `/root/project_env.sh` file ? How to create it with docker environment variables ?

A simple shell command can help you to do this:

```shell
printenv | sed 's/^\(.*\)$/export \1/g' > /root/project_env.sh
```

If you want to filter only Symfony related env vars, add a simple `grep`:

```shell
printenv | sed 's/^\(.*\)$/export \1/g' | grep -E "^export SYMFONY" > /root/project_env.sh
```

This command will generate a file `/root/project_env.sh` with this kind of content:


```
root@kgestion:/var/www# printenv | sed 's/^\(.*\)$/export \1/g' | grep -E "^export SYMFONY"
export SYMFONY_ENV=prod
export SYMFONY__DATABASE__PASSWORD=123456789
export SYMFONY__APP__SECRET=123456789
export SYMFONY__DATABASE__USER=user
export SYMFONY__DATABASE__NAME=name
export SYMFONY__DATABASE__PORT=3306
export SYMFONY__ELASTIC__PORT=9200
export SYMFONY__DATABASE__HOST=host
```

**THat's all ! Source and use this file everywhere !**



