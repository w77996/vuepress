# RocketMQ安装部署

## 1.部署堆内存配置:

    分别对应修改nameserver和broker脚本：runserver.sh和runbroker.sh，默认内存分配是非常大的，可以改小点

    JAVA_OPT="${JAVA_OPT} -server -Xms1g -Xmx1g -Xmn512m"

## 2.启动运行：  

    参见quickstart:http://rocketmq.apache.org/docs/quick-start/
   
    其中需要注意的是rocketmq默认情况下不允许自动创建topic，可以在启动broker命令后面加上autoCreateTopicEnable=true，运行自动创建topic，就可以在命令行测试收发消息了

## 3.集群模式

目前有以下几种集群模式：

### 1.多Master模式

        一个集群无 Slave，全是 Master，例如 2 个 Master 或者 3 个 Master

        优点：配置简单，单个Master 宕机或重启维护对应用无影响，在磁盘配置为RAID10 时，即使机器宕机不可恢复情况下，由与 RAID10磁盘非常可靠，消息也不会丢（异步刷盘丢失少量消息，同步刷盘一条不丢）。性能最高。多 Master 多 Slave 模式，异步复制

        缺点：单台机器宕机期间，这台机器上未被消费的消息在机器恢复之前不可订阅，消息实时性会受到受到影响

### 2.多Master多Slave模式（异步复制）

        每个 Master 配置一个 Slave，有多对Master-Slave， HA，采用异步复制方式，主备有短暂消息延迟，毫秒级。

        优点：即使磁盘损坏，消息丢失的非常少，且消息实时性不会受影响，因为Master 宕机后，消费者仍然可以从 Slave消费，此过程对应用透明。不需要人工干预。性能同多 Master 模式几乎一样。

        缺点： Master 宕机，磁盘损坏情况，会丢失少量消息。

### 3.多Master多Slave模式（同步双写）

        每个 Master 配置一个 Slave，有多对Master-Slave， HA采用同步双写方式，主备都写成功，向应用返回成功。

        优点：数据与服务都无单点， Master宕机情况下，消息无延迟，服务可用性与数据可用性都非常高

        缺点：性能比异步复制模式略低，大约低 10%左右，发送单个消息的 RT会略高。目前主宕机后，备机不能自动切换为主机，后续会支持自动切换功能

### 4.双主双从异步复制集群搭建（厦门环境202,203两主对应232,233两从4台机器部署）

    消息丢失在可接受范围内，几乎可以认为不会丢失消息，性能也高

      在202，203机器启动集群两台nameserver

1.创建namesrv配置文件，设置监听端口：

```
[root@lrxm202 conf]# vi namesrv.properties
stenPort=9876
```

2.启动202机器上的nameserver

    [root@lrxm202 conf]# cd ../bin/
    [root@lrxm202 bin]# nohup sh mqnamesrv -c ../conf/namesrv.properties  > ./nohup.out 2>&1 &


   启动没问题，接下来以相同的方式依次启动其他机器上的namesrv

     202，203机器分别启动broker主从

     202机器上的master,broker-a主要配置
```
brokerClusterName=lrts-cluster
#broker名称
brokerName=broker-a
#brokerId,0表示master,大于0表示slave
brokerId=0
#nameserver地址，两台分别部署在202,203
namesrvAddr=192.168.5.202:9876;192.168.5.203:9876
#默认值，每天凌晨4点删除文件
deleteWhen=04
#默认值，文件保留48h
fileReservedTime=48
#Broker 的角色
#- ASYNC_MASTER 异步复制Master
#- SYNC_MASTER 同步双写Master
#- SLAVE
brokerRole=SYNC_MASTER
#刷盘方式
#- ASYNC_FLUSH 异步刷盘
#- SYNC_FLUSH 同步刷盘
flushDiskType=ASYNC_FLUSH
#检测物理文件磁盘空间
diskMaxUsedSpaceRatio=88
#存储路径
storePathRootDir=/data/rocketmq/store
#commitLog 存储路径
storePathCommitLog=/data/rocketmq/store/commitlog
#消费队列存储路径存储路径
storePathConsumeQueue=/data/rocketmq/store/consumequeue
#消息索引存储路径
storePathIndex=/data/rocketmq/store/index
#checkpoint 文件存储路径
storeCheckpoint=/data/rocketmq/store/checkpoint
#abort 文件存储路径
abortFile=/data/rocketmq/store/abort
#限制的消息大小
maxMessageSize=65536
#启动202机器上的broker-a
[root@lrxm202 bin]# nohup sh mqbroker -c ../conf/2m-2s-sync/broker-a.properties >/dev/null 2>&1 &
broker-a启动成功
```


接下来启动203上集群的master broker-b，配置文件202上的master是一致的，只需要改动brokerName即可，可以看到是启动成功的


232机器上broker-a副本的配置：
作为broker-a的副本，需要改一下2个地方

```
brokerId=1
brokerRole=SLAVE
```
最后依次启动232,233机器上的副本rocketmq

```
nohup sh mqbroker -c ../conf/2m-2s-sync/broker-a-s.properties >/dev/null 2>&1 &
nohup sh mqbroker -c ../conf/2m-2s-sync/broker-b-s.properties >/dev/null 2>&1 &
```

# 启动步骤

1.修改配置文件：

broker-a.properties

broker-a-s.properties

broker-b.properties

broker-b-s.properties

2.202上启动nameserver1

修改启动参数：vi runserver.sh

    JAVA_OPT="${JAVA_OPT} -server -Xms2g -Xmx2g -Xmn512m -XX:MetaspaceSize=512m -XX:MaxMetaspaceSize=512m"
    启动命令：

    nohup sh mqnamesrv -c ../conf/namesrv.properties  > ./nohup.out 2>&1 &
    
查看启动进程（启动成功）

```
[root@lrxm202 bin]# ps -ef| grep name
root     17355 16104  0 15:48 pts/2    00:00:00 sh mqnamesrv -c ../conf/namesrv.properties
root     17359 17355  0 15:48 pts/2    00:00:00 sh /usr/local/rocketmq-all-4.4.0/bin/runserver.sh org.apache.rocketmq.namesrv.NamesrvStartup -c ../conf/namesrv.properties
root     17361 17359 31 15:48 pts/2    00:00:03 /usr/local/jdk/bin/java -server -Xms1g -Xmx1g -Xmn512m -XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=320m -XX:+UseConcMarkSweepGC -XX:+UseCMSCompactAtFullCollection -XX:CMSInitiatingOccupancyFraction=70 -XX:+CMSParallelRemarkEnabled -XX:SoftRefLRUPolicyMSPerMB=0 -XX:+CMSClassUnloadingEnabled -XX:SurvivorRatio=8 -XX:-UseParNewGC -verbose:gc -Xloggc:/dev/shm/rmq_srv_gc.log -XX:+PrintGCDetails -XX:-OmitStackTraceInFastThrow -XX:-UseLargePages -Djava.ext.dirs=/usr/local/jdk/jre/lib/ext:/usr/local/rocketmq-all-4.4.0/bin/../lib -cp .:/usr/local/rocketmq-all-4.4.0/bin/../conf: org.apache.rocketmq.namesrv.NamesrvStartup -c ../conf/namesrv.properties
root     17384 16104  0 15:48 pts/2    00:00:00 grep name
[root@lrxm202 bin]#
```

3. 203上以同样方式启动（启动成功）
```
[root@lrxm203 bin]# ps -ef| grep name
root       955     1  2 Mar08 ?        17:30:00 ./pd-server --name=pd2 --data-dir=data/pd2 --client-urls=http://192.168.5.203:2379 --peer-urls=http://192.168.5.203:2380 --initial-cluster=pd1=http://192.168.5.202:2380,pd2=http://192.168.5.203:2380,pd3=http://192.168.5.204:2380 -L info --log-file=logs/pd.log
root     23321 22919  0 15:50 pts/1    00:00:00 sh mqnamesrv -c ../conf/namesrv.properties
root     23325 23321  0 15:50 pts/1    00:00:00 sh /usr/local/rocketmq-all-4.4.0/bin/runserver.sh org.apache.rocketmq.namesrv.NamesrvStartup -c ../conf/namesrv.properties
root     23327 23325 51 15:50 pts/1    00:00:03 /usr/local/jdk/bin/java -server -Xms1g -Xmx1g -Xmn512m -XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=320m -XX:+UseConcMarkSweepGC -XX:+UseCMSCompactAtFullCollection -XX:CMSInitiatingOccupancyFraction=70 -XX:+CMSParallelRemarkEnabled -XX:SoftRefLRUPolicyMSPerMB=0 -XX:+CMSClassUnloadingEnabled -XX:SurvivorRatio=8 -XX:-UseParNewGC -verbose:gc -Xloggc:/dev/shm/rmq_srv_gc.log -XX:+PrintGCDetails -XX:-OmitStackTraceInFastThrow -XX:-UseLargePages -Djava.ext.dirs=/usr/local/jdk/jre/lib/ext:/usr/local/rocketmq-all-4.4.0/bin/../lib -cp .:/usr/local/rocketmq-all-4.4.0/bin/../conf: org.apache.rocketmq.namesrv.NamesrvStartup -c ../conf/namesrv.properties
root     23348 22919  0 15:50 pts/1    00:00:00 grep name
[root@lrxm203 bin]#
```
 
 4.202上启动master-a

修改启动参数
```
[root@lrxm202 bin]# vi runbroker.sh
#===========================================================================================
# JVM Configuration
#===========================================================================================
JAVA_OPT="${JAVA_OPT} -server -Xms1g -Xmx1g -Xmn512m"
JAVA_OPT="${JAVA_OPT} -XX:+UseG1GC -XX:G1HeapRegionSize=16m -XX:G1ReservePercent=25 -XX:InitiatingHeapOccupancyPercent=30 -XX:SoftRefLRUPolicyMSPerMB=0"
JAVA_OPT="${JAVA_OPT} -verbose:gc -Xloggc:/dev/shm/mq_gc_%p.log -XX:+PrintGCDetails -XX:+PrintGCDateStamps -XX:+PrintGCApplicationStoppedTime -XX:+PrintAdaptiveSizePolicy"
```

启动broker-a

```
nohup sh mqbroker -c ../conf/2m-2s-sync/broker-a.properties >/dev/null 2>&1 &

203启动broker-a-s

nohup sh mqbroker -c ../conf/2m-2s-sync/broker-a-s.properties >/dev/null 2>&1 &

232启动broker-b

nohup sh mqbroker -c ../conf/2m-2s-sync/broker-b.properties >/dev/null 2>&1 &

233启动broker-b-s

nohup sh mqbroker -c ../conf/2m-2s-sync/broker-b-s.properties >/dev/null 2>&1 &

```

关闭namesrv服务：sh bin/mqshutdown namesrv

关闭broker服务 ：sh bin/mqshutdown broker

# 启动和关闭

    nohup sh mqnamesrv -c ../conf/namesrv.properties  > ./nohup.out 2>&1 &
    nohup sh mqbroker -c ../conf/2m-2s-sync/broker-a-s.properties >/dev/null 2>&1 &
    
    sh bin/mqshutdown broker
    sh bin/mqshutdown namesrv