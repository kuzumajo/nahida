# 语法

## 跳转指令

<!-- prettier-ignore -->
```markdown
<!-- 进入下一章节（直接结束当前章节） -->
[next](./chapter-2.md)
[next](#end)

<!-- 引入目标内容（仅跳转内容，结束了就回来） -->
[jump](./choice-2.md)
```

## 控制台指令（`c`, `con`, `console`）

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

## 对话文本、标题

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

## 对话配音（`v`, `voice`）

<!-- prettier-ignore -->
```markdown
# 纳西妲

![v](./voice-0001.ogg)
「我们还是分手吧」
```

## 背景音乐（`m`, `bgm`）

会直接替换当前的 BGM。

<!-- prettier-ignore -->
```markdown
![m](./theme.ogg)
```

## 音效（`x`, `sfx`）

直接播放。

<!-- prettier-ignore -->
```markdown
![x](./explosion.ogg)
```

## 背景控制（`b`, `bg`）

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

## 人物（`f`, `fig`, `spine`）

你需要先在 `./src/story/spines.ts` 中定义所有的人物贴图。

`![f <animations>](#name "<transitions>")`

<!-- prettier-ignore -->
```markdown
<!-- 添加人物 nahida，动画淡入，位于正中间，图片缩放 50%，命名为 nahida -->
![f fade 1/1](#nahida "50%")

<!-- 移动人物，到位于5人站位时的左数第2个，缩放 50% -->
![f to-2/5](#nahida "50%")

<!-- 播放 spine 动画 Eye_Close_01（一次），在频道 0（默认） -->
![f once-Eye_Close_01](#nahida "50%")

<!-- 播放 spine 动画 Idle_01（循环），在频道 1 -->
![f loop-Idle_01/1](#nahida "50%")
```

频道：用于并行播放多个动画，如果频道相同则会覆盖原来的动画。

## 大框框打字（还没实现）

<!-- prettier-ignore -->
```markdown
> 这是一段文字
>
> 这是另一段文字

> 这是一段新的文字
>
> 这是新的文字后面的文字
```

## 选项

选项内只能有文字，附带跳转指令或者代码（或者仅文字）。

<!-- prettier-ignore -->
```markdown
- 选项一 [jump](./bad-end.md)
- 选项二 `ctx.data.died = true;`
- 选项三 [next](#chapter-3)
- 选项四
```

选项也会在选择之后设置 `ctx.selection = 0/1/2/3` 来表示选择了什么选项。

## 内嵌代码

可以使用代码块来内嵌代码。

````markdown
```js
ctx.sys.console.show();
```
````

或者行内代码

```markdown
# 纳西妲

`if (ctx.data.suki >= 100) {`

「我也喜欢你 (,,・ω・,,)」

`} else {`

「抱歉，我一直把你当朋友来看 (^～^;)ゞ」

`}`
```
