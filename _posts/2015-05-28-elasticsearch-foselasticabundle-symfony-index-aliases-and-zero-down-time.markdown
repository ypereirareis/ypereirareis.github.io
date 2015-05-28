---
layout: post
title:  "Elasticsearch zero downtime with FOSElasticaBundle for Symfony when reindexing"
description: "FOSElasticaBundle allows zero downtime reindexing process using elasticsearch aliases. You need to set the correct configuration for your index in the Symfony config.yml file"
---

When using [elasticsearch](https://www.elastic.co/) or [elastic](https://www.elastic.co/),
the reindexing process must be an important task to deal with.
Indeed, this process must be done with zero downtime, and noting visible for users.

Reindexing can be useful in many cases like :

* Type/mapping updates.
* New physical infrastructure with more (or less) nodes.
* Splitting an index into many others.
* Any type of cluster/nodes/indexes/configuration updates.

If you want more information, [the doc](https://www.elastic.co/blog/changing-mapping-with-zero-downtime) is very clear.

But we are going to see how to set it with [Symfony](https://symfony.com/) and [FOSElasticaBundle](https://github.com/FriendsOfSymfony/FOSElasticaBundle)

## Elasticsearch (elastic)

To work with elasticsearch, the first thing we need, is to get/install... elasticsearch.
As a developer, I very often use elastic thanks to this [Vagrant box](https://github.com/ypereirareis/vagrant-elasticsearch-cluster)
or this [Dockerfile](https://github.com/ypereirareis/docker-elasticsearch-and-plugins) and container. 

**Docker**

**Vagrant**

## FOSElasticaBundle

**Install**

**Configuration**

## Conclusion
