# 语法

跳转指令

<!-- prettier-ignore -->
```markdown
<!-- 进入下一章节（直接结束当前章节） -->
[next](./chapter-2.md)
[next](#end)

<!-- 引入目标内容（仅跳转内容，结束了就回来） -->
[jump](./choice-2.md)
```

控制台指令

<!-- prettier-ignore -->
```markdown
<!-- 显示大字 -->
![c](#title "海内存知己，天涯若比邻")

<!-- 隐藏控制台 -->
![c](#hide)

<!-- 显示控制台 -->
![c](#show)

<!-- 等待若干秒（毫秒） -->
![c](#wait "2000")
```

对话文本

<!-- prettier-ignore -->
```markdown
# 纳西妲

「你好呀。」

# 我

「……」

「……你好。」

---

突然有个羽毛球上前向我搭话，我莫名感觉到有些慌乱。

定睛一看，才发现是个少女。
```

背景控制

`![b <animations>](<image> "<transitions> | <size> | <position>")`

<!-- prettier-ignore -->
```markdown
<!-- 使用 文件 URL 或者颜色 hash -->
![b](./bg.png)
![b](#66ccff)

<!-- 添加入场动画 -->
![b fade](./bg.png)
![b conic](./bg.png)
![b blinds](./bg.png)
![b fade duration-2000 ease-in-out](./bg.png)

<!-- size -->
![b](./bg.png "cover")
![b](./bg.png "contain")
![b](./bg.png "fill")
![b](./bg.png "80%")
![b](./bg.png "cover to-contain duration-60000 ease-in-out")

<!-- position -->
<!-- 注意百分比前面要加一个斜杠（以免和 size 混淆） -->
![b](./bg.png "top to-bottom")
![b](./bg.png "right to-left")
![b](./bg.png "top right to-bottom to-left")
![b](./bg.png "/ 20% 50% to-40% to-60%")
```

人物

`![f <animations>](<image> "<name> <transitions>")`

<!-- prettier-ignore -->
```markdown
<!-- 添加人物 nahida，动画淡入，位于正中间，图片缩放 50%，命名为 nahida -->
![f fade 1/1](./figure.png "nahida 50%")

<!-- 移动人物，到位于5人站位时的左数第2个，缩放 50% -->
![f 2/5](./figure.png "nahida 50%")
```
