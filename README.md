## node cli创建项目, 选择所需模板, 生成项目

> 配合npm package.json中的`bin`字段
```json
"bin": {
  "gen-cli": "./bin/cli.mjs"
}
```

在本地调试的时候可以借助npm link把当前项目中package.json中的bin字段链接到全局变量。

```shell
npm link // mac需要加sudo
```

学习于掘金这篇文章 https://juejin.cn/post/7236021829000446011