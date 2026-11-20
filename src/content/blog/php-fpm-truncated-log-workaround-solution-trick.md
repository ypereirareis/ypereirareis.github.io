---
title: "Docker and PHP-FPM truncated logs: workaround"
description: "PHP-FPM 7.0 to 7.2 truncates log lines written to stdout/stderr in Docker containers. Here is the workaround, and the fix shipped with PHP 7.3."
pubDate: 2019-07-30
updatedDate: 2020-04-09
tags: [operations, platform]
---

![PHP-FPM](../../assets/posts/php-fpm.gif)

## PHP-FPM truncated logs problem

[BUG] - [https://bugs.php.net/bug.php?id=71880](https://bugs.php.net/bug.php?id=71880)

- When you write to STDOUT or STDERR (php://stdout OR php://stderr) PHP-FPM creates a warning in log files.
- This is a problem when you want to run PHP-FPM in a docker container. It's common practice for docker containers to write any log output to STDOUT/STDERR.
- If you do this e.g. with the official php-fpm docker image, you'll end up with tons of ugly warnings like above. Right now there's no way to get rid of these warnings. It will also split up a single multi-line output into several distinct warnings.

```bash
WARNING: [pool www] child 12 said into stdout: "my output string..."
```

## Workaround, trick or configuration for PHP-FPM truncated logs

### PHP 7.0, 7.1 and 7.2

Nothing can be configured to avoid this problem. If you read the issue referenced in the first part of this article,
you can see that workarounds are possible. Let's see the one I implemented in my php-fpm containers before php 7.3:

- Use a named pipe created in the container.
- tail the named pipe stream to the container output.

#### Docker entrypoint script

```bash
# ...SOME_CODE_HERE...

## Named pipe for application logs.
## Trick for bug : https://bugs.php.net/bug.php?id=71880
NAMED_PIPED="/tmp/stdout"

rm -rf "$NAMED_PIPED" || true
mkfifo --mode 600 "${NAMED_PIPED}" || true
chown "CORRECT_UID_HERE_OR_MAYBE_www-data" "${NAMED_PIPED}"
echo  "Named pipe: ($NAMED_PIPED) creation OK"

(tail -q -f ${NAMED_PIPED} >> /proc/self/fd/2 || pkill php-fpm) &

# ...SOME_CODE_HERE...

```

#### Write to named pipe instead of php://stderr and php://stdout

For instance with monolog you can write that kind of configuration:

```yaml
monolog:
  handlers:
    main:
      type: stream
      path: "/tmp/stdout"
      level: error
```

**Note that the path in monolog must match the named pipe name.**

### PHP 7.3

You can disable workers output decoration with a simple configuration in `www.conf` for the fpm pool.
You will have standard logs without decoration and ugly WARNINGS.

```shell
decorate_workers_output = no
```
