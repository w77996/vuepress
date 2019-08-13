# Python实现云之家自动签到

### 起因

偶然看到一个同事设置闹钟，提醒自己下班打开。就突发奇想，既然身为后台开发是不是可以用程序来实现自动打卡的功能呢？
于是开起来fiddler进行抓包，发现设置代理，云之家无法进行签到功能。既然电脑无法进行代理，那我直接在手机上开启个代理应用进行抓包不就行了么？

### 接口分析

最后抓到的结果签到接口


![image](https://github.com/w77996/BlogsImage/blob/master/python_yunzhijia/1565155502.jpg?raw=true)


分析下接口
- 域名：`www.yunzhijia.com`  
- 接口：`/attendance-signapi/signservice/sign/signIn h2`  
- 请求方式：`POST`
- 请求参数  
    `lng=纬度&lat=精度&bssid=&configId=配置ID&networkId=网络ID&userId=用户ID&ssid=`
- 请求头部  
    1.user-agent  
    2.opentoken  
    3.authorization  
    4.content-type  
    5.accept-language  

试着请求了一下
![image](https://raw.githubusercontent.com/w77996/BlogsImage/master/python_yunzhijia/1565156178.jpg)

### 编码

试了一下将获取的接口直接请求，云之家并没有对token的时间进行限制，所以拿到请求参数后可以直接撸代码了。
考虑了一下java代码的繁重，最后决定用python来完成自动签到的功能。
本来还用vue+axios写了一个网页版，但是后面发现axios总是会发送一个option请求导致返回错误，最后就没有去实现了。

python主要用到了三个库:

-    requests
-    json
-    apscheduler

apscheduler作为定时器实现自动签到的功能

```
import requests
import json
from apscheduler.schedulers.blocking import BlockingScheduler


# 簽到
def sign_in():
    url = " http://www.yunzhijia.com/attendance-signapi/signservice/sign/signIn?lng=&bssid=&configId=&networkId=&userId=&ssid=&lat="
    headers = {
        "user-agent": "",
        "opentoken": "",
        "authorization": "",
        "accept-language":"",
    }

    response = requests.post(url, headers=headers)
    print(response.text)
    response_json = json.loads(response.text)
    print(response_json['success'])



def job():
    sched = BlockingScheduler()
    sched.add_job(sign_in, 'cron', hour=18, minute=0)
    sched.add_job(sign_in, 'cron', hour=9, minute=0)
    sched.start()


if __name__ == '__main__':
    job()

```
    
### 结尾

此代码仅供学习用，我自己写完这个代码后也没有用过，平时也是准点上下班，希望大家不要随意使用，如有侵权问题请联系，随时删除。