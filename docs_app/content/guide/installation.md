# Installation Instructions

# 安装说明

Here are different ways you can install RxJS:

以下是安装 RxJS 的不同方法：

## ES2015 via npm

## ES2015 通过 npm

```shell
npm install rxjs
```

By default, RxJS 7.x will provide different variants of the code based on the consumer:

默认情况下，RxJS 7.x 会根据消费者提供不同的代码变体：

* When RxJS 7.x is used on Node.js regardless of whether it is consumed via `require` or `import`, CommonJS code targetting ES5 will be provided for execution.

  在 Node.js 上使用 RxJS 7.x 时，无论是通过 `require` 还是 `import` 使用，都会提供针对 ES5 的 CommonJS 代码以供执行。

* When RxJS 7.4+ is used via a bundler targeting a browser (or other non-Node.js platform) ES module code targetting ES5 will be provided by default with the option to use ES2015 code. 7.x versions prior to 7.4.0 will only provide ES5 code.

  当通过针对浏览器（或其他非 Node.js 平台）的捆绑程序使用 RxJS 7.4+ 时，将默认提供针对 ES5 的 ES 模块代码，并提供使用 ES2015 代码的选项。 7.4.0 之前的 7.x 版本将仅提供 ES5 代码。

If the target browsers for a project support ES2015+ or the bundle process supports down-leveling to ES5 then the bundler can optionally be configured to allow the ES2015 RxJS code to be used instead. You can enable support for using the ES2015 RxJS code by configuring a bundler to use the `es2015` custom export condition during module resolution. Configuring a bundler to use the `es2015` custom export condition is specific to each bundler. If you are interested in using this option, please consult the
documentation of your bundler for additional information. However, some general information can be found here: <https://webpack.js.org/guides/package-exports/#conditions-custom>

如果项目的目标浏览器支持 ES2015+ 或捆绑过程支持降级到 ES5，则可以选择将捆绑器配置为允许使用 ES2015 RxJS 代码。你可以通过将捆绑器配置为在模块解析期间使用 `es2015` 自定义导出条件来启用对使用 ES2015 RxJS 代码的支持。将捆绑器配置为使用 `es2015` 自定义导出条件特定于每个捆绑器。如果你有兴趣使用此选项，请查阅捆绑程序的文档以获取更多信息。但是，可以在此处找到一些一般信息： [https](https://webpack.js.org/guides/package-exports/#conditions-custom) ://webpack.js.org/guides/package-exports/#conditions-custom

To import only what you need, please {@link guide/importing#es6-via-npm check out this} guide.

要仅导入你需要的内容，请{@link guide/importing#es6-via-npm check out this}指南。

## CommonJS via npm

## 通过 npm 的 CommonJS

If you receive an error like error TS2304: Cannot find name 'Promise' or error TS2304: Cannot find name
'Iterable' when using RxJS you may need to install a supplemental set of typings.

如果你在使用 RxJS 时收到错误 TS2304: Cannot find name 'Promise' 或 error TS2304: Cannot find name 'Iterable' 之类的错误，你可能需要安装一组补充的类型。

1. For typings users:

   对于打字用户：

```shell
typings install es6-shim --ambient
```

2. If you're not using typings the interfaces can be copied from /es6-shim/es6-shim.d.ts.

   如果你不使用类型，则可以从 /es6-shim/es6-shim.d.ts 复制接口。

3. Add type definition file included in tsconfig.json or CLI argument.

   添加包含在 tsconfig.json 或 CLI 参数中的类型定义文件。

## All Module Types (CJS/ES6/AMD/TypeScript) via npm

## 所有模块类型 (CJS/ES6/AMD/TypeScript) 通过 npm

To install this library via npm version 3, use the following command:

要通过 npm 版本 3 安装此库，请使用以下命令：

```shell
npm install @reactivex/rxjs
```

If you are using npm version 2, you need to specify the library version explicitly:

如果你使用的是 npm 版本 2，则需要明确指定库版本：

```shell
npm install @reactivex/rxjs@7.3.0
```

## CDN

## 内容分发网络

For CDN, you can use [unpkg](https://unpkg.com/):

对于 CDN，你可以使用[unpkg](https://unpkg.com/) ：

[https://unpkg.com/rxjs@^7/dist/bundles/rxjs.umd.min.js](https://unpkg.com/rxjs@%5E7/dist/bundles/rxjs.umd.min.js)

To import what you need, please {@link guide/importing#cdn check out this} guide.

要导入你需要的内容，请{@link guide/importing#cdn 查看此} 指南。

