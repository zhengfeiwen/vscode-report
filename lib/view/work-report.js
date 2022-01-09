const testMode = false; // 为true时可以在浏览器打开不报错
// vscode webview 网页和普通网页的唯一区别：多了一个acquireVsCodeApi方法
const vscode = testMode ? {} : acquireVsCodeApi();
const callbacks = {};

/**
 * 调用vscode原生api
 * @param data 可以是类似 {cmd: 'xxx', param1: 'xxx'}，也可以直接是 cmd 字符串
 * @param cb 可选的回调函数
 */
function callVscode(data, cb) {
    if (typeof data === 'string') {
        data = { cmd: data };
    }
    if (cb) {
        // 时间戳加上5位随机数
        const cbid = Date.now() + '' + Math.round(Math.random() * 100000);
        callbacks[cbid] = cb;
        data.cbid = cbid;
    }
    vscode.postMessage(data);
}

window.addEventListener('message', event => {
    const message = event.data;
    switch (message.cmd) {
        case 'vscodeCallback':
            console.log(message.data);
            (callbacks[message.cbid] || function () { })(message.data);
            delete callbacks[message.cbid];
            break;
        default: break;
    }
});

new Vue({
    el: '#app',
    data: {
        url: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg'
    },
    methods: {
        // 模拟alert
        alert(info) {
            callVscode({ cmd: 'alert', info: info }, null);
        },
        // 弹出错误提示
        error(info) {
            callVscode({ cmd: 'error', info: info }, null);
        },
        openFileInFinder() {
            callVscode({cmd: 'openFileInFinder', path: `package.json`}, () => {
                this.alert('打开成功！'); 
            });
        },
        openFileInDay() {
            callVscode({cmd: 'openFileInDay'}, () => {
                this.alert('打开日报成功！');
            });
        },
        openFileInWeek() {
            callVscode({cmd: 'openFileInWeek'}, () => {
                this.alert('打开周报成功！');
            });
        },
        openUrlInBrowser() {
            callVscode({cmd: 'openUrlInBrowser'}, () => {
                this.alert('打开OA系统成功！');
            });
        }
    }
});