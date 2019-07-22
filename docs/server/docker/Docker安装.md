# docker安装

## 卸载老旧的版本

    apt-get remove docker docker-engine docker.io

## 安装最新的docker
    
     curl -fsSL get.docker.com -o get-docker.sh
     sudo sh get-docker.sh
     
   或者

    curl -sSL https://get.docker.com/ | sh 
    
## 确认Docker成功最新的docker

    sudo docker run hello-world
  
----
# docker-compose安装
 
## 从github上下载docker-compose二进制文件安装

    sudo curl -L https://github.com/docker/compose/releases/download/1.16.1/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose

## 添加可执行权限 

    sudo chmod +x /usr/local/bin/docker-compose
    
### 查看版本

    docker-compose --version          
    
[参考连接](https://blog.csdn.net/pushiqiang/article/details/78682323 )
