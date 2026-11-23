---
title: "Symfony dynamic services with the expression language"
description: "Create and inject Symfony services dynamically, depending on the environment or on environment variables, with the expression language."
pubDate: 2016-01-25
updatedDate: 2020-04-09
tags: [development]
---

There are many use cases where it's useful to inject different services based
on the Symfony environment or on another param such as an env variable for instance.

**Example 1**

- In Symfony **dev** env we want to use mailcatcher to send/receive emails.
- In Symfony **prod** env we want to use postfix to send emails.

**Example 2**

- In Symfony **prod** env on a staging server we want to use mailcatcher to send/receive emails.
- In Symfony **prod** env on the production server we want to use postfix to send emails.

## Example 1: environments

**config.yml**

```bash

# Swiftmailer Configuration
swiftmailer:
    default_mailer: default
    mailers:
        default:
            transport:  "%mailer_transport%"
            host:       "%mailer_host%"
            username:   "%mailer_user%"
            password:   "%mailer_password%"
        mailcatcher:
            host:       "%mailcatcher_host%"
            port:       "%mailcatcher_port%"
            username:   null
            password:   null

services:
    class: AppBundle\Service\MailerService
    arguments:
        mailer: @swiftmailer.mailer.default
```

**config_dev.yml**

```bash

# Swiftmailer Configuration
services:
    class: AppBundle\Service\MailerService
    arguments:
        mailer: @swiftmailer.mailer.mailcatcher
```

## Example 2: environment variables and parameters

Get the value of an env variable on your system and build a symfony parameter:

**CLI**

```bash
export SYMFONY__APP__MAILER="mailcatcher"
```

**Apache**

```bash
SetEnv SYMFONY__APP__MAILER ${SYMFONY__APP__MAILER}
```

Inject the service dynamically based on this parameter

**config.yml** or **services.yml**

```bash

parameters:
    mail_config: %app.mailer%

# Swiftmailer Configuration
services:
    class: AppBundle\Service\MailerService
    arguments:
        mailer: "@=parameter('mail_config') == 'mailcatcher' ? service('swiftmailer.mailer.mailcatcher') : service('swiftmailer.mailer.default')"

```

## TIPS

Use a [docker container for mailcatcher](https://github.com/zolweb/docker-mailcatcher)
