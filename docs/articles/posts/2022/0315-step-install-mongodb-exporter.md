# Step install mongodb exporter

## Pre-requisite task

- Create database user for mongodb exporter

```linenums="1"
db.getSiblingDB("admin").createUser({
  user: "mongodb_exporter",
  pwd: "<password>",
  roles: [
      { role: "clusterMonitor", db: "admin" },
      { role: "readAnyDatabase", db: "admin" }
  ]
})
```

## Step to create mongodb docker

- For mongodb exporter we use the prometheus official docker image:

```linenums="1"
$ git clone https://github.com/percona/mongodb_exporter.git
$ cd mongodb_exporter/
$ make docker
$ docker run --restart=always --detach=true -p 9216:9216 --name=mongodb_exporter mongodb-exporter:master --mongodb.uri=<URI>
```

- Where URI is in the form of mongodb://<USER>:<PASSWORD>@mongodb-1.com,mongodb-2.com,mongodb-3.com
