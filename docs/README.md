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

`![b <animations>](<image> "<transitions>")`

<!-- prettier-ignore -->
```markdown
![b](./bg.png "cover")
![b](./bg.png "contain")
![b](./bg.png "fill")
![b fade-in](./bg.png "cover")
![b fade-out](./bg.png "cover")
![b conic-in](./bg.png "cover")
![b conic-out](./bg.png "cover")
![b blinds-in](./bg.png "cover")
![b blinds-out](./bg.png "cover")
![b](./bg.png "cover top to-bottom")
![b](./bg.png "cover right to-left")

![b fade-in duration-3000 ease-out](./bg.png "cover top to-bottom duration-3000 ease-in-out")
```

人物

`![f <animations>](<image> "<name> <transitions>")`

<!-- prettier-ignore -->
```markdown
<!-- 添加人物（淡入），位于正中间，缩放 50%，命名为 nahida -->
![f fade-in 1/1](./figure.png "nahida 50%")

<!-- 添加人物（淡入），位于左边，缩放 50% -->
![f 1/2](./figure.png "nahida 50%")
```
