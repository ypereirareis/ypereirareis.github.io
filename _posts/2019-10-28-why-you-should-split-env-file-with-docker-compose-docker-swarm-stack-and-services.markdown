---
layout: post
title: "Why you should split your env file with docker-compose and docker swarm stack and services"
excerpt: "Factor number 3 of twelve-factor app methodology recommands to store configuration that varies between deployments into environment. With some frameworks, docker-compose and docker swarm we can use .env files. Let's see why it's important to split them into many env files."
tags: [docker, compose, docker-compose, env, file, environment, swarm, stack, stacks, service, services, twelve-factor, twelve, factor]
image: docker.png
comments: true
---

![PHP-FPM](/images/posts/docker.svg)

# TLDR: questions answered in this article.

* How to improve docker .env configuration for security ?
* How to improve docker .env configuration for performance ?
* How to improve docker .env configuration for better rolling update ?
* How to improve docker swarm rolling update time ?
* Why all my containers are restarting when updating environnement variables ?
* How to properly split environnement files ?

# Using a `.env` file to store configuration with docker-compose swarm stacks and services.

Since a few years, a lot of projects based on docker, even in the open source community, comes with a `.env` file to store configuration.
It allows to define specific configuration for deployments (development, staging and production for instance).
It's a good starting point if your try to respect the [twelve-factor app methodology](https://en.wikipedia.org/wiki/Twelve-Factor_App_methodology),
but you should NOT use a single `.env` file with docker swarm stack and services or you will have some organisation, security and performance problems.

Let's take a PHP [Symfony](https://symfony.com/) project developed and deployed thanks to docker and docker-compose on a swarm cluster.
In that kind of configuration we will often work with a single `.env` file used by every part of our technical stack:

* the [docker-compose file](https://docs.docker.com/compose/environment-variables/#the-env-file)
* the [running container](https://docs.docker.com/compose/environment-variables/#the-env_file-configuration-option)
* the [Symfony app itself](https://symfony.com/doc/current/configuration.html#configuration-based-on-environment-variables)

**Let's take these typical `docker-compose.yml` and `.env` files examples:**

<script src="https://gist.github.com/ypereirareis/2aa1fbc62d31088bf3845d6beb3a109e.js"></script>

# What are the problems in the case of single `.env` file ?

## Problem #1: Code organization and separation of concerns.

* Very difficult to say which environment variables are used by each service.
* Very difficult to say which environment variables are used by the PHP application itself.
* Difficult to pick up a single service from that stack to add it to another stack.
* Configurations can be mixed in this single file (unless you organize each part with comments).

## Problem #2: Bugs.

Let's say you use a project like this perfect one: [jwilder/nginx-proxy](https://github.com/jwilder/nginx-proxy).

* You will add an env variable `VIRTUAL_HOST=domain.localhost` to your `.env` file to access Nginx web server with your custom domain "domain.localhost".
* You will access [http://domain.localhost](http://domain.localhost) URL and you will have intermittent errors, and the reverse proxy logs will look like:

```bash
nginx.1    | 2019/10/07 07:32:39 [error] 147#147: *105 recv() failed (104: Connection reset by peer) while reading response header from upstream, client: 172.17.0.1, server: domain.localhost, request: "POST / HTTP/1.1", upstream: "http://172.17.0.10:9000", host: "domain.localhost", referrer: "http://domain.localhost"
nginx.1    | 2019/10/07 07:32:39 [warn] 147#147: *105 upstream server temporarily disabled while reading response header from upstream, client: 172.17.0.1, server: domain.localhost, request: "POST / HTTP/1.1", upstream: "http://172.17.0.10:9000", host: "domain.localhost", referrer: "http://domain.localhost"
```

This is because adding a variable to the `.env` file, will add it into **all containers** (configured with `env_file` directive).
So with the **round robin** algorithm used by default within Nginx load balancing, the request will reach the PHP container one time out of two, instead of the Nginx container.

## Problem #3: Security.

As we said in the previous part, "adding a variable to the `.env` file, will add it into **all containers** (configured with `env_file` directive)".
So you will have access all environment variables in all running containers... In addition to the fact that it is unnecessary, it can introduce vulnerabilities.

Imagine your Nginx web server is compromised and some hackers can export all env variables available in your Nginx running container, they will have access to sensitive information like database credentials:

* DB_HOST=127.0.0.1
* DB_PORT=3306
* DB_NAME=test
* DB_USER=root
* DB_PASSWORD=very_sensitive_password

They will also have access to other sensitive information:
* you are running your application from a docker container whose image is stored in a private registry `REGISTRY_PATH` (registry.domain.tld)
* you are using port number 2000 for your app, so are probably behind a reverse proxy.
* you are using PHP for your application, probably version 7.2.
* ...

## Problem #4: Stack update, performance and resources consumption.

Docker has a built-in mecanism allowing to restart containers when dependencies have changed: env variables, docker-compose directives, networks,...
I'm sure you see where I'm going with this... Imagine you want to increase PHP memory limit, you will change the value of env variable `MEMORY_LIMIT`.

Then you will run that kind of command to update your PHP service:

```
docker stack deploy -c docker-compose.yml --with-registry-auth "symfony_application"
```

And **BOOM !!!** All the containers (probably spread over many servers, maybe over many datacenters)
of all your services of your stack will restart following defined `restart_policy`, `update_config` and `healthcheck` configurations.

This will lead to an extra and unnecessary resources consumption (CPU, memory, bandwith, ...) and maybe service downtime.
Our example is pretty simple but it's a common thing to have 5 or 6 services per stack, for instance:

* Nginx as a web server
* PHP-FPM as factCGI process manager
* Elasticsearch for full-text search
* Redis for caching
* MySQL a main database storage

We can't afford to restart everything when we simply want to update a single service.

# Possibles solutions.

Choose the one you prefer or the one that best fits your needs.

## Solution #1: Never use the `env_file` (or `--env-file`) configuration.

Docker-compose allows us to define environment variables to pass to running containers, with `environment` config, this way no other variable will be available in the container:

<script src="https://gist.github.com/ypereirareis/362ddf09620769fb9625d2288249d6be.js"></script>

## Solution #2: Split your env file into multiple env files.

* .env (used by docker-compose)
* .php.env (used by php service and application)
* .nginx.env (used by nginx service)
* ...

and the matching `docker-compose.yml`:

<script src="https://gist.github.com/ypereirareis/4ae63ee240fd4aa65d8ef31b6191514f.js"></script>

# Another thing to consider.

When building your docker image you may add all your env files in the image if you are not careful.

Just see `.dockerignore` file or `RUN rm -f *.env`
