# Arthas检测首页性能

# 环境
- Arthas版本： 3.1.1
- 安装路径：lrxm202 /usr/local/etc
- 项目路径： tomcat6

# 启动

## 查看tomcat6进程
执行`jps -v` 或`ps -ef|grep tomcat6`查看tomcat6进程
![image](https://raw.githubusercontent.com/w77996/BlogsImage/master/arthas/%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_20190827153154.png)
## 启动Arthas
进入/usr/local/etc下，执行`java -jar arthas-boot.jar`启动arthas，输入进程编号1，进入控制面板
image2019-8-27_15-28-2.png
![image](https://raw.githubusercontent.com/w77996/BlogsImage/master/arthas/%E5%90%AF%E5%8A%A8arthas.png)

# 查看基本信息
进入控制面板后执行`dashboard`查看应用基本信息

![image](https://raw.githubusercontent.com/w77996/BlogsImage/master/arthas/dashboard.png)
# 推荐页请求执行时间跟踪

> 背景：资源过滤1期对首页进行功能改版，添加多种样式，并且新增过滤用户收听过一段时间的资源功能。

主要使用`trace`命令

trace com.lazyaudio.yyting.api.action.page.RecommendPageAction v2VersionData
![image](https://github.com/w77996/BlogsImage/blob/master/arthas/%E6%89%A7%E8%A1%8Cv2version.png?raw=true)

trace com.lazyaudio.yyting.api.ao.recommend.page.v2.datas.BaseDataAO prepareBlockDatas
![image](https://github.com/w77996/BlogsImage/blob/master/arthas/trace_prepareBlock.png?raw=true)
trace com.lazyaudio.yyting.api.ao.recommend.page.v2.datas.BaseDataAO getAllOperationRecommendIds  
![image](https://github.com/w77996/BlogsImage/blob/master/arthas/trace_getAllOperationRecommendIds.png?raw=true)
出现超过50ms的
- setBookLimitTImeFreeData
- setActivityRecommendData
- setRankingsData

其中`setActivityRecommendData`和`setBookLimitTImeFreeData`多次调用，继续跟踪内部代码执行时间
调用一次首页推荐接口，`setActivityRecommendData`方法调用四次

trace com.lazyaudio.yyting.api.ao.recommend.page.v2.datas.BaseDataAO setActivityRecommendData
![image](https://raw.githubusercontent.com/w77996/BlogsImage/master/arthas/trace_setActivityRecommendData.png)

watch com.lazyaudio.yyting.api.ao.recommend.page.v2.datas.BaseDataAO setActivityRecommendData "{params,returnObj}" -x 2 -b  
![image](https://raw.githubusercontent.com/w77996/BlogsImage/master/arthas/watch_setActivityRecommendData.png)

trace com.lazyaudio.yyting.manager.activity.ActivityPackageItemsManager convertEntityList
![image](https://raw.githubusercontent.com/w77996/BlogsImage/master/arthas/trace_convertEntityList.jpg)

**可以看出在执行阅读书籍查找时，效率明显会比书籍和节目慢，查询时间相差十倍**

trace com.lazyaudio.yyting.service.activity.impl.ActivityServiceImpl getActivityList 
查找约20次
![image](https://raw.githubusercontent.com/w77996/BlogsImage/master/arthas/trace_getActivityList.png)

# 

# 总结
`setActivityRecommendData`方法中多次调用阅读书籍查询，而阅读书籍没有进行缓存处理，所有查询操作会多次查询数据库，从而加大了接口请求时间。

优化方案：对阅读书籍进行缓存处理


