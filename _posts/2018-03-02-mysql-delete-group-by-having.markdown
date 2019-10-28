---
layout: post
title: "How to delete data in MYSQL with DELETE, GROUP BY and HAVING clauses"
excerpt: "With MySQL, DELETE operations are not always easy (join, sub queries,...), let's see how to DELETE with GROUP BY and HAVING constraints with a single command."
tags: [mysql, delete, group by, having, sub select]
image: mysql.jpg
comments: true
last_modified_at: "2020-04-09"
---

![Docker](/images/posts/mysql.jpg)

# MySQL Delete with Group By and Having clauses.

To achieve this exploit with a single simple MySQL command, we are using two useful functions:

* **1. [GROUP_CONCAT()](https://dev.mysql.com/doc/refman/5.7/en/group-by-functions.html#function_group-concat)**

> This function returns a string result with the concatenated non-NULL values from a group. It returns NULL if there are no non-NULL values.

* **2. [FIND_IN_SET()](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_find-in-set)**

> Returns a value in the range of 1 to N if the string str is in the string list strlist consisting of N substrings. A string list is a string composed of substrings separated by , characters. If the first argument is a constant string and the second is a column of type SET, the FIND_IN_SET() function is optimized to use bit arithmetic. Returns 0 if str is not in strlist or if strlist is the empty string. Returns NULL if either argument is NULL. This function does not work properly if the first argument contains a comma (,) character.


## Select the ids we want to delete with the GROUP BY and HAVING clauses

```shell
SELECT group_concat(id) AS ids_to_delete
FROM table
GROUP BY field_1, field_2,...
HAVING count(*) >= 5
```

The result will look like that:

```shell
---------------
ids_to_delete
---------------
1,34,87,8756,4657,34
```

## Delete rows directly using this list of ids.

To do this we use the `FIND_IN_SET()` function.

> **[EDIT 1] (David Gurba)**<br />
> [group_concat_max_len](https://dev.mysql.com/doc/refman/5.7/en/server-system-variables.html#sysvar_group_concat_max_len):
> The maximum permitted result length in bytes for the GROUP_CONCAT() function. The default is 1024.<br />
> SET SESSION group_concat_max_len=4294967295;<br />
> SET GLOBAL group_concat_max_len=18446744073709551615;


```shell
DELETE FROM table
WHERE FIND_IN_SET(id, (
  SELECT ids_to_delete
  FROM (
     SELECT group_concat(id) AS ids_to_delete
     FROM table
     GROUP BY field_1, field_2,...
     HAVING count(*) >= 5
   ) t
))
```

## Dry run - If you want to check what you will remove before really doing it:

`DELETE FROM table` => `SELECT * FROM table`

```shell
SELECT * FROM table
WHERE FIND_IN_SET(id, (
  SELECT ids_to_delete
  FROM (
     SELECT group_concat(id) AS ids_to_delete
     FROM table
     GROUP BY field_1, field_2,...
     HAVING count(*) >= 5
   ) t
))
```

**That's all ;)**