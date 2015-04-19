---
layout: post
title:  "Docker with shell script or Makefile"
description: Docker with shell script or Makefile to have a higher productivity
---

Of course [Docker](https://docs.docker.com/) is a fantastic tool that allows us to work more efficiently
and that offers new perspectives in terms of scalability, infrastructures, deployments,...

But first of all, [Docker](https://docs.docker.com/) is used by a lot of people for development
with many different languages on many different platforms.

And for developers (like me), the use of [Docker](https://docs.docker.com/) is not something very easy nor fun
if we have to type or copy/paste or run commands like...

{% highlight bash %}
docker run -it --rm \
    -v $(pwd):/app \
    -e VIRTUAL_HOST=domain.tld \
        IMAGE_NAME \
            /bin/bash -ci 'app/console cache:clear'
{% endhighlight %}

...to execute a simple [Symfony](http://symfony.com/) command for example.

I'm sure [Symfony](http://symfony.com/) developers understand what I mean regarding how many times a day we can run this command.

So it's absolutely necessary to use Docker through the power of complementary tools such as:

* Shell scripting
* Make / Makefile
* Docker Compose

## Shell Scripting

With your favorite shell (bash, zsh, ...) you will be able to simplify everything you need to use docker with no pain writing shell scripts.
But writing such scripts is not always really easy for developers without admin or DevOps skills.

To show you how to be more productive with Docker and shell scripts,
I'm gonna speak about the way I developed this Jekyll blog and how I work with it everyday.

**A simple DO-FILE**





## Make / Makefile

## Docker Compose
