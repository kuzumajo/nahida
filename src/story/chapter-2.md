![m][bgm]

![c](#wait "1000")
系统提示：在这一章节中我们将会演示内嵌代码能达到的复杂效果。

![c](#wait "1000")
![b fade][bg]

# 阿罗娜

![f fade-in 1/1 loop-01](#arona)
「老师，我们来玩石头剪刀布吧！」

「输的人必须服从赢的人的要求哦～」

- 石头 `ctx.data.chu = 0`
- 剪刀 `ctx.data.chu = 1`
- 布 `ctx.data.chu = 2`
- Uncaught TypeError [next](./chapter-2/scene-1.md)

# 我

「`["石头", "剪刀", "布"][ctx.data.chu]`！」

# 阿罗娜

「`["石头", "剪刀", "布"][(ctx.data.chu + 2) % 3]`！」

# 我

「哎，怎么会这样！」

# 阿罗娜

![f loop-12](#arona)
「嘿嘿……这下老师要乖乖听阿罗娜的话了哦～」

# 我

「你……你想做什么……」

# 阿罗娜

![f loop-01](#arona)
「没什么啦，只是想问老师几个小问题而已。」

# 我

「只要是我能回答的上来的话……」

# 阿罗娜

![f loop-22](#arona)
「我想知道 "hello world" 的 MD5 哈希值是多少，老师可以帮我算出来吗？」

- 5eb63bbbe01eeed093cb22bb8f5acdc3
- 6f5902ac237024bdd0c176cb93063dc4
- fc5e038d38a57032085441e7fe7010b0
- d73b04b0e696b0945283defa3eee4538

# 我

「是 5eb63bbbe01eeed093cb22bb8f5acdc3 啦。」

# 阿罗娜

「好厉害！」

[next](#chapter-3)

[bg]: ../assets/images/BG_ReceptionRoom.png
[bgm]: ../assets/audio/bgm/Theme_06.ogg
