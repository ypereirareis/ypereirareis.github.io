---
layout: post
title: "PHP fpm and cli error log configuration"
excerpt: "Logging errors is something essential. Let's see how to do it with php-fpm (and cli)"
tags: [php, fpm, php-fpm, cli, php-cli, error, errors, log, logs]
image: php-fpm.gif
comments: true
last_modified_at: "2020-04-09"
---

![Docker](/images/posts/php-fpm.gif)

# PHP FPM

**First of all we need to enable option `catch_workers_output` for fpm.**

> catch_workers_output **boolean**   
> Redirect worker stdout and stderr into main error log. If not set, stdout and stderr will be redirected to /dev/null according to FastCGI specs. Default value: no.

_/usr/local/etc/php-fpm.d/www.conf (in my configuration)_

* `catch_workers_output = yes`

{% highlight bash %}
sed -i '/^;catch_workers_output/ccatch_workers_output = yes' "/usr/local/etc/php-fpm.d/www.conf"
{% endhighlight %}

Or simply edit and save the file manually to uncomment line starting with `;catch_workers_output`.

**Then we need to configure log file names and locations.**

## Access log

If you want or need to activate access log at php level:

> access.log **string**  
> The access log file. Default value: not set

* `access.log = /var/log/php/fpm-access.log`

{% highlight bash %}
sed -i '/^;access.log/caccess.log = /var/log/php/fpm-access.log' "/usr/local/etc/php-fpm.d/www.conf"
{% endhighlight %}

Or simply edit and save the file manually to uncomment line starting with `;access.log`.

You will have this kind of output:

{% highlight bash %}
$ tailf var/logs/php/fpm-access.log
172.18.0.5 -  20/Feb/2017:13:07:39 +0100 "GET /app_dev.php" 200
172.18.0.5 -  20/Feb/2017:13:07:47 +0100 "POST /app_dev.php" 302
172.18.0.5 -  20/Feb/2017:13:07:47 +0100 "POST /app_dev.php" 302
172.18.0.5 -  20/Feb/2017:13:07:47 +0100 "GET /app_dev.php" 200
172.18.0.5 -  20/Feb/2017:13:07:48 +0100 "GET /app_dev.php" 302
172.18.0.5 -  20/Feb/2017:13:07:48 +0100 "GET /app_dev.php" 200
{% endhighlight %}


## Error log

Of course in production we do not want to display errors to users:

* `php_flag[display_errors] = off`

{% highlight bash %}
sed -i '/^;php_flag\[display_errors\]/cphp_flag[display_errors] = off' "/usr/local/etc/php-fpm.d/www.conf"
{% endhighlight %}

Or simply edit and save the file manually to uncomment line starting with `;php_flag[display_errors]`.

Then we must enable error log and define the error log file location :

* `php_admin_value[error_log] = /var/log/php/fpm-error.log`
* `php_admin_flag[log_errors] = on`

{% highlight bash %}
sed -i '/^;php_admin_value\[error_log\]/cphp_admin_value[error_log] = /var/log/php/fpm-error.log' "/usr/local/etc/php-fpm.d/www.conf"
sed -i '/^;php_admin_flag\[log_errors\]/cphp_admin_flag[log_errors] = on' "/usr/local/etc/php-fpm.d/www.conf"
{% endhighlight %}

Or simply edit and save the file manually to uncomment lines starting with `;php_admin_value[error_log]` and `;php_admin_flag[log_errors]`.

You will have this kind of output:

{% highlight bash %}
$ tailf var/logs/php/fpm-error.log
[20-Feb-2017 13:33:46 Europe/Paris] PHP Parse error:  syntax error, unexpected '8' (T_LNUMBER), expecting variable (T_VARIABLE) or '{' or '$' in /var/www/html/web/app_dev.php on line 26
{% endhighlight %}


You also could change log level:

> log_level **string**  
> Error log level. Possible values: alert, error, warning, notice, debug. Default value: notice.

{% highlight bash %}
sed -i '/^;log_level/clog_level = error' "/usr/local/etc/php-fpm.d/www.conf"
{% endhighlight %}

## Important

Log files must have correct access rights (owner) and must exist:

{% highlight bash %}
mkdir -p /var/log/php
touch /var/log/php/fpm-access.log
touch /var/log/php/fpm-error.log
chown -R www-data:www-data /var/log/php
{% endhighlight %}


# PHP CLI

To enable php CLI errors, we need to add these lines into the (cli) php.ini file.

_This configuration is for production not for debug or development._ 

{% highlight bash %}

error_reporting = E_ALL
display_startup_errors = Off
ignore_repeated_errors = Off
ignore_repeated_source = Off
html_errors = Off
track_errors = Off
display_errors = Off
log_errors = On
error_log = /var/log/php/cli-error.log

{% endhighlight %}

# Conclusion

Using the given configuration you should have those logs:

{% highlight bash %}
$ ll var/logs/php              
total 256K
-rw-r--r-- 1 82 82    0 févr. 17 09:35 cli-error.log
-rw-r--r-- 1 82 82  64K févr. 20 13:34 fpm-access.log
-rw-r--r-- 1 82 82  186 févr. 20 13:33 fpm-error.log
{% endhighlight %}

Do NOT forget to enable log rotation, you will have:

{% highlight bash %}
$ ll var/logs/php              
total 256K
-rw-r--r-- 1 82 82    0 févr. 17 09:35 cli-error.log
-rw-r--r-- 1 82 82  390 févr. 17 09:35 cli-error.log-20170217
-rw-r--r-- 1 82 82  64K févr. 20 13:34 fpm-access.log
-rw-r--r-- 1 82 82  100 févr. 17 09:35 fpm-access.log-20170217.gz
-rw-r--r-- 1 82 82 172K févr. 18 02:00 fpm-access.log-20170218
-rw-r--r-- 1 82 82  186 févr. 20 13:33 fpm-error.log
-rw-r--r-- 1 82 82  374 févr. 17 09:35 fpm-error.log-20170217
{% endhighlight %}
