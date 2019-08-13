module.exports = {
    title: '七七九九六',
    description: '个人网站',
    head: [ // 注入到当前页面的 HTML <head> 中的标签
        ['link', {rel: 'icon', href: '/logo.jpg'}], // 增加一个自定义的 favicon(网页标签的图标)
    ],
    base: '/', // 这是部署到github相关的配置
    markdown: {
        lineNumbers: true // 代码块显示行号
    },
    themeConfig: {
        sidebarDepth: 3, // e'b将同时提取markdown中h2 和 h3 标题，显示在侧边栏上。
        lastUpdated: 'Last Updated', // 文档更新时间：每个文件git最后提交的时间
        nav: [
            {text: '首页', link: '/'},
            {text: 'Java',
                link: '/java/',
                items: [
                    {text: '项目', link: '/java/project/'}
                ]
            },
            {
                text: '服务器',
                link: '/server/',
                items: [
                    {text: 'Elasticsearch', link: '/server/elasticsearch/'},
                    {text: 'Docker', link: '/server/docker/'},
                    {text: 'Mysql', link: '/server/mysql/'}
                ]
            },
            {
                text: '前端',
                items: [
                    {text: '小程序', link: '/web/miniapp/'},
                    {text: 'Vue', link: '/web/vue/'}
                ]
            },
            // {text: '掘金', link: 'https://juejin.im/user/5b0f41de518825153a440dd9'},
            {text: 'GitHub', link: 'https://github.com/w77996'},
        ],
        sidebar: {
            '/w77996/': [
                {
                    title: '主页',
                    children: [
                        '/server/',
                        '/web/',
                    ]
                }
            ],
            '/java/': [
                {
                    title: '项目',
                    children: [
                        '/java/project/hi-straw',
                        '/java/project/yunzhijia',
                    ]
                }
            ],
            '/server/': [
                {
                    title: 'Elasticsearch',
                    children: [
                        '/server/elasticsearch/',
                        '/server/elasticsearch/ES索引别名',
                        '/server/elasticsearch/ES集群迁移',
                    ]
                },
                {
                    title: 'Docker',
                    children: [
                        // '/server/docker/',
                        '/server/docker/Docker安装',
                    ]
                },
                {
                    title: 'RocketMQ',
                    children: [
                        '/server/rocket/', // 以docs为根目录来查找文件
                    ]
                },
                {
                    title: 'Mysql',
                    children: [
                        '/server/mysql/', // 以docs为根目录来查找文件
                    ]
                }
            ],
            '/web/miniapp/': [
                '/web/miniapp/mini-straw'
            ]
        }
    }

};