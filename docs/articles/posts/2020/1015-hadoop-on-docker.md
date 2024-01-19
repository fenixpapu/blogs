# Install hadoop cluster

## Run docker

- If master note `-p 9000:9000`.

```sh linenums="1"
docker run -it -d -p 9000:9000 --privileged=true --name centos8-master centos:centos8 "/sbin/init"
```

- Why `ssh localhost` when runt with /bin/bash

## Access container

```sh linenums="1"
docker exec -it centos8 /bin/bash
```

## Install package

```sh linenums="1"
yum update
yum install passwd -y
yum install sudo
yum install wget
yum -y install openssh-server openssh-clients

```

## Add user and add to group root

```sh linenums="1"
adduser master
passwd master # set pass 12345678
usermod -aG wheel master
```

## Login with user created previous

```sh linenums="1"
su - master
```

- After this step it default we work on path: `/home/<user>`

## Enable ssh (include ignore passphrase and add authorized_keys)

```sh linenums="1"
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

## Download and install java8 and hadoop

- If use container should mount rather than download on each of container

- Hadoop's stables version are [here](https://downloads.apache.org/hadoop/common/stable/)
- This is current latest stable version: https://downloads.apache.org/hadoop/common/stable/hadoop-3.2.1.tar.gz

```sh linenums="1"
sudo yum install java-1.8.0-openjdk
sudo yum install wget
wget https://downloads.apache.org/hadoop/common/stable/hadoop-3.2.1.tar.gz
```

- Extract hadoop binary:

```sh linenums="1"
tar -xvf hadoop-3.2.1.tar.gz
```

## Edit `/etc/environment` and `~/.bashrc`

- Edit file `/etc/environemnt`

```sh linenums="1"
# sudo vim /etc/environment
export JAVA_HOME='/usr/lib/jvm/java-1.8.0-openjdk-1.8.0.265.b01-0.el8_2.x86_64/jre'
export HADOOP_HOME=$HOME/hadoop-3.2.1
```

- Edit file `~/.bashrc`

```sh linenums="1"
# sudo vim ~/.bashrc
export JAVA_HOME='/usr/lib/jvm/java-1.8.0-openjdk-1.8.0.265.b01-0.el8_2.x86_64/jre'
export PATH=$PATH:$JAVA_HOME/bin

export HADOOP_HOME=$HOME/hadoop-3.2.1
export HADOOP_INSTALL=$HADOOP_HOME
export HADOOP_MAPRED_HOME=$HADOOP_HOME
export HADOOP_COMMON_HOME=$HADOOP_HOME
export HADOOP_HDFS_HOME=$HADOOP_HOME
export YARN_HOME=$HADOOP_HOME

export PATH=$PATH:$HADOOP_HOME/bin:$HADOOP_HOME/sbin
```

- Edit file `~/.bash_profile`

```sh linenums="1"
#sudo vim ~/.bash_profile
export JAVA_HOME='/usr/lib/jvm/java-1.8.0-openjdk-1.8.0.265.b01-0.el8_2.x86_64/jre'
export PATH=$PATH:$JAVA_HOME/bin

export HADOOP_HOME=$HOME/hadoop-3.2.1
export HADOOP_INSTALL=$HADOOP_HOME
export HADOOP_MAPRED_HOME=$HADOOP_HOME
export HADOOP_COMMON_HOME=$HADOOP_HOME
export HADOOP_HDFS_HOME=$HADOOP_HOME
export YARN_HOME=$HADOOP_HOME

export PATH=$PATH:$HADOOP_HOME/bin:$HADOOP_HOME/sbin
```

- Reload apply change

```sh linenums="1"
source /etc/environment
source ~/.bashrc
source ~/.bash_profile
```

## Edit hadoop config For nameNode

- Create folder

```sh linenums="1"
cd /home/master/hadoop-3.2.1
mkdir data
cd data
mkdir namenode

```

- Edit `/hadoop-3.2.1/etc/hadoop/hadoop-env.sh`

```sh linenums="1"
export HADOOP_PREFIX=$HOME/hadoop-3.2.1
```

- Edit `/hadoop-3.2.1/etc/hadoop/core-site.xml`

```sh linenums="1"
#172.17.0.2 is nameNode's IP
  <configuration>
      <property>
          <name>fs.default.name</name>
          <value>hdfs://172.17.0.2:9000</value>
      </property>
  </configuration>
```

- Edit `/hadoop-3.2.1/etc/hadoop/hdfs-site.xml`

```sh linenums="1"
<configuration>
  <property>
      <name>dfs.namenode.name.dir</name>
      <value>/home/master/hadoop-3.2.1/data/namenode</value>
  </property>
  <property>
      <name>dfs.datanode.data.dir</name>
      <value>/home/master/hadoop-3.2.1/data/datanode</value>
  </property>
  <property>
    <name>dfs.replication</name>
    <value>2</value>
</property>
</configuration>
```

- Edit `/hadoop-3.2.1/etc/hadoop/mapred-site.xml`

```ssh linenums="1"
  <configuration>
      <property>
          <name>mapreduce.framework.name</name>
          <value>yarn</value>
      </property>
  </configuration>
```

- Edit `/hadoop-3.2.1/etc/hadoop/yarn-site.xml`

```sh linenums="1"
  <configuration>
      <property>
          <name>yarn.resourcemanager.hostname</name>
          <value>localhost</value>
      </property>
      <property>
        <name>yarn.nodemanager.aux-services</name>
        <value>mapreduce_shuffle</value>
      </property>
      <property>
        <name>yarn.resourcemanager.resource-tracker.address</name>
        <value>172.17.0.0.2:8025</value>
      </property>
      <property>
        <name>yarn.resourcemanager.scheduler.address</name>
        <value>172.17.0.0.2:8030</value>
      </property>
      <property>
        <name>yarn.resourcemanager.address</name>
        <value>172.17.0.0.2:8050</value>
      </property>
  </configuration>
```

## Start Hadoop nameNode

- Format first ( f\*ck this step, it taken me about 6h, when second try I forget it)

```sh linenums="1"
hdfs namenode -format
```

- Start hadoop

```sh linenums="1"
start-all.sh
```

- Check If is hadoop working?

```sh linenums="1"
hdfs dfsadmin -report
```

- Success lock like this

```sh linenums="1"

[master@02054491f2fe hadoop-3.2.1]$ hdfs dfsadmin -report
Configured Capacity: 136782172160 (127.39 GB)
Present Capacity: 87905959936 (81.87 GB)
DFS Remaining: 87905931264 (81.87 GB)
DFS Used: 28672 (28 KB)
DFS Used%: 0.00%
Replicated Blocks:
  Under replicated blocks: 0
  Blocks with corrupt replicas: 0
  Missing blocks: 0
  Missing blocks (with replication factor 1): 0
  Low redundancy blocks with highest priority to recover: 0
  Pending deletion blocks: 0
Erasure Coded Block Groups:
  Low redundancy block groups: 0
  Block groups with corrupt internal blocks: 0
  Missing block groups: 0
  Low redundancy blocks with highest priority to recover: 0
  Pending deletion blocks: 0

-------------------------------------------------
Live datanodes (1):

Name: 127.0.0.1:9866 (localhost)
Hostname: 02054491f2fe
Decommission Status : Normal
Configured Capacity: 136782172160 (127.39 GB)
DFS Used: 28672 (28 KB)
Non DFS Used: 41856688128 (38.98 GB)
DFS Remaining: 87905931264 (81.87 GB)
DFS Used%: 0.00%
DFS Remaining%: 64.27%
Configured Cache Capacity: 0 (0 B)
Cache Used: 0 (0 B)
Cache Remaining: 0 (0 B)
Cache Used%: 100.00%
Cache Remaining%: 0.00%
Xceivers: 1
Last contact: Thu Oct 15 08:00:27 UTC 2020
Last Block Report: Thu Oct 15 07:39:51 UTC 2020
Num of Blocks: 0

```

## Edit config dataNode

- Create folder `datanode` on `datanode1` and `datanode2`

```sh linenums="1"
cd /home/master/hadoop-3.2.1
mkdir data
cd data
mkdir datanode
chmod 755 datanode/

```

- Change permission on hadoop folder:

```sh linenums="1"
chmod -R 777 hadoop-3.2.1
```

- At master (namenode) move to folder `/home/master/hadoop-3.2.1/etc/hadoop`, and copy file \*.xml to `datanode1` and `datanode2`.

```sh linenums="1"
# For example we will copy from nameNode(master) to dataNode (slave5 - ip: 172.17.0.3)
scp core-site.xml yarn-site.xml mapred-site.xml hdfs-site.xml slaves slave5@172.17.0.3:/home/slave5/hadoop-3.2.1/etc/hadoop

# here for datanode2
scp core-site.xml yarn-site.xml mapred-site.xml hdfs-site.xml slaves slave2@172.17.0.4:/home/slave2/hadoop-3.2.1/etc/hadoop
```

- Edit file `hdfs-site.xml` to mapped with datanode

```sh linenums="1"
# something like this
<configuration>
    <property>
        <name>dfs.namenode.name.dir</name>
  <value>/home/slave5/hadoop-3.2.1/data/namenode</value>
    </property>
    <property>
        <name>dfs.datanode.data.dir</name>
        <value>/home/slave5/hadoop-3.2.1/data/datanode</value>
    </property>
    <property>
      <name>dfs.replication</name>
      <value>2</value>
  </property>
</configuration>

```

- Format dataNode

```sh linenums="1"
hdfs datanode -format
```

- Start dataNode

```sh linenums="1"

```
