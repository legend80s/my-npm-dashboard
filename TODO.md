# TODO

- [ ] default light theme like npmjs.com
- [ ] verbose mode and quiet mode
- [x] pkg icon
- [ ] watch mode bug: css changes not reflected. server restarted but page not refreshed use sse to notify client
- [ ] 缓存如何设计
- [ ] 最多5个包
- [ ] Pagination / show more than  limit  packages
- [ ] Export / share rankings: install cli open `?limit=3&username=xxx`
- [ ] Dark/light theme toggle
- [ ] 目前有体验问题：

1. 目前会搜索所有 250 个包，时间太长了，改成 10 个
2. 搜索中显示『正在搜索 antfu 的包...』，应该显示进度『正在搜索 antfu 的第N个包...』
3. 当 dashboard 页面应该搜索完一个就展示一个，无需等待所有包都搜索完


当第一个包出现就可以隐藏 loading，我自己改了。
目前最热包和势头最猛需要等 10 个包的所有请求完成才能计算，其实只需要等 4 个包完成即可，且一直展示`-` 体验不好，需要改成正在计算 `N/limit`。

请问现在：dashboard 会等待 10 个包所有请求完才展示吗？以及缓存写入是需要等待 10 个包的所有请求都完成吗？