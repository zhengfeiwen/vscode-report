import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { Utility } from "./utility";

export default class Asset {
  public readonly TYPE_URL_IMAGE = "url";
  public readonly TYPE_DEFAULT = "default";

  public constructor(private context: vscode.ExtensionContext) {}

  public getImageUri(): vscode.Uri | string {
    const type: string = this.getConfigType();
    let images: vscode.Uri[] | string[];

    if (type === this.TYPE_URL_IMAGE) {
      images = this.getCustomImages();
    } else {
      images = this.getDefaultImages();
    }
    // user forget setting customImages, get default images
    if (images.length === 0) {
      images = this.getDefaultImages();
    }
    const image = this.getRandomOne(images);

    return image;
  }

  protected getRandomOne(images: string[] | vscode.Uri[]): string | vscode.Uri {
    const n = Math.floor(Math.random() * images.length + 1) - 1;
    return images[n];
  }

  protected getDefaultImages(): vscode.Uri[] {
    const dirPath = this.getDefaultImagePath();
    const files = this.readPathImage(dirPath);
    return files;
  }

  protected readPathImage(dirPath: string): vscode.Uri[] {
    let files: vscode.Uri[] = [];
    const result = fs.readdirSync(dirPath);
    result.forEach(function(item, index) {
      const stat = fs.lstatSync(path.join(dirPath, item));
      if (stat.isFile()) {
        files.push(
          vscode.Uri.file(path.join(dirPath, item)).with({
            scheme: "vscode-resource"
          })
        );
      }
    });
    return files;
  }

  protected getDefaultImagePath() {
    return path.join(this.context.extensionPath, "images/report");
  }

  protected getConfigType(): string {
    return Utility.getConfiguration().get<string>("type", "default");
  }

  protected getCustomImages() {
    return Utility.getConfiguration().get<string[]>("customImages", []);
  }

  public getTitle(): string {
    return Utility.getConfiguration().get<string>("title", "");
  }

  public static getReminderViewDay(): boolean {
    return Utility.getConfiguration().get<boolean>("reminderViewDay", false);
  }

  public static getReminderViewWeek(): number {
    const week = Utility.getConfiguration().get<number>("reminderViewWeek", 5);
    return week === 7 ? 0 : week;
  }

  public static getReminderViewHour(): number {
    return Utility.getConfiguration().get<number>("reminderViewHour", 17);
  }

  public static getReminderDocumentPath(key: string): string {
    return Utility.getConfiguration().get<string>(`remindPath${key}`, '');
  }

  public static getReminderDocumentFinder(): string {
    return Utility.getConfiguration().get<string>('remindFinder', '');
  }

  public static getOAUrl(): string {
    return Utility.getConfiguration().get<string>('oaUrl', '');
  }
}
