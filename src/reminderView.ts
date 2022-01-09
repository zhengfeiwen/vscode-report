import * as vscode from "vscode";
import Asset from "./asset";
const fs = require('fs');
const util = require('./util');
const path = require('path');
import open = require('open');

export class ReminderView {
  private static messageHandler: any = {
    // 弹出提示
    alert(global: any, message: any) {
        util.showInfo(message.info);
    },
    // 显示错误提示
    error(global: any, message: any) {
        util.showError(message.info);
    },
    // 获取工程名
    getProjectName(global: any, message: any) {
      ReminderView.invokeCallback(global.panel, message, util.getProjectName(global.projectPath));
    },
    openFileInFinder(global: any, message: any) {
      const path = Asset.getReminderDocumentFinder()
      open(path)
    },
    openFileInDay(global: any, message: any) {
      const path = Asset.getReminderDocumentPath('Day')
      open(path)
    },
    openFileInWeek(global: any, message: any) {
      const path = Asset.getReminderDocumentPath('Week')
      open(path)
    },
    openUrlInBrowser(global: any, message: any) {
      const path = Asset.getOAUrl()
        util.openUrlInBrowser(path);
        ReminderView.invokeCallback(global.panel, message, {code: 0, text: '成功'});
    }
  };
  private static panel: vscode.WebviewPanel | undefined;

  public static show(context: vscode.ExtensionContext) {
    let asset: Asset = new Asset(context);

    const imagePath = asset.getImageUri();
    let title = asset.getTitle();
    const configDay = Asset.getReminderViewDay();
    const documentTitle = configDay ? "日报提醒" : "周报提醒";
    if (configDay) {
      title = title.replace("周报", "日报");
    }

    if (this.panel) {
      this.panel.webview.html = this.generateHtml(
        imagePath,
        title,
        documentTitle
      );
      this.panel.reveal();
    } else {
      this.panel = vscode.window.createWebviewPanel(
        'testWebview', // viewType
        `工作汇报安排-${title}`, // 视图标题
        vscode.ViewColumn.One, // 显示在编辑器的哪个部位
        {
            enableScripts: true, // 启用JS，默认禁用
            retainContextWhenHidden: true, // webview被隐藏时保持状态，避免被重置
        }
      );
      // 工程目录一定要提前获取，因为创建了webview之后activeTextEditor会不准确
      const projectPath = '';
      let global = { projectPath, panel: this.panel};
      this.panel.webview.html = this.getWebViewContent(context, 'src/view/work-report.html');
      this.panel.webview.onDidReceiveMessage(message => {
          if (this.messageHandler[message.cmd]) {
            this.messageHandler[message.cmd](global, message);
          } else {
              util.showError(`未找到名为 ${message.cmd} 回调方法!`);
          }
      }, undefined, context.subscriptions);
      // this.panel.webview.html = this.generateHtml(
      //   imagePath,
      //   title,
      //   documentTitle
      // );
      this.panel.onDidDispose(() => {
        this.panel = undefined;
      });
    }
  }

  /**
   * 执行回调函数
   * @param {*} panel 
   * @param {*} message 
   * @param {*} resp 
   */
   protected static invokeCallback(panel: any, message: any, resp: any) {
      console.log('回调消息：', resp);
      // 错误码在400-600之间的，默认弹出错误提示
      if (typeof resp == 'object' && resp.code && resp.code >= 400 && resp.code < 600) {
        vscode.window.showErrorMessage(resp.message || '发生未知错误！');
      }
      panel.webview.postMessage({cmd: 'vscodeCallback', cbid: message.cbid, data: resp});
  }

  protected static getWebViewContent(context: any, templatePath: String) {
    const resourcePath = path.join(context.extensionPath, templatePath);
    const dirPath = path.dirname(resourcePath);
    let html = fs.readFileSync(resourcePath, 'utf-8');
    // vscode不支持直接加载本地资源，需要替换成其专有路径格式，这里只是简单的将样式和JS的路径替换
    html = html.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m: any, $1: any, $2: any) => {
        return $1 + vscode.Uri.file(path.resolve(dirPath, $2)).with({ scheme: 'vscode-resource' }).toString() + '"';
    });
    return html;
}

  protected static generateHtml(
    imagePath: vscode.Uri | string,
    title: string,
    documentTitle: string
  ): string {
    let html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${documentTitle}</title>
        </head>
        <body>
            <div><h1>${title}</h1></div>
            <div><img src="${imagePath}"></div>
        </body>
        </html>`;

    return html;
  }
}
