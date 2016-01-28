---
layout: post
title: "Composer, Satis and docker"
description: "Thanks to Satis it's really easy to host and use private repositories"
keywords: "composer, satis, docker, satisfy, repository, repositories, git, packagist, github, gitlab, bitbucket"
---

As a PHP and Symfony developer I use [Composer](https://getcomposer.org/)
and [Satis](https://github.com/composer/satis) to manage my private repositories.

A few months ago, I created a [satis docker image](https://github.com/ypereirareis/docker-satis)
[(Dockerhub)](https://hub.docker.com/r/ypereirareis/docker-satis/) to deal with the Satis configuration easily, it contains: 

* [Composer](https://getcomposer.org/)
* [Satis](https://github.com/composer/satis)
* [Satisfy](https://github.com/ludofleury/satisfy) (admin UI)


## How to start

* `git clone git@github.com:ypereirareis/docker-satis.git`
* then... just read the documentation on my [docker satis my git repository](https://github.com/ypereirareis/docker-satis)

