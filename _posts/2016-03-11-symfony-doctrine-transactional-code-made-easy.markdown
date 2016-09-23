---
layout: post
title: "How to encapsulate your doctrine operations into transaction really easily"
excerpt: "When doing multiple database operations in a single http request, command line, method,...we often need to use a database transaction to keep data safe."
tags: [Symfony, doctrine, transaction, transactional, easy, callable, anonymous, function]
image: symfony.png
comments: true
---

When doing multiple database operations in a single http request, command line, method,...
we often need to use a database transaction to keep data safe.

![Symfony](/images/posts/symfony.png)


# Example in an Action of a Controller

{% highlight php startinline=true %}
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

{% endhighlight %}

# A better choice

* Add a method that allows you to keep your code DRY.
* This method gets a `callable` param (a function/method to execute) and deals with potential exceptions, and transaction `commit()` and `rollback()` operations.
* It's a really dead simple example and a reminder, feel free to improve it.
* You could also move it into a service for instance.

{% highlight php startinline=true %}
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

{% endhighlight %}
