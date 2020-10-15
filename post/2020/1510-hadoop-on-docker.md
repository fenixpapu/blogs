1. Run docker

- If master note `-p 9000:9000`.

  ```sh
  docker run -it -d -p 9000:9000 --privileged=true --name centos8-master centos:centos8 "/sbin/init"
  ```

- Why `ssh localhost` when runt with /bin/bash

2. Access container

```sh
docker exec -it centos8 /bin/bash
```

3. Add user and add to group root

```sh
yum update
yum install passwd -y
yum install sudo
adduser master
passwd master # set pass 12345678
usermod -aG wheel master
```

4. Login with user created previous

```sh
su - master
sudo yum -y install openssh-server openssh-clients
```

- After this step it default we work on path: `/home/<user>`

5. Enable ssh (include ignore passphrase and add authorized_keys)

```sh
# check ssh status will failed
sudo systemctl status sshd
sudo systemctl start sshd

# check ssh again should show login info
ssh localhost

#ignore passphrase and add authorized_keys
ssh-keygen -t rsa -P '' -f ~/.ssh/id_rsa
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
chmod 0600 ~/.ssh/authorized_keys
```

6. Download and install java8 and hadoop

- If use container should mount rather than download on each of container

- Hadoop's stables version are [here](https://downloads.apache.org/hadoop/common/stable/)
- This is current latest stable version: https://downloads.apache.org/hadoop/common/stable/hadoop-3.2.1.tar.gz

  ```sh
  sudo yum install java-1.8.0-openjdk
  sudo yum install wget
  wget https://downloads.apache.org/hadoop/common/stable/hadoop-3.2.1.tar.gz
  ```

- Extract hadoop binary:

  ```sh
  tar -xvf hadoop-3.2.1.tar.gz
  ```

7. Edit `/etc/environment` and `~/.bashrc`

- Edit file `/etc/environemnt`

```sh
# sudo vim /etc/environment
export JAVA_HOME='/usr/lib/jvm/java-1.8.0-openjdk-1.8.0.265.b01-0.el8_2.x86_64/jre'
export HADOOP_HOME=$HOME/hadoop-3.2.1
```

- Edit file `~/.bashrc`

```sh
# sudo vim ~/.bashrc
export JAVA_HOME='/usr/lib/jvm/java-1.8.0-openjdk-1.8.0.265.b01-0.el8_2.x86_64/jre'
export PATH=$PATH:$JAVA_HOME/bin

export HADOOP_HOME=$HOME/hadoop-3.2.1
export PATH=$PATH:$HADOOP_HOME/bin:$HADOOP_HOME/sbin
```

- Reload apply change

```sh
source /etc/environment
source ~/.bashrc
```

8. Edit hadoop config

- Edit `/hadoop-3.2.1/etc/hadoop/hadoop/hadoop-env.sh`

```sh
export HADOOP_PREFIX=$HOME/hadoop-3.2.1
```

- Edit `/hadoop-3.2.1/etc/hadoop/hadoop/core-site.xml`

```sh
  <configuration>
      <property>
          <name>fs.defaultFS</name>
          <value>hdfs://localhost:9000</value>
      </property>
  </configuration>
```

- Edit `/hadoop-3.2.1/etc/hadoop/hdfs-site.xml`

```sh
  <configuration>
      <property>
          <name>dfs.name.dir</name>
          <value>/home/masters/hadoop-3.2.1/data/namenode</value>
      </property>
      <property>
          <name>dfs.data.dir</name>
          <value>/home/masters/hadoop-3.2.1/data/datanode</value>
      </property>
      <property>
        <name>dfs.replication</name>
        <value>1</value>
    </property>
  </configuration>
```

- Edit `/hadoop-3.2.1/etc/hadoop/mapred-site.xml`

```ssh
  <configuration>
      <property>
          <name>mapreduce.framework.name</name>
          <value>yarn</value>
      </property>
  </configuration>
```

- Edit `/hadoop-3.2.1/etc/hadoop/yarn-site.xml`

```sh
  <configuration>
      <property>
          <name>yarn.resourcemanager.hostname</name>
          <value>localhost</value>
      </property>
      <property>
        <name>yarn.nodemanager.aux-services</name>
        <value>mapreduce_shuffle</value>
      </property>
  </configuration>
```
