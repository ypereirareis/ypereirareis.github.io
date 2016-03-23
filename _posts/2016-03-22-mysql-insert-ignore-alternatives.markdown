---
layout: post
title: "MySQL INSERT IGNORE alternatives"
excerpt: "INSERT IGNORE INTO or REPLACE INTO MySQL operations are not really good practices. I advise you to replace with something else to INSERT if not exists"
tags: [mysql, insert, ignore, insert ignore, into, insert into, replace into, replace, insert into select]
image: mysql.jpg
comments: true
---

It's not always really easy to deal with "INSERT if not exists" operations.
Many solutions exist with MySQL:

* `INSERT IGNORE INTO table VALUES (...)`
* `REPLACE INTO table VALUES (...)`
* `SELECT id FROM table` then `INTO table VALUES (...)` or `UPDATE table`
* `INSERT INTO table SELECT id FROM table WHERE NOT EXISTS`

![Symfony](/images/posts/mysql.jpg)


# Problems with the three first solutions

## Insert ignore

Problems:

* No more errors triggered, but it's what we want.
* Auto increment IDs are incremented, even if a given record already exists.

## Replace into

Problems:

* Auto increment IDs are incremented, even if a given record already exists.
* This operation actually does a `DELETE` then an `INSERT`.
* If `DELETE CASCADE` configured, you're gonna blew up your database.

## Select then insert or replace

Problems:

* Many SQL queries.
* Many requests over the network.
* Less performance (execution time) than previous solutions.

# Insert into select where not exists

It's for me the best solution, but not always fits your needs:

* No ID consumption if value already exists.
* No unwanted delete in case of `DELETE CASCADE` configuration.
* A single simple mysql request.

A fully working example:

{% highlight mysql %}

INSERT INTO table_name (firstname, lastname)
SELECT 'NEW FIRSTNAME', 'NEW LASTNAME'
FROM DUAL
WHERE NOT EXISTS(
    SELECT 1
    FROM table_name
    WHERE firstname = 'NEW FIRSTNAME' AND lastname = 'NEW LASTNAME'
)
LIMIT 1;

{% endhighlight %}

**Maybe, you will need to add an index on the fields you use to filter the sub-query.**

## What is this FROM DUAL ?

Actually we could have use `FROM table_name` like that:

{% highlight mysql %}

INSERT INTO table_name ...
SELECT ...
FROM table_name
WHERE NOT EXISTS(
    ...
)
LIMIT 1;

{% endhighlight %}

**But there is a difference, if the table is empty this SQL query will never add anything in the table.**

### Yes.... what is this `FROM DUAL` ?

Just read the [MySQL documentation](http://dev.mysql.com/doc/refman/5.7/en/select.html) for `SELECT FROM DUAL`
or the [Wikipedia definition](https://en.wikipedia.org/wiki/DUAL_table).

> DUAL is purely for the convenience of people who require that all SELECT statements should have FROM and possibly other clauses.
> MySQL may ignore the clauses. MySQL does not require FROM DUAL if no tables are referenced.

If you need to add another clause like `WHERE 1=1` for the example, you will must use `FROM DUAL`:

{% highlight bash %}
mysql> select 1+1;
+-----+
| 1+1 |
+-----+
|   2 |
+-----+
1 row in set (0.00 sec)
{% endhighlight %}

{% highlight bash %}
mysql> select 1+1 WHERE 1=1;
ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'WHERE 1=1' at line 1
{% endhighlight %}

{% highlight bash %}
mysql> select 1+1 FROM DUAL WHERE 1=1;
+-----+
| 1+1 |
+-----+
|   2 |
+-----+
1 row in set (0.00 sec)
{% endhighlight %}
