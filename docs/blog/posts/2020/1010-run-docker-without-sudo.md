---
authors:
  - PaPu
categories:
  - devops
date: 2020-10-10
draft: false
---

# Run Docker commands without sudo

1. Add `docker` group if it doesn't already exist ( It should be already existed).

```sh linenums="1"
  sudo groupadd docker
```

2. Add current user `$USER` to the docker group

```sh linenums="1"
  sudo gpasswd -a $USER docker
```

<!-- more -->

3. Restart the docker daemon

```sh linenums="1"
  sudo service docker restart
```
