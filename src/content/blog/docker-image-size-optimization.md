---
title: "Docker image size optimization"
description: "Simple tricks to shrink Docker images: layer caching, minimal base images like Alpine or BusyBox, fewer layers and removing useless files."
pubDate: 2016-02-15
updatedDate: 2020-04-09
tags: [platform]
---

Building docker images is pretty easy thanks to dockerfiles. But building **small docker images** is not always easy.
The cache mechanism is really powerful, but it's also the main problem when dealing with image size optimization.
Let's take an example and let's see how to improve the dockerfile to improve the image size.

## A Dockerfile as example

### Base image size

**`Dockerfile`** ([gist](https://gist.github.com/ypereirareis/f59e6304cfd156792730))

```dockerfile
FROM ubuntu:14.04

MAINTAINER Yannick PEREIRA-REIS <yannick.pereira.reis@gmail.com>
```

**`image_size_init.sh`** ([gist](https://gist.github.com/ypereirareis/f59e6304cfd156792730))

```bash
$ docker build -t img_size_optim .
Sending build context to Docker daemon 2.048 kB
Step 1 : FROM ubuntu:14.04
 ---> 6d4946999d4f
Step 2 : MAINTAINER Yannick PEREIRA-REIS <yannick.pereira.reis@gmail.com>
 ---> Running in de8fbb56d363
 ---> 0e898caf0cef
Removing intermediate container de8fbb56d363
Successfully built 0e898caf0cef

$ docker images | grep img_size_optim
img_size_optim                        latest              0e898caf0cef        11 seconds ago       188.3 MB

$ docker history 0e898caf0cef
IMAGE               CREATED             CREATED BY                                      SIZE                COMMENT
0e898caf0cef        2 minutes ago       /bin/sh -c #(nop) MAINTAINER Yannick PEREIRA-   0 B
6d4946999d4f        8 months ago        /bin/sh -c #(nop) CMD ["/bin/bash"]             0 B
9fd3c8c9af32        8 months ago        /bin/sh -c sed -i 's/^#\s*\(deb.*universe\)$/   1.895 kB
435050075b3f        8 months ago        /bin/sh -c echo '#!/bin/sh' > /usr/sbin/polic   194.5 kB
428b411c28f0        8 months ago        /bin/sh -c #(nop) ADD file:b3447f4503091bb6bb   188.1 MB
```

- As you can see we are using ubuntu 14.04 as the base image.
- This base image size is **188.3 MB**.
- The image already has **5** layers.

### More packages, elasticsearch, npm, and a PHP project (Satisfy)

**`Dockerfile`** ([gist](https://gist.github.com/ypereirareis/bcea06f8de4282efe624))

```dockerfile
FROM ubuntu:14.04

MAINTAINER Yannick PEREIRA-REIS <yannick.pereira.reis@gmail.com>

ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update && apt-get install -y --force-yes \
        build-essential \
        git \
        curl \
        php5 \
        php5-mcrypt \
        php5-tidy \
        php5-cli \
        php5-common \
        php5-curl \
        php5-intl \
        php5-fpm \
        php-apc \
        nginx \
        ssh \
        npm

# Install Elasticsearch
RUN curl -L -O https://download.elastic.co/elasticsearch/release/org/elasticsearch/distribution/tar/elasticsearch/2.2.0/elasticsearch-2.2.0.tar.gz
RUN tar -xvf elasticsearch-2.2.0.tar.gz
RUN rm -rf elasticsearch-2.2.0.tar.gz

# Install nodejs
RUN npm install express

# Install Satisfy a PHP project
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN /usr/local/bin/composer create-project playbloom/satisfy:2.0.6 --stability=dev
RUN chmod -R 777 /satisfy

EXPOSE 80 443 9200 9300
```

**`image_size_full.sh`** ([gist](https://gist.github.com/ypereirareis/bcea06f8de4282efe624))

```bash
$ docker images | grep img_size_optim
img_size_optim                        latest              f8195dc6cc29        About a minute ago   703.4 MB

$ docker history f8195dc6cc29
IMAGE               CREATED              CREATED BY                                      SIZE                COMMENT
f8195dc6cc29        About a minute ago   /bin/sh -c #(nop) EXPOSE 443/tcp 80/tcp 9200/   0 B
8ca1e0d654c4        14 minutes ago       /bin/sh -c chmod -R 777 /satisfy                71.58 MB
8c3f6ce559f1        14 minutes ago       /bin/sh -c /usr/local/bin/composer create-pro   88.33 MB
a6d9f7c3d635        16 minutes ago       /bin/sh -c curl -sS https://getcomposer.org/i   1.555 MB
0e45d8bf331e        16 minutes ago       /bin/sh -c npm install express                  3.4 MB
68f8e0aa685a        17 minutes ago       /bin/sh -c rm -rf elasticsearch-2.2.0.tar.gz    0 B
1594807c6f11        17 minutes ago       /bin/sh -c tar -xvf elasticsearch-2.2.0.tar.g   33.14 MB
9af6cbbc951d        17 minutes ago       /bin/sh -c curl -L -O https://download.elasti   29.42 MB
b0f839e1d176        19 minutes ago       /bin/sh -c apt-get update && apt-get install    287.7 MB
1cc38eb54bda        23 minutes ago       /bin/sh -c #(nop) ENV DEBIAN_FRONTEND=noninte   0 B
0e898caf0cef        46 minutes ago       /bin/sh -c #(nop) MAINTAINER Yannick PEREIRA-   0 B
6d4946999d4f        8 months ago         /bin/sh -c #(nop) CMD ["/bin/bash"]             0 B
9fd3c8c9af32        8 months ago         /bin/sh -c sed -i 's/^#\s*\(deb.*universe\)$/   1.895 kB
435050075b3f        8 months ago         /bin/sh -c echo '#!/bin/sh' > /usr/sbin/polic   194.5 kB
428b411c28f0        8 months ago         /bin/sh -c #(nop) ADD file:b3447f4503091bb6bb   188.1 MB
```

- The image size is now **703.4 MB**
- The image has **15** layers.

## Optimization of the dockerfile

### Packages

- We do not need all recommended packages, so we can add the option `--no-install-recommends` to the `apt-get install` command.
- We can clean apt and remove temporary files.

```bash
RUN apt-get update && \
  apt-get install -y --force-yes --no-install-recommends \
  build-essential \
  ...
  npm \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
```

### Add and remove archives or installers in the same layer

```bash
RUN curl -L -O https://download.elastic.co/elasticsearch/release/org/elasticsearch/distribution/tar/elasticsearch/2.2.0/elasticsearch-2.2.0.tar.gz && \
  tar -xvf elasticsearch-2.2.0.tar.gz && \
  rm -rf elasticsearch-2.2.0.tar.gz
```

### Change chmod on the same layer

```bash
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer && \
  /usr/local/bin/composer create-project playbloom/satisfy:2.0.6 --stability=dev && \
  chmod -R 777 /satisfy
```

### Use prestissimo with Composer

- Minimize image size
- Drastically improve composer install runtime

```bash
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
  && /usr/local/bin/composer global require hirak/prestissimo \
  && /usr/local/bin/composer create-project playbloom/satisfy:2.0.6 --stability=dev \
  && chmod -R 777 /satisfy
```

After all those optimizations:

```bash
$ docker images | grep img_size_optim
img_size_optim                        latest              854039a1452a        11 seconds ago      561.1 MB
```

- The image size is now **561.1 MB**
- The image has **11** layers.

### Remove application cache and temporary files and directories

```bash
RUN npm install express \
  && rm -rf /root/.npm/cache/*
```

```bash
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
  && /usr/local/bin/composer global require hirak/prestissimo \
  && /usr/local/bin/composer create-project playbloom/satisfy:2.0.6 --stability=dev \
  && chmod -R 777 /satisfy \
  && rm -rf /root/.composer/cache/*
```

```bash
$ docker images | grep img_size_optim
img_size_optim                        latest              9ad790d290db        11 seconds ago      533.7 MB
```

- The image size is now **533.7 MB**

### All commands in a single RUN

Be careful, because only complete `RUN` instruction can be cached.
So if you RUN everything in a single RUN, you could (maybe) not use cache as you should.

```bash
RUN apt-get update && apt-get install -y --force-yes --no-install-recommends \
  ca-certificates \
  build-essential \
  git \
  curl \
  php5 \
  php5-mcrypt \
  php5-tidy \
  php5-cli \
  php5-common \
  php5-curl \
  php5-intl \
  php5-fpm \
  php-apc \
  nginx \
  ssh \
  npm \

  && curl -L -O https://download.elastic.co/elasticsearch/release/org/elasticsearch/distribution/tar/elasticsearch/2.2.0/elasticsearch-2.2.0.tar.gz \
  && tar -xvf elasticsearch-2.2.0.tar.gz \
  && rm -rf elasticsearch-2.2.0.tar.gz \

  && npm install express \

  && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
  && /usr/local/bin/composer global require hirak/prestissimo \
  && /usr/local/bin/composer create-project playbloom/satisfy:2.0.6 --stability=dev \
  && chmod -R 777 /satisfy \

  && apt-get clean \
  && rm -rf /root/.npm/cache/* \
  && rm -rf /root/.composer/cache/* \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
```

```bash
$ docker images | grep img_size_optim
img_size_optim                        latest              e73bdb95e6db        7 seconds ago       533.7 MB
```

- The image size is still **533.7 MB**
- The image has **8** layers.

### Base image as small as possible

Have a look at those extremely small base images:

- [Alpine](https://hub.docker.com/_/alpine/)
- [Busybox](https://hub.docker.com/_/busybox/)

## Flatten or squash docker image/containers

### Flatten

[http://tuhrig.de/flatten-a-docker-container-or-image/](http://tuhrig.de/flatten-a-docker-container-or-image/)

So it is only possible to “flatten” a Docker container, not an image.
So we need to start a container from an image first.
Then we can export and import the container in one line:

```bash

$ docker run -it img_size_optim bash -c "exit"
$ docker ps -a | grep img_size_optim
8ec324116755        img_size_optim        "bash -c exit"           48 seconds ago      Exited (0) 48 seconds ago                              tiny_stallman
$ docker export 8ec324116755 | docker import - img_size_optim_flatten:latest
16ac86fde38629776c0734cbceae22a9da97bd303739e58c5c5261b3376e79d3
```

```bash
$ docker images | grep img_size_optim_flatten
img_size_optim_flatten                latest              16ac86fde386        57 seconds ago      504.4 MB
```

- The image size is now **504.4 MB**
- The image has **1** layer.

Complicated to use the cache mechanism... as it's based on layers and RUN instructions.

### Squash

[https://github.com/jwilder/docker-squash](https://github.com/jwilder/docker-squash)

## Conclusion

With all these tricks to optimize the docker image size...

- Image size from **703.4 MB** to **504.4 MB**.
- From **15** layers to **1**.

And the dockerfile for the example is very simple.

Go!! Improve the size of your docker images!!
