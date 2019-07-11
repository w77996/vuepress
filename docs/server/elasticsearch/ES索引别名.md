# ES索引别名

ES别名切换切换索引可以做到线上零停机

## 索引添加别名
```
curl -H "Content-Type: application/json" -XPOST 'http://192.168.1.242:9200/_aliases' -d '
    {
    	"actions": [{
    		"add": {
    			"index": "user_1",
    			"alias": "user_alias"
    		}
    	}]
    }'
```

## 索引删除别名
```
curl  -H "Content-Type: application/json" -XPOST 'http://192.168.1.242:9200/_aliases' -d '
	{
    	"actions": [{
    		"remove": {
    			"index": "user_1",
    			"alias": "user_alias"
    		}
    	}]
    }'

```

## 重命名别名,别名切换索引
```
curl -XPOST 'http://192.168.1.242:9200/_aliases' -d '
    {
        "actions": [{
                "remove": {
                    "index": "user_1",
                    "alias": "user_alias"
                }
            },
            {
                "add": {
                    "index": "user_1",
                    "alias": "user_alias_new"
                }
            }
        ]
    }'

```