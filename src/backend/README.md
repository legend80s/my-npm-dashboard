# "My NPM Dashboard" Backend

Functioning as API server and static file server. the API server is just proxy for github and npm api but with browser caching (not server caching).

## 技术栈

- 后端使用的是 `hono` 框架
- 无数据库，数据来源自 github 和 npm 官方 API，以及 shield.io 徽章
