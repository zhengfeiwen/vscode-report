import * as vscode from "vscode";
import { ReminderView } from "./reminderView";
import Asset from "./asset";

export class Scheduler {
  public constructor(private context: vscode.ExtensionContext) {}

  public start() {
    const configHour = Asset.getReminderViewHour();
    setInterval(() => {
      const currentHour = new Date().getHours();
      const currentMinute = new Date().getMinutes();
      let minus = configHour - currentHour
      if (minus <= 0) return
      if (currentMinute === 0) {
        vscode.window.setStatusBarMessage(`【报告提示时间剩余时间: ${minus}小时00分钟】`)
      } else {
        const seconds = 1 * 60 - currentMinute
        vscode.window.setStatusBarMessage(`【报告提示时间剩余时间: ${minus - 1}小时${Math.floor(seconds)}分钟】`)
      }
    }, 1000)
    this.startReminderView();
    setInterval(() => {
      this.startReminderView();
    }, 1000 * 60 * 60);
  }

  public startReminderView() {
    const configDay = Asset.getReminderViewDay();
    const currentWeek = new Date().getDay();
    const configWeek = Asset.getReminderViewWeek();
    const currentHour = new Date().getHours();
    const configHour = Asset.getReminderViewHour();
    if (Array.isArray(configHour)) {
      if ((configDay || configWeek === currentWeek) && configHour.indexOf(currentHour) > -1) {
        ReminderView.show(this.context);
      }
    } else {
      if ((configDay || configWeek === currentWeek) && configHour === currentHour) {
        ReminderView.show(this.context);
      }
    }
  }
}
