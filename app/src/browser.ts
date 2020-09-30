import { Browser } from 'puppeteer';
import { IS_LOCAL } from './config';

const chromium = require('chrome-aws-lambda');

export class BrowserSetting {
  private async config(): Promise<object> {
    const obj = {
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      // MEMO: ローカル環境の時は、Dockerコンテナ内のchromiumを使用するようにする
      executablePath: IS_LOCAL ? '/usr/bin/chromium-browser' : await chromium.executablePath,
      // MEMO: ローカル環境の時は、Dockerコンテナ内のchromiumを使用するようにする
      headless: IS_LOCAL ? IS_LOCAL : chromium.headless,
    };

    return obj;
  }

  private async loadFont(): Promise<string> {
    // MEMO: 日本語フォトの読み込み
    // Chromiumを起動する前に、URLまたはローカルファイルパスをカスタムフォントフェースに渡すことで、
    // Lambda上で日本語フォントが使えるようになる？
    const font = await chromium.font('https://raw.githack.com/googlei18n/noto-cjk/master/NotoSansJP-Black.otf');

    return font;
  }

  async initBrowser(): Promise<Browser> {
    const config = await this.config();
    const browser: Browser = await chromium.puppeteer.launch(config);
    this.loadFont();

    return browser;
  }
}
