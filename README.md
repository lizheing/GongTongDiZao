<<<<<<< Updated upstream
version1.1：基本完成，武汉市各区县矢量未显示，再加个领域（domain）显示模块

version2.0：所有功能实现，前端小问题带排版，可尝试加个界面查看数据库信息，或者加入录入信息的功能
=======
“共同缔造”2.0 项目说明

——————————————

项目简介：
本项目为“共同缔造”2.0，实现了基于武汉市各区县的留言板数据可视化、空间统计与管理后台。前端采用 Vue3、Vite、Element Plus、OpenLayers，后端基于 Node.js、Express、PostgreSQL，支持空间数据展示、统计分析、管理员登录等功能。

——————————————

目录结构：
database/                数据库SQL文件（GongTongDiZaoDB.sql）
project/                 前端项目（Vue3 + Vite）
  └─ src/、public/、package.json 等
server/                  后端服务（Node.js + Express）
  └─ src/、package.json 等
shpfile/                 武汉市区县矢量数据（shapefile）
  └─ wuhan.shp 等
领导留言板文本数据/      留言板原始数据（Excel、CSV）
README.md                项目说明文档

——————————————

主要功能：
1. 空间数据可视化：展示武汉市各区县矢量边界，支持底图切换、测量工具。
2. 留言数据统计：按类别、领域、区域、满意度、办理状态等多维度统计展示。
3. 留言查询与详情：支持区域留言查询、留言详情弹窗、分页浏览。
4. 管理员后台：管理员登录，后续可扩展管理功能。
5. 数据管理：支持从 Excel/CSV 导入留言数据，空间数据采用 Shapefile 格式。

——————————————

安装与运行：

1. 数据库
  安装 PostgreSQL 并创建数据库，并启用 postgis 扩展。
  创建新数据库并还原database/GongTongDiZaoDB.sql。
  配置.env文件配置数据库连接信息。

2. 后端服务
  进入 server 目录，执行 npm install 安装依赖。
  开发模式运行：npm run dev
  默认端口为 3000，可通过 .env 文件自定义。

3. 前端项目
  进入 project 目录，执行 npm install 安装依赖。
  运行：npm run dev
  默认端口为 5173，可通过 Vite 配置修改。

4. 访问方式
  前端页面：http://localhost:5173
  后端接口：http://localhost:3000

——————————————

主要依赖：
前端：Vue3、Vite、Element Plus、OpenLayers、ECharts、Pinia、Axios
后端：Node.js、Express、pg、pg-promise、dotenv、TypeScript

——————————————

版本记录：
v1.1   基本完成，武汉市各区县矢量未显示，待加“领域”显示模块
v1.2   矢量已显示，领域模块已加
v1.3   管理员登录界面完成
v2.0   管理员登录系统与数据库连接，功能完成
v2.1   UI修改
v2.2   BUG修复

——————————————

其他说明：
shpfile 目录下为武汉市区县矢量数据（shapefile格式），是数据库中空间表wuhan的原始数据。
领导留言板文本数据 目录下为原始留言数据（Excel/CSV格式），。
如需扩展功能或二次开发，请参考 project 和 server 目录下的源码。
>>>>>>> Stashed changes
