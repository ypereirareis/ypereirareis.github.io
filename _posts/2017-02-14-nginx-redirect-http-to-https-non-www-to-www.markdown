---
layout: post
title: "Nginx redirect http to https and non www to www"
excerpt: "For SEO and security reasons it's important to set SSL/HTTPS on web servers and websites. It's important to avoid duplicate content for www and non www urls. Redirect http to https."
tags: [nginx, redirect, forward, ssl, https, http, www, non-www, encryption]
image: nginx.gif
comments: true
---

![Docker](/images/posts/nginx.gif)

# Redirect HTTP to HTTPS (http://www.example.com to https://example.com)

{% highlight bash %}
server {
	server_name www.example.com;
	listen 80 ;
	access_log /var/log/nginx/access.log vhost;
	return 301 https://$host$request_uri;
}
{% endhighlight %}

# Redirect non-WWW to WWW (https://example.com to https://www.example.com)

**SSL certificate configuration must be defined**

* ssl_certificate /etc/nginx/certs/example.com.crt;
* ssl_certificate_key /etc/nginx/certs/example.com.key;
* ssl_dhparam /etc/nginx/certs/example.com.dhparam.pem;

{% highlight bash %}
server {
	server_name example.com;
	listen 443 ssl http2 ;
	ssl_certificate /etc/nginx/certs/example.com.crt;
	ssl_certificate_key /etc/nginx/certs/example.com.key;
	ssl_dhparam /etc/nginx/certs/example.com.dhparam.pem;
	return 301 $scheme://www.example.com$request_uri;
}
{% endhighlight %}

# Redirect http://example.com to https://www.example.com

{% highlight bash %}
server {
	listen 80;
	server_name example.com;
	return 301 https://www.example.com$request_uri;
}
{% endhighlight %}

We could have merged this configuration with the first one :

{% highlight bash %}
server {
  listen 80 ;
  server_name example.com www.example.com;
  return 301 https://$server_name$request_uri;
}
{% endhighlight %}


# Redirect IP address to domain name

**Of course your SSL certificate must be valid for the IP address**

{% highlight bash %}
server {
  listen 80;
  server_name xxx.xxx.xxx.xxx;
  return 301 https://example.com$request_uri;
}

server {
  server_name xxx.xxx.xxx.xxx;
  listen 443 ssl http2 ;
  ssl_certificate /etc/nginx/certs/example.com.crt;
  ssl_certificate_key /etc/nginx/certs/example.com.key;
  ssl_dhparam /etc/nginx/certs/example.com.dhparam.pem;
  return 301 https://example.com$request_uri;
}
{% endhighlight %}


# Main config catching https://www.example.com used as a reverse proxy here

{% highlight bash %}
server {
	server_name www.example.com;
	listen 443 ssl http2 ;
	access_log /var/log/nginx/access.log vhost;
	ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
	ssl_ciphers 'ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA:ECDHE-RSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA:ECDHE-ECDSA-DES-CBC3-SHA:ECDHE-RSA-DES-CBC3-SHA:EDH-RSA-DES-CBC3-SHA:AES128-GCM-SHA256:AES256-GCM-SHA384:AES128-SHA256:AES256-SHA256:AES128-SHA:AES256-SHA:DES-CBC3-SHA:!DSS';
	ssl_prefer_server_ciphers on;
	ssl_session_timeout 5m;
	ssl_session_cache shared:SSL:50m;
	ssl_session_tickets off;
	ssl_certificate /etc/nginx/certs/www.example.com.crt;
	ssl_certificate_key /etc/nginx/certs/www.example.com.key;
	ssl_dhparam /etc/nginx/certs/www.example.com.dhparam.pem;
	add_header Strict-Transport-Security "max-age=31536000";
	include /etc/nginx/vhost.d/default;
	location / {
		proxy_pass http://www.example.com;
	}
}
{% endhighlight %}