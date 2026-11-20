---
title: "DoctrineMongoDBBundle: multiple connections and auth"
description: "Configure several MongoDB connections with authentication in DoctrineMongoDBBundle, and fix the SASL authentication and missing service errors."
pubDate: 2015-11-12
updatedDate: 2020-04-09
tags: [development]
---

The DoctrineMongoDbBundle documentation is not really clear. The default configuration with a single connection
and no authentication works pretty well (as described in the doc), but if we want to work with many authenticated connections,
it's not really easy to set up because the doc does not explain the configuration clearly.

![Symfony](../../assets/posts/symfony.gif)

## Connection string / server

The server (connection string) section must contain several elements:

- The hostname
- The username
- The password
- The port

An example where:

- **john** is the username
- **doe** the password
- **mongo** the hostname (could be 127.0.0.1)
- **27017** the port

```bash
mongodb://john:doe@mongo:27017
```

## Connections / Managers

- The identifiers for connections and managers **must be** equal.

```bash
doctrine_mongodb:
    connections:
        first:
            ...
        second:
            ...
    document_managers:
        first:
            connection: first
            ...
        second:
            connection: second
            ...
```

- The database configuration must be present in the **connections section** and in **the managers section**.

```bash
doctrine_mongodb:
    connections:
        first:
            ...
            options:
                ...
                db: my-database-1
    document_managers:
        first:
            database: my-database-1
            ...
```

## The full minimal configuration with multiple authenticated connections

```bash
doctrine_mongodb:
    default_connection: second
    default_document_manager: second
    connections:
        first:
            server: mongodb://john-1:doe-1@mongo-1:27017
            options:
                connect: true
                db:  my-database-1
        second:
            server: mongodb://john-2:doe-2@mongo-2:27017
            options:
                connect: true
                db: my-database-2
    document_managers:
        first:
            connection: first
            database:  my-database-1
            auto_mapping: true
        second:
            connection: second
            database:  my-database-2
            auto_mapping: true

```

## Docker

If you work with **docker**, and **docker-compose** you could use this image/configuration:

```bash
mongo:
    image: frodenas/mongodb
    command: --nojournal --smallfiles --rest --httpinterface
    environment:
        MONGODB_USERNAME: john-1
        MONGODB_PASSWORD: doe-1
        MONGODB_DBNAME: my-database-1
    ports:
        - 28017:28017
```

And create a link with your **app** container:

```bash
web:
    ...
    links:
        - mongo
```
