---
layout: post
title: "Local and remote port forwarding with SSH tunnels"
excerpt: "It can be really useful to use ssh tunnels and local port forwarding to access servers, databases or more generally services running on remote LAN. With Remote port forwarding we can access a local machine from outside internet easily."
tags: [tunnel, tunnels, ssh, remote, local, port, forwarding, dynamic, databases, firewall, private]
image: openssh.gif
comments: true
---

![Docker](/images/posts/openssh.gif)

To use SSH tunnels, of course you need to have a few things:

* A server accessible from your local machine/network through SSH (port 22 by default) and from internet (80, 443,...).
* SSH service running on the remote server and on your local machine.
* An SSH key on your local machine allowed (authorized_keys) on the remote accessible server for a user.

If you want to access to a remote service (BDD, intranet, ...) running on a remote server
or on a machine in a remote private network... you need to use **Local Port Forwarding**.

# Local Port Forwarding

**Service directly on the remote server**

{% highlight bash %}
ssh -Ng -p 54322 -i ~/.ssh/topsecret -L 3320:127.0.0.1:3306 user@remoteserver.fr
{% endhighlight %}

* **-p 54322** because the default ssh port has been changed on the remote server.
* **-i ~/.ssh/topsecret** to use the ssh key named "topsecret".
* **-L** for Local port forwarding.
* **3320**:127.0.0.1:3306 because we forward local port 3320 on the remote machine.
* 3320:**127.0.0.1**:3306 because we forward the 3320 local port directly on the remote machine.
* 3320:127.0.0.1:**3306** because the local port if forwarded on the 3306 port on the remote machine.
* **user@remoteserver.fr** user and remote server domain for ssh connection.

**Service on the private network of the remote server**

{% highlight bash %}
ssh -Ng -p 54322 -i ~/.ssh/topsecret -L 3320:10.1.1.54:3306 user@remoteserver.fr
{% endhighlight %}

* 3320:**10.1.1.54**:3306 because we want to access port 3306 of the machine with IP 10.1.1.54 on the remote private network.
It means that the remote server must be part of the private network or be allowed to access it.

# Remote Port Forwarding

{% highlight bash %}

{% endhighlight %}

# Dynamic Port Forwarding

{% highlight bash %}

{% endhighlight %}




