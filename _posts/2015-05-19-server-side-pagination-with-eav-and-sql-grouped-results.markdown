---
layout: post
title:  "Server side SQL pagination with EAV database model and grouped attributes"
description: "How to build a server side SQL pagination with EAV database model and many grouped attributes for each paginated element"
---

Pagination is a common thing a developer has to deal with when building an application.
Lists of products, users, events, or whatever presented to the user,
have to be paginated to offer a good user experience or deal with big number of items.

Pagination can be done server side or client side, each solution with its advantages and drawbacks.
In this article, we'll speak about server side pagination in a particular context.

We want and need to paginate **grouped and sorted attributes**,
each virtual element to paginate being composed of many grouped items.

## Entity-Attribute-Value model (EAV)

Entity–attribute–value model (EAV) is a data model to describe entities
where the number of attributes (properties, parameters) that can be used
to describe them is potentially vast, but the number that will actually
apply to a given entity is relatively modest. Read more on [EAV](http://en.wikipedia.org/wiki/Entity%E2%80%93attribute%E2%80%93value_model).

**Model example**

![EAV](/assets/images/posts/eav.png)



## Another way to paginate grouped and sorted elements

## Symfony, Doctrine and DQL example

## Conclusion
