---
layout: post
title: "RabbitMQ high available cluster with docker and HAProxy"
excerpt: "A docker stack to simulate a RabbitMQ cluster with high availability. HAProxy for load balancing, multi nodes, nodes failure, network partition,..."
tags: [rabbitmq, rabbit, ha, high, available, exchange, queues, mirroring, cluster, haproxy, swarrot, oldsound, symfony, node, nodes, persistancy, durable]
image: rabbitmq.jpg
comments: true
---

![Docker](/images/posts/rabbitmq.jpg)

# TL;DR

Docker based project to run a highly available RabbitMQ cluster:
[https://github.com/ypereirareis/docker-rabbitmq-ha-cluster](https://github.com/ypereirareis/docker-rabbitmq-ha-cluster)

# RabbitMQ cluster

A cluster is composed of at least two RabbitMQ nodes. These nodes need to be able to communicate with each other.
**I strongly advise you to always have an odd number of nodes in your cluster.**

# Load Balancing with HAProxy

![Docker](/images/posts/haproxy.gif)

When working with a cluster the goal is to have a highly available service.
So we need to dispatch requests on every running node of the cluster, and avoid sending request to failing nodes.

One way to achieve this is to use HAProxy. It's a very light and very good tool when dealing with reverse proxy or load balancing.
HAProxy allows TCP connections and redirections out of the box and works well with the AMQP protocol.
**With NGINX you will need to install plugins to manage AMQP connections.**

The HAProxy service **SHOULD NOT** be run on a node of the RAbbitMQ cluster. Because if the node fails, the load balancer will fail too.
And you'll  loose the ability to load balance requests on other nodes.

**Configuration example**

{% highlight bash %}

global
  log 127.0.0.1 local0
  log 127.0.0.1 local1 notice
  log-send-hostname
  maxconn 4096
  pidfile /var/run/haproxy.pid
  user haproxy
  group haproxy
  daemon
  stats socket /var/run/haproxy.stats level admin
  ssl-default-bind-options no-sslv3
  ssl-default-bind-ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:AES128-GCM-SHA256:AES128-SHA256:AES128-SHA:AES256-GCM-SHA384:AES256-SHA256:AES256-SHA:DHE-DSS-AES128-SHA:DES-CBC3-SHA
defaults
  balance roundrobin
  log global
  mode tcp
  option redispatch
  option httplog
  option dontlognull
  option forwardfor
  timeout connect 5000
  timeout client 50000
  timeout server 50000
listen stats
  bind :1936
  mode http
  stats enable
  timeout connect 10s
  timeout client 1m
  timeout server 1m
  stats hide-version
  stats realm Haproxy\ Statistics
  stats uri /
  stats auth stats:stats
listen port_5672
  bind :5672
  mode tcp
  server rmq_rmq3_1 rmq_rmq3_1:5672 check inter 2000 rise 2 fall 3
  server rmq_rmq2_1 rmq_rmq2_1:5672 check inter 2000 rise 2 fall 3
  server rmq_rmq1_1 rmq_rmq1_1:5672 check inter 2000 rise 2 fall 3
listen port_15672
  bind :15672
  mode tcp
  server rmq_rmq1_1 rmq_rmq1_1:15672 check inter 2000 rise 2 fall 3
frontend default_port_80
  bind :80
  reqadd X-Forwarded-Proto:\ http
  maxconn 4096
  default_backend default_service
backend default_service
  server rmq_rmq1_1 rmq_rmq1_1:25672 check inter 2000 rise 2 fall 3
  server rmq_rmq1_1 rmq_rmq1_1:4369 check inter 2000 rise 2 fall 3
  server rmq_rmq1_1 rmq_rmq1_1:9100 check inter 2000 rise 2 fall 3
  server rmq_rmq1_1 rmq_rmq1_1:9101 check inter 2000 rise 2 fall 3
  server rmq_rmq1_1 rmq_rmq1_1:9102 check inter 2000 rise 2 fall 3
  server rmq_rmq1_1 rmq_rmq1_1:9103 check inter 2000 rise 2 fall 3
  server rmq_rmq1_1 rmq_rmq1_1:9104 check inter 2000 rise 2 fall 3
  server rmq_rmq1_1 rmq_rmq1_1:9105 check inter 2000 rise 2 fall 3
  server rmq_rmq2_1 rmq_rmq2_1:15672 check inter 2000 rise 2 fall 3
  server rmq_rmq2_1 rmq_rmq2_1:25672 check inter 2000 rise 2 fall 3
  server rmq_rmq2_1 rmq_rmq2_1:4369 check inter 2000 rise 2 fall 3
  server rmq_rmq2_1 rmq_rmq2_1:9100 check inter 2000 rise 2 fall 3
  server rmq_rmq2_1 rmq_rmq2_1:9101 check inter 2000 rise 2 fall 3
  server rmq_rmq2_1 rmq_rmq2_1:9102 check inter 2000 rise 2 fall 3
  server rmq_rmq2_1 rmq_rmq2_1:9103 check inter 2000 rise 2 fall 3
  server rmq_rmq2_1 rmq_rmq2_1:9104 check inter 2000 rise 2 fall 3
  server rmq_rmq2_1 rmq_rmq2_1:9105 check inter 2000 rise 2 fall 3
  server rmq_rmq3_1 rmq_rmq3_1:15672 check inter 2000 rise 2 fall 3
  server rmq_rmq3_1 rmq_rmq3_1:25672 check inter 2000 rise 2 fall 3
  server rmq_rmq3_1 rmq_rmq3_1:4369 check inter 2000 rise 2 fall 3
  server rmq_rmq3_1 rmq_rmq3_1:9100 check inter 2000 rise 2 fall 3
  server rmq_rmq3_1 rmq_rmq3_1:9101 check inter 2000 rise 2 fall 3
  server rmq_rmq3_1 rmq_rmq3_1:9102 check inter 2000 rise 2 fall 3
  server rmq_rmq3_1 rmq_rmq3_1:9103 check inter 2000 rise 2 fall 3
  server rmq_rmq3_1 rmq_rmq3_1:9104 check inter 2000 rise 2 fall 3
  server rmq_rmq3_1 rmq_rmq3_1:9105 check inter 2000 rise 2 fall 3

{% endhighlight %}

# High availability

## Nodes

To have high availability you need more than one node, and of course you need load balancing.
Let's say that 3 nodes is a good start for a simple RAbbitMQ cluster.
And we need one more node for HAProxy.

![Docker](https://github.com/ypereirareis/docker-rabbitmq-ha-cluster/raw/master/img/rabbitmq.png)

## Exchanges, Queues and messages mirroring and persistence

If we want a high level of resiliency, something important is to mirror everything we can on other nodes of the cluster.

We need to configure a few things:

* durable, mirrored and persistent Exchanges
* durable, mirrored and persistent Queues
* persistent and mirrored messages (read/write on disk)

Now we can have consumers and producers connected with one (or more) nodes of the cluster.

# Network partition

Sometimes a node can be excluded and unreachable by the others (network failure for instance).
But it's still running and receiving / consuming messages.
After a small period of time the node becomes desynchronized, and it appears a network partition.
Messages in the excluded node are not in the others and vice versa.

# Test and benchmark

If you want to experiment scenarios with RabbitMQ cluster, I created a docker based project for that.

[https://github.com/ypereirareis/docker-rabbitmq-ha-cluster](https://github.com/ypereirareis/docker-rabbitmq-ha-cluster)

You can experiment:

* Load Balancing
* Node failure
* Network partition
* Messages persistency
* Message NO ACK and retries
* Exchanges and queues durability and mirroring
* Polling VS pulling
* Swarrot / SwarrotBundle
* RabbitMqBundle














