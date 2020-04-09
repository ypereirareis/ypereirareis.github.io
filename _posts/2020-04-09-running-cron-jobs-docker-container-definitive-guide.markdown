---
layout: post
title: "Definitive guide on how to setup up and running cron jobs in docker containers"
excerpt: "Running cron jobs in docker containers will lead you to some very common problems, and sometimes without any errors or logs. Let's see all the steps to properly configure and run cron jobs in a docker container."
tags: [cron, crontab, job, jobs, docker, container, running, error, errors, logs, log, syslog, rsyslog, chown, extension, filename, variables, environment, syntax, mail, spool]
image: crontab.png
comments: true
---

![Crontab](/images/posts/crontab.png)

# TLDR: My cron jobs are not running in my docker container. I don't know why and it's impossible to find any logs anywhere.

* Install syslog/rsyslog into your container and configure it to allow cron logs.
* Inspect your syslog logs to find out almost all problems.
* Inspect system mail to fix problems left.

# 1. Install syslog to have errors and logs in the docker container

If you run cron daemon in a container, you probably do not have syslog installed and properly configured to have CRON logs and errors.
And if your cron jobs are not running as intended, there is no easy way to find out problems without syslog.

Maybe you only want to install rsyslog to debug your crontab, and not have it in your production docker image and containers.
If so, you can install it in a running container to debug. Then remove/start the container once everything is working.

### Install rsyslog

{% highlight bash %}
apt-get update && apt-get install -y rsyslog
{% endhighlight %}

### Configure rsyslog for cron

* Edit `/etc/syslog.conf` to enable cron logging (uncomment correct line).
* Default cron log file is `/var/log/cron.log`.

{% highlight bash %}
cron.*      /var/log/cron.log
{% endhighlight %}

### Start rsyslog and check it's running in the container

{% highlight bash %}
>/etc/init.d/rsyslog restart
[ ok ] Stopping enhanced syslogd: rsyslogd.
[ ok ] Starting enhanced syslogd: rsyslogdrsyslogd.

>/etc/init.d/rsyslog status
[ ok ] rsyslogd is running.
{% endhighlight %}

# 2. Cron file name must validate some rules

There is a very important thing to consider in this page: [https://www.pantz.org/software/cron/croninfo.html](https://www.pantz.org/software/cron/croninfo.html)

> Files must conform to the same naming convention as used by run-parts: they must consist solely of upper- and lower-case letters, digits, underscores, and hyphens. Like /etc/crontab, the files in the /etc/cron.d directory are monitored for changes.

**So, if you use to use meaningful extension for your files... forget it for cron files.**

* my-super-cron.cron **is NOT** valid (because of the **dot**).
* my-super-cron **is** valid.
* my_super_cron **is** valid.
* my_SUPER_cRon **is** valid.
* my_SUPER_cRon_2020 **is** valid.

_Read the entire link because you will find a lot of useful information about cron in general._

# 3. The cron file owner must be valid and properly defined to launch jobs

You have mainly two choices where to save your cron files:

* in the "current" user crontab.
* in the global cron location `/etc/cron.d` (`/etc/cron.daily,...`)

> The cron files in /etc/cron.d are a little different than a user's crontab such that you can specify what user a job runs as. 

If you choose the "current" user crontab, nothing particular to say. But if you choose the `/etc/cron.d` location,
your files **MUST BE OWNED** by root. Or you will have "WRONG FILE OWNER" error in your syslog.

{% highlight bash %}
Apr  1 19:35:01 node1 cron[32]: (*system*my-super-cron) WRONG FILE OWNER (/etc/cron.d/my-super-cron)
{% endhighlight %}

The file MUST BE owned by root, to avoid security hole such as privilege escalation, for instance:

{% highlight bash %}
* * * * * root cp /bin/bash /tmp/nowimroot && chown root:root /tmp/nowimroot && chmod u+s /tmp/nowimroot
{% endhighlight %}

# 4. New line before EOF (end of file) is mandatory

If you are, for example, a developer, you probably are aware of that recommendation to always add an new line at the end of a file.
But if you wonder **WHY?**, just read this thread and the very good explanation:

[https://stackoverflow.com/questions/729692/why-should-text-files-end-with-a-newline#answer-729795](https://stackoverflow.com/questions/729692/why-should-text-files-end-with-a-newline#answer-729795)

And for your cron files, you must follow this rule and add a new line at the end of files or you will have this error in syslog:

{% highlight bash %}
Apr  1 20:04:01 node1 cron[32]: (*system*my-super-cron) ERROR (Missing newline before EOF, this crontab file will be ignored)
{% endhighlight %}

You can easily test the difference between two files using the following commands:

* to create an invalid file:

{% highlight bash %}
echo -n "* * * * * root echo \"test\" > /tmp/test-cron-invalid.log" > /etc/cron.d/invalid-cron
{% endhighlight %}

* to create a valid file:

{% highlight bash %}
`echo "* * * * * root echo \"test\" > /tmp/test-cron-valid.log" > /etc/cron.d/valid-cron`
{% endhighlight %}

With `echo -n` you will create a crontab line without new line (CRLF), so it will fail with previous error in syslog.

# 5. Environment variables are not defined or available as expected in crontab

> When you use cron, your env is not same as if you log in. Depends which *nix system you have.

> That is your env when you use cron. It's not same as login. PATH is something, not enough usually and so on. Usually HOME is.


### The cron daemon automatically sets several environment variables.

* The default path is set to PATH=/usr/bin:/bin. If the command you are executing is not present in the cron specified path, you can either use the absolute path to the command or change the cron $PATH variable. You can’t implicitly append :$PATH as you would do with a regular script.
* The default shell is set to /bin/sh. To change the different shell, use the SHELL variable.
* Cron invokes the command from the user’s home directory. The HOME variable can be set in the crontab.
* The email notification is sent to the owner of the crontab. To overwrite the default behavior, you can use the MAILTO environment variable with a list (comma separated) of all the email addresses you want to receive the email notifications. When MAILTO is defined but empty (MAILTO=""), no mail is sent.


### Consider all your user (or custom) defined env variables are not available in crontab.

I can give you 3 solutions to have your variables available and used in your cron:

* **In the cron file itself**

{% highlight bash %}
# Env
SHELL=/bin/bash
HOME=/home/sandbox
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin:/usr/local/bin
APP_DATABASE_HOST=localhost

# Cron
* * * * * root echo "test" > /tmp/test-cron-valid.log
{% endhighlight %}

* **In a custom script sourced in the crontab line.**

I wrote an article about that few years ago:
[Access env variables from crontab into a container]({% post_url 2016-02-29-docker-crontab-environment-variables %})  
**Résumé:**  dynamically build a script that export env variables, and source this file in your crontab line.

{% highlight bash %}
* * * * * root source custom_vars.sh && echo "test" > /tmp/test-cron-valid.log
{% endhighlight %}

* **In /etc/environment**

If you want to know where cron daemon is reading system variables you can look in file `/etc/pam.d/cron`.

{% highlight bash %}
> cat /etc/pam.d/cron
# The PAM configuration file for the cron daemon

@include common-auth

# Sets the loginuid process attribute
session    required     pam_loginuid.so

# Read environment variables from pam_env's default files, /etc/environment
# and /etc/security/pam_env.conf.
session       required   pam_env.so

# In addition, read system locale information
session       required   pam_env.so envfile=/etc/default/locale

@include common-account
@include common-session-noninteractive 

# Sets up user limits, please define limits for cron tasks
# through /etc/security/limits.conf
session    required   pam_limits.so
{% endhighlight %}

In my configuration, cron daemon loads environment variables from `/etc/environment`.
So, we can add variables we want to use in cron, in this file. Either statically or dynamically.
**But all variables will be available in all cron jobs.**

As a simple example, append user variables prefixed by **CUSTOM_** into `/etc/environment`:
{% highlight bash %}
printenv | grep -E "^CUSTOM_" >> /etc/environment
{% endhighlight %}


# 6. Crontab file syntax errors (Permission denied example)

It's possible you have avoided all the previous pitfalls. But there is a few more things to worry about:
**syntax or permission errors in the crontab line itself.**

Let's take this example:

{% highlight bash %}
* * * * * www-data echo "test" >> /var/log/test-cron.log
{% endhighlight %}

* Every minute of every hour, of every...
* as the **www-data** user...
* we (try to) append the word "test"...
* in the file `/var/log/test-cron.log`

**But...** the log file `/var/log/test-cron.log` is never created and there is no error in syslog.

{% highlight bash %}
>tail -50f /var/log/cron.log
Apr  8 19:31:01 node1 CRON[30034]: (www-data) CMD (echo "test" > /var/log/test-cron.log)
{% endhighlight %}

{% highlight bash %}
>cat /var/log/test-cron.log
cat: /var/log/test-cron.log: No such file or directory
{% endhighlight %}

Actually, when there is an error in the crontab line (Syntax, permission,...), cron daemon sends an email with the error.
* If you have configured everything correctly to send emails from your server, you will have to look in your email box.
* If not, just have a look in the `/var/spool/mail/{USER}` file, where emails are stored.
The USER is the one defined in the crontab line. "www-data" in the example.


{% highlight bash %}
>cat /var/spool/mail/www-data
From www-data@node1 Wed Apr 08 19:33:01 2020
Return-path: <www-data@node1>
Envelope-to: www-data@node1
Delivery-date: Wed, 08 Apr 2020 19:33:01 +0200
Received: from www-data by node1
	(envelope-from <www-data@node1>)
	id qdlaAZel-Asd54-ddlzt
	for www-data@node1; Wed, 08 Apr 2020 19:33:01 +0200
From: root@node1 (Cron Daemon)
To: www-data@node1
Subject: Cron <www-data@node1> echo "test" > /var/log/test-cron.log
MIME-Version: 1.0
Content-Type: text/plain; charset=US-ASCII
Content-Transfer-Encoding: 8bit
X-Cron-Env: <SHELL=/bin/sh>
X-Cron-Env: <HOME=/var/www/home>
X-Cron-Env: <PATH=/usr/bin:/bin>
X-Cron-Env: <LOGNAME=www-data>
Message-Id: <qdlaAZel-Asd54-ddlzt@node1>
Date: Wed, 08 Apr 2020 19:33:01 +0200

/bin/sh: 1: cannot create /var/log/test-cron.log: Permission denied
{% endhighlight %}

**Tadaaam!!**

# Resources

* My personal experience with docker and cron
* [https://www.pantz.org/software/cron/croninfo.html](https://www.pantz.org/software/cron/croninfo.html)
* [https://stackoverflow.com/questions/729692/why-should-text-files-end-with-a-newline#answer-729795](https://stackoverflow.com/questions/729692/why-should-text-files-end-with-a-newline#answer-729795)
* [https://serverfault.com/questions/566437/cron-task-error-wrong-file-owner#answer-566442](https://serverfault.com/questions/566437/cron-task-error-wrong-file-owner#answer-566442)
* [https://linuxize.com/post/scheduling-cron-jobs-with-crontab/](https://linuxize.com/post/scheduling-cron-jobs-with-crontab/)
* [https://www.unix.com/shell-programming-and-scripting/163494-setting-environment-variables-cron-file.html](https://www.unix.com/shell-programming-and-scripting/163494-setting-environment-variables-cron-file.html)
