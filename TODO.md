# TODO

- [ ] antfu fast-npm-meta  Published 8 days ago 2026-7-29
- [ ] 0 dependencies badge read yellow and green for 0 1-2 3-+∞
- [ ] Add dependents rankings
- [ ] default light theme like npmjs.com
- [ ] verbose mode and quiet mode
- [x] pkg icon
- [ ] watch mode bug: css changes not reflected. server restarted but page not refreshed use sse to notify client
- [ ] 缓存如何设计
- [ ] 最多5个包
- [ ] 创建 2026-7-30 改成相对时间
- [ ] 国际化
- [ ] Pagination / show more than  limit  packages
- [ ] Export / share rankings: install cli open `?limit=3&username=xxx`
- [ ] Dark/light theme toggle
- [ ] 预期 legend80s 是 pelican sse-stuntman gallery-server ...
- [ ] 目前有体验问题：
- [ ] icon 最近在开发什么？按活跃时间排序（npm 近期发布或 GitHub 最近提交）icon 从 broken 到 ok
- [ ] 现在的缓存有个问题，切换用户后，缓存被清空，导致下次搜索相同用户时，需要重新搜索。
- [ ] dashboard 页面不展示所以包的 insights 只展示 limit 个包的 insights，但是背后会搜索所有 250 个包，这样用户点击 "查看更多" 时，已经加载了所有包的 insights，无需再搜索。性能会更好。
- [ ] date = `2026-07-17`; fetch(`https://api.github.com/search/issues?q=repo%3Aoven-sh%2Fbun%20type%3Aissue%20created%3A%3C%3D${date}%20-closed%3A%3C%3D${date}`).then(resp => resp.json()).then(resp => console.log(date, resp.total_count))
- [ ] Insight 接入大模型 API Key 自动分析背后原因

```md
bun （https://github.com/oven-sh/bun）仓库未关闭 issue 数量如下 我想关注哪一天 issue 关闭最多。请画图描述趋势和洞察，并分析背后的原因：
\```
2026-07-27 4079
2026-07-26 4079
2026-07-25 4074
2026-07-24 4601
2026-07-23 5162
2026-07-22 5155
2026-07-21 5155
2026-07-20 5152
2026-07-19 5149
2026-07-18 5146
2026-07-17 5144
2026-07-16 5144
2026-07-01 5128
2026-06-16 5091
2026-06-01 5057
\```
```

1. 目前会搜索所有 250 个包，时间太长了，改成 10 个
2. 搜索中显示『正在搜索 antfu 的包...』，应该显示进度『正在搜索 antfu 的第N个包...』
3. 当 dashboard 页面应该搜索完一个就展示一个，无需等待所有包都搜索完


当第一个包出现就可以隐藏 loading，我自己改了。
目前最热包和势头最猛需要等 10 个包的所有请求完成才能计算，其实只需要等 4 个包完成即可，且一直展示`-` 体验不好，需要改成正在计算 `N/limit`。

请问现在：dashboard 会等待 10 个包所有请求完才展示吗？以及缓存写入是需要等待 10 个包的所有请求都完成吗？
