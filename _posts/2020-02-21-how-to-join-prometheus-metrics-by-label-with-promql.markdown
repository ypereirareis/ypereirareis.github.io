---
layout: post
title: "How to join Prometheus metrics by label with PromQL"
excerpt: "When aggregating metrics from many sources or exporters in a Prometheus database, we often need to JOIN metrics on labels."
tags: [prometheus, grafana, join, metric, metrics, label, labels, instance, promQL, database, exporter, node exporter]
image: prometheus.jpg
comments: true
---

![Prometheus](/images/posts/prometheus.jpg)

# TLDR: questions answered in this article.

* How to JOIN two different Prometheus metrics by label with PromQL.

# Available metrics for the example

Let's say we use the excellent "node-exporter" project to monitor our servers.

* [https://github.com/prometheus/node_exporter](https://github.com/prometheus/node_exporter)
* [https://hub.docker.com/r/prom/node-exporter/](https://hub.docker.com/r/prom/node-exporter/)

**We will have metrics looking like that, for example:**

```bash
node_disk_bytes_read{}
node_disk_bytes_read{device="dm-0",instance="10.0.0.10",job="node-exporter"} | 43161334784
```

We can use PromQL to build aggregations, sum of "disk bytes read" by instance/server:

```bash
sum(node_disk_bytes_read{}) by (instance)
  {instance="10.0.0.8"} | 22082332072448
  {instance="10.0.0.9"} | 8439202548224
  {instance="10.0.0.10"} | 28203612148224
  {instance="10.0.0.11"} | 56887513977344
  {instance="10.0.0.12"} | 30887053824
  {instance="10.0.0.13"} | 36352176166912
```

With our custom usage of node-exporter we have added a custom metric called "node_meta".

```bash
#!/bin/sh -e
NODE_NAME=$(cat /etc/nodename)
echo "node_meta{node_id=\"$NODE_ID\", container_label_com_docker_swarm_node_id=\"$NODE_ID\", node_name=\"$NODE_NAME\"} 1" > /etc/node-exporter/node-meta.prom
set -- /bin/node_exporter "$@"
exec "$@"
```

* You can see this configuration here [https://github.com/stefanprodan/swarmprom/blob/master/node-exporter/conf/docker-entrypoint.sh](https://github.com/stefanprodan/swarmprom/blob/master/node-exporter/conf/docker-entrypoint.sh)
* The full project is available here [https://github.com/stefanprodan/swarmprom](https://github.com/stefanprodan/swarmprom)

**With this configuration we also have metrics like:**

```bash
node_meta{}
```

We can query Prometheus to have values for this metric:

```bash
node_meta{}
  node_meta{instance="10.0.0.8",job="node-exporter",node_name="node2"} | 1
  node_meta{instance="10.0.0.9",job="node-exporter",node_name="node4"} | 1
  node_meta{instance="10.0.0.10",job="node-exporter",node_name="node5"} | 1
  node_meta{instance="10.0.0.11",job="node-exporter",node_name="node6"} | 1
  node_meta{instance="10.0.0.12",job="node-exporter",node_name="node3"} | 1
  node_meta{instance="10.0.0.13",job="node-exporter",node_name="node1"} | 1
```

* You can notice that here we have labels allowing us to have a match between an **instance IP address (10.0.0.8)** and an **instance name (node2)**.
* There is a label in common between the two metrics "node_meta" and "node_disk_bytes_read": **instance**.

**QUESTION?**

How to query prometheus to have **sum of "disk bytes read"** by instance/node/server name ? The result we want is something like that :

```bash
node2 => 22082332072448
node4 => 8439202548224
node5 => 28203612148224
node6 => 56887513977344
node3 => 30887053824
node1 => 36352176166912
```

# How to JOIN the metrics

```bash
sum(node_disk_bytes_read * on(instance) group_left(node_name) node_meta{}) by (node_name)
```

* **on(instance)** => this is how to JOIN on label **instance**.
* **group_left(node_name) node_meta{}** => means, keep the label **node_name** from metric **node_meta** in the result.

And the result is:

```bash
{node_name="node2"} | 22082332072448
{node_name="node4"} | 8439202548224
{node_name="node5"} | 28203612148224
{node_name="node6"} | 56887513977344
{node_name="node3"} | 30887053824
{node_name="node1"} | 36352176166912
```

**Tadaaam!!**