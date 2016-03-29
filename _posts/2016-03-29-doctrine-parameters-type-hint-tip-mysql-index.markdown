---
layout: post
title: "Doctrine performance tip with MySQL and indexes, parameters type hinting"
excerpt: "If we do not write DQL queries correctly, we could have big performance problems"
tags: [doctrine, DQL, inner join, join, index, indexes, mysql]
image: doctrine.png
comments: true
---

As you may know, [Doctrine](http://www.doctrine-project.org/) can be a very good ally, but if we do not use it correctly
we can have big performance problems really easily and quickly.

![Symfony](/images/posts/doctrine.png)

Let's take these two tables as an example:

**Players**

{% highlight bash %}

+------------------------------+--------------+------+-----+---------+-------+
| Field                        | Type         | Null | Key | Default | Extra |
+------------------------------+--------------+------+-----+---------+-------+
| id                           | int(11)      | NO   | PRI | NULL    |       |
| name                         | varchar(255) | YES  |     | NULL    |       |
+------------------------------+--------------+------+-----+---------+-------+

{% endhighlight %}

**Players Actions**

Players can do actions, each action is defined by a name and a format.
Of course, an action is done by a single player.
A Player can do an action of a given format only once. (Not really important actually)

{% highlight bash %}

+------------+-------------+------+-----+---------+----------------+
| Field      | Type        | Null | Key | Default | Extra          |
+------------+-------------+------+-----+---------+----------------+
| id         | int(11)     | NO   | PRI | NULL    | auto_increment |
| player_id  | int(11)     | NO   | MUL | NULL    |                |
| action     | varchar(20) | NO   |     | NULL    |                |
| format     | varchar(20) | NO   |     | NULL    |                |
+------------+-------------+------+-----+---------+----------------+

{% endhighlight %}

# Bad DQL example

We could write this king of DQL query,
it works and it will generate a valid SQL query :

## DQL Query

In the example, let's say that the player has id 52.

{% highlight php startinline=true %}
<?php

$qb = $this->doctrine->getRepository('AppBundle:ActionPlayer')
    ->createQueryBuilder('ap')
    ->select('ap.format, ap.action, COUNT(ap.player) AS value')
    ->andWhere('ap.player = :player')->setParameter('player', $player)
    ->addGroupBy('ap.player')
    ->addGroupBy('ap.format')
    ->addGroupBy('ap.action')
;

{% endhighlight %}

## Generated SQL (Mysql)

{% highlight bash %}

SELECT g0_.format AS format_0, g0_.action AS action_1, COUNT(g0_.player_id) AS sclr_2
FROM action_player g0_
WHERE g0_.player_id = '52'
GROUP BY g0_.player_id, g0_.format, g0_.action;

{% endhighlight %}

# Good DQL example (not really actually)

## DQL Query

In the example, let's say that the player has id 52.

{% highlight php startinline=true %}
<?php

$qb = $this->doctrine->getRepository('CommonBundle:Stats\StatActionPlayer')
    ->createQueryBuilder('ap')
    ->select('ap.format, ap.action, COUNT(ap.player) AS value')
    ->innerJoin('ap.player', 'player')
    ->andWhere('player.id = :player_id')->setParameter('player_id', $player)
    ->addGroupBy('ap.player')
    ->addGroupBy('ap.format')
    ->addGroupBy('ap.action')
;
{% endhighlight %}

## Generated SQL (Mysql)

{% highlight bash %}

SELECT g0_.format AS format_0, g0_.action AS action_1, COUNT(g0_.player_id) AS sclr_2
FROM action_player g0_
INNER JOIN player g1_ ON g0_.player_id = g1_.id
WHERE g1_.id = '52'
GROUP BY g0_.player_id, g0_.format, g0_.action;

{% endhighlight %}


# So! What's the problem ?

Let's say we have millions of rows in our `action_player` table...
We need an index to improve SELECT performance:

{% highlight bash %}
ALTER TABLE action_player ADD INDEX action_player_idx (player_id, format, action);
{% endhighlight %}

**Important to note that the index must contains `GROUP BY` fields AND field used in `WHERE` clause.**

Actually, if we go back to our two previous SQL queries (auto generated)
and we try to execute them on our table with millions of rows and the above index:

* The first one gives results in about **3,9s**.
* The second one gives results in about **0,36s**.

## The difference is HUGE....

How are those two queries really executed by MySQL ?

{% highlight bash %}
mysql> EXPLAIN SELECT g0_.format AS format_0, g0_.action AS action_1, COUNT(g0_.player_id) AS sclr_2
    -> FROM action_player g0_
    -> WHERE g0_.player_id = '52'
    -> GROUP BY g0_.player_id, g0_.format, g0_.action;
+----+-------------+-------+------+-----------------------------------------+----------------------+...
| id | select_type | table | type | possible_keys                           | key                  |...
+----+-------------+-------+------+-----------------------------------------+----------------------+...
|  1 | SIMPLE      | g0_   | ref  | IDX_4D92B9D399E6F5DF, action_player_idx | IDX_4D92B9D399E6F5DF |...
+----+-------------+-------+------+-----------------------------------------+----------------------+...
1 row in set (0.00 sec)
{% endhighlight %}

{% highlight bash %}
mysql> EXPLAIN SELECT g0_.format AS format_0, g0_.action AS action_1, COUNT(g0_.player_id) AS sclr_2
    -> FROM action_player g0_
    -> INNER JOIN player g1_ ON g0_.player_id = g1_.id
    -> WHERE g1_.id = '52'
    -> GROUP BY g0_.player_id, g0_.format, g0_.action;
+----+-------------+-------+-------+-----------------------------------------+-------------------+...
| id | select_type | table | type  | possible_keys                           | key               |...
+----+-------------+-------+-------+-----------------------------------------+-------------------+...
|  1 | SIMPLE      | g1_   | const | PRIMARY                                 | PRIMARY           |...
|  1 | SIMPLE      | g0_   | ref   | IDX_4D92B9D399E6F5DF, action_player_idx | action_player_idx |...
+----+-------------+-------+-------+-----------------------------------------+-------------------+...
2 rows in set (0.00 sec)
{% endhighlight %}

* In the first case the created index **IS NOT** used.
* The index **IS** used in the second case.

## Explanation

* When an index is created, it takes into account the type of columns used in the index.
* The player id field is an integer, so the index is created with an integer for the player_id field.
* In the bad DQL example, Doctrine generates an SQL query with `WHERE g0_.player_id = '52'` **and NO join**, the index is not used !
* In the good DQL example, Doctrine generates an SQL query with `WHERE g0_.player_id = '52'` **AND a join on player table**, the index is used for the inner join !


# The solution, improve your DQL queries with type hinting.

In these two examples, we can see that the generated SQL contains this part `WHERE g1_.id = '52'`.

Actually, THIS IS the problem, not really the join between tables.
In both DQL queries the `player_id` is used as a string but it should be as an integer.

Always add type hinting to your DQL parameters:

{% highlight php startinline=true %}
<?php

$qb = $this->doctrine->getRepository('AppBundle:ActionPlayer')
    ->createQueryBuilder('ap')
    ->select('ap.format, ap.action, COUNT(ap.player) AS value')
    ->andWhere('ap.player = :player')->setParameter('player', (int) $player)
    ->addGroupBy('ap.player')
    ->addGroupBy('ap.format')
    ->addGroupBy('ap.action')
;

{% endhighlight %}

Or you could use the third parameter of the `setParameter()` method:

{% highlight php startinline=true %}
<?php

->andWhere('ap.player = :player')->setParameter('player', $player, \Doctrine\DBAL\Types\Type::INTEGER)

{% endhighlight %}

**No more join needed to filter by player_id** and the index will be used as it should be.

