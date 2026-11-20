---
title: "Wrap Doctrine operations in a transaction, the easy way"
description: "Several database operations in one request or command should run in a transaction. A small helper wraps them in a callable, with rollback on failure."
pubDate: 2016-03-11
updatedDate: 2020-04-09
tags: [development]
---

When doing multiple database operations in a single http request, command line, method,...
we often need to use a database transaction to keep data safe.

![Symfony](../../assets/posts/symfony.gif)

## Example in an Action of a Controller

```php
<?php
public function testAction()
{
    $conn = $this->getDoctrine()->getConnection();
    $conn->setAutoCommit(false);
    $conn->beginTransaction();

    try {
        $everythingIsFine = $this->get('service')->do();
        if ($everythingIsFine) {
            $conn->commit();
            return new Response("OK");
        }

        $conn->rollback();
        return new Response("NOT OK");

    } catch (\Exception $ex) {
        $conn->rollback();
        return new Response("NOT OK");
    }
}

```

## A better choice

- Add a method that allows you to keep your code DRY.
- This method gets a `callable` param (a function/method to execute) and deals with potential exceptions, and transaction `commit()` and `rollback()` operations.
- It's a really dead simple example and a reminder, feel free to improve it.
- You could also move it into a service for instance.

```php
<?php

protected function transactionalExec(callable $func)
{
    $conn = $this->getDoctrine()->getConnection();
    $conn->setAutoCommit(false);
    $conn->beginTransaction();

    try {
        $success = $func();

        if (null === $success) {
            throw new \Exception('Your transactional callable must return a boolean value');
        }

        if ($success) {
            $conn->commit();
        } else {
            $conn->rollback();
        }

    } catch (\Exception $ex) {
        $conn->rollback();
        $success = false;
    }


    return $success;
}

public function testAction()
{

    $transactionalSuccess = $this->transactionalExec(function()
        use (...)
    {
        $everythingIsFine = $this->get('service')->do();

        return $everythingIsFine;
    });

    if ($transactionalSuccess) {
        return new Response("OK");
    }

    return new Response("NOT OK");

}

```
