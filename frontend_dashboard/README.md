# HFT 微套利仪表盘前端

这是一个使用 Next.js, React, TypeScript 和 Tailwind CSS 构建的前端仪表盘项目，用于HFT微套利平台的数据可视化和交互。

## 项目结构

-   `/src/app`: 包含应用的主要页面 (`page.tsx`)、布局 (`layout.tsx`) 和全局样式 (`globals.css`)。
-   `/src/components`: 用于存放可复用的React组件 (后续创建)。
-   `/src/lib`: 用于存放辅助函数、类型定义等 (后续创建)。
-   `/public`: 存放静态资源，如图片。
-   `package.json`: 定义项目依赖和脚本。
-   `next.config.mjs`: Next.js 配置文件。
-   `tailwind.config.ts`: Tailwind CSS 配置文件。
-   `postcss.config.mjs`: PostCSS 配置文件。
-   `tsconfig.json`: TypeScript 配置文件。

## 如何运行

1.  **安装依赖:**
    在 `frontend_dashboard` 目录下打开终端，运行以下命令安装项目所需的依赖包：
    ```bash
    npm install
    # 或者
    # yarn install
    # 或者
    # pnpm install
    ```

2.  **启动开发服务器:**
    安装完依赖后，运行以下命令启动 Next.js 开发服务器：
    ```bash
    npm run dev
    # 或者
    # yarn dev
    # 或者
    # pnpm dev
    ```
    开发服务器默认会在 `http://localhost:3000` 启动。在浏览器中打开此地址即可看到应用。

3.  **构建生产版本:**
    要构建用于生产部署的版本，运行：
    ```bash
    npm run build
    # 或者
    # yarn build
    # 或者
    # pnpm build
    ```
    构建产物会输出到 `.next` 目录。

4.  **启动生产服务器:**
    构建完成后，可以使用以下命令启动生产服务器：
    ```bash
    npm run start
    # 或者
    # yarn start
    # 或者
    # pnpm start
    ```

## 后续开发计划

-   根据后端API设计和实现具体的数据展示组件（订单簿、交易信号、历史记录等）。
-   实现用户交互功能。
-   完善赛博朋克风格的UI设计。
-   集成状态管理库（如 Zustand 或 Redux Toolkit）如果需要。
-   编写单元测试和集成测试。