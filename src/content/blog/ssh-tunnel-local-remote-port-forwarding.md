---
title: "Local, remote and dynamic port forwarding with SSH tunnels"
description: "Use SSH tunnels to reach databases and services on a remote network, expose a local machine from outside, or run a SOCKS proxy."
pubDate: 2016-09-19
updatedDate: 2020-04-09
tags: [infrastructure, security]
---

To use SSH tunnels, of course you need to have a few things:

- A server accessible from your local machine/network through SSH (port 22 by default) and from the internet (80, 443,...).
- SSH service running on the remote server and on your local machine.
- An SSH key on your local machine allowed (authorized_keys) on the remote accessible server for a user.

If you want to access a remote service (BDD, intranet, ...) running on a remote server
or on a machine in a remote private network... you need to use **Local Port Forwarding**.

## Local Port Forwarding

**Service directly on the remote server**

```bash
ssh -Ng -p 54322 -i ~/.ssh/topsecret -L 3320:127.0.0.1:3306 user@remoteserver.fr
```

- **-p 54322** because the default ssh port has been changed on the remote server.
- **-i ~/.ssh/topsecret** to use the ssh key named "topsecret".
- **-L** for Local port forwarding.
- **3320**:127.0.0.1:3306 because we forward local port 3320 on the remote machine.
- 3320:**127.0.0.1**:3306 because we forward the 3320 local port directly on the remote machine.
- 3320:127.0.0.1:**3306** because the local port is forwarded on the 3306 port on the remote machine.
- **`user@remoteserver.fr`** user and remote server domain for ssh connection.

**Service on the private network of the remote server**

```bash
ssh -Ng -p 54322 -i ~/.ssh/topsecret -L 3320:10.1.1.54:3306 user@remoteserver.fr
```

- 3320:**10.1.1.54**:3306 because we want to access port 3306 of the machine with IP 10.1.1.54 on the remote private network.
  It means that the remote server must be part of the private network or be allowed to access it.

## Remote Port Forwarding

**Service directly on the local machine**

```bash
ssh -nNT -i ~/.ssh/id_rsa -R 9000:localhost:80 user@remoteserver.fr
```

- **9000**:localhost:80 because we use port 9000 of the remote server.
- 9000:**localhost**:80 because we want to access the local machine.
- 9000:localhost:**80** because we want to access port 80 of the local machine.
- **-i ~/.ssh/id_rsa** to use the ssh key named "id_rsa".
- **`user@remoteserver.fr`** user and remote server domain for ssh connection.

**Service on the private network of the local machine**

```bash
ssh -nNT -i ~/.ssh/id_rsa -R 9000:192.168.0.88:80 user@remoteserver.fr
```

- 9000:**192.168.0.88**:80 because we want to access port 80 of the machine with IP 192.168.0.88 on the local private network.
  It means that the local machine must be part of the private LAN or be allowed to access it (NAT).

## Dynamic Port Forwarding

```bash
ssh -nNT -C -D 1080 user@remoteserver.fr
```

- -D **1080** because we want to use port 1080 as the dynamic port.

To try this Dynamic Port Forwarding configuration just execute this command:

```bash
curl --proxy socks5h://localhost:1080 http://www.my-ip-address.net/fr
```

Or configure your browser to use this SOCKS proxy (`localhost:1080`).

## USE CASE

I very often use **Local Port Forwarding** to connect to my databases in production.
I use docker and docker-compose and it's useful for me to expose my database connections.

```bash
db:
  image: mysql:5.6
  ports:
    - 127.0.0.1:3306:3306
  ...
```

_The goal is to expose port 3306 only on IP 127.0.0.1 and not to the entire world (0.0.0.0 by default)._

Then I start a **Local Port Forwarding** with `ssh -Ng -i ~/.ssh/topsecret -L 4406:127.0.0.1:3306 user@remoteserver.fr`,
and I use `mysql -hremoteserver.fr -P 4406` or MySqlWorkbench over SSH.
