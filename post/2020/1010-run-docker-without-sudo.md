# Run Docker commands without sudo

1. Add `docker` group if it doesn't already exist ( It should be already existed).

```sh
  sudo groupadd docker
```

2. Add current user `$USER` to the docker group

```sh
  sudo gpasswd -a $USER docker
```

3. Restart the docker daemon

```sh
  sudo service docker restart
```
