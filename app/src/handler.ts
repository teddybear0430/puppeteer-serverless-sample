import { Context } from 'aws-lambda';
import { IS_LOCAL } from './config';
import { LambdaEvent } from './types';

const chromium = require('chrome-aws-lambda');

export const handler = async (event: LambdaEvent, context: Context) => {
  let result = null;
  let browser = null;

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      // MEMO: ローカル環境の時は、Dockerコンテナ内のchromiumを使用するようにする
      executablePath: IS_LOCAL ? '/usr/bin/chromium-browser' : await chromium.executablePath,
      // MEMO: ローカル環境の時は、Dockerコンテナ内のchromiumを使用するようにする
      headless: IS_LOCAL ? IS_LOCAL : chromium.headless,
    });
    
    // MEMO: 日本語フォトの読み込み
    // Chromiumを起動する前に、URLまたはローカルファイルパスをカスタムフォントフェースに渡すことで、
    // Lambda上で日本語フォントが使えるようになる？
    await chromium.font('https://raw.githack.com/googlei18n/noto-cjk/master/NotoSansJP-Black.otf');

    const page = await browser.newPage();

    // MEMO: ページ内のDOMツリーが完全に構築されるまで待機
    page.goto('https://www.google.co.jp/', {
      waitUntil: 'domcontentloaded'
    });
    console.log('browser start')

    // LambdaEventを取得
    const searchWord = event.searchWord;
    console.log(searchWord);

    // 検索するワードをセット
    // MEMO: waitForSelector()
    // 要素が出現するまで待つ
    await page.waitForSelector('input[title="検索"]');
    await page.type('input[title="検索"]', searchWord);
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');

    // 検索成功したときにある要素
    // 検索失敗したときの条件が必要になりそう
    await page.waitForSelector('#top_nav');
    console.log('Success!');

    const title = await page.title();

    result = title;
  } catch (error) {
    return context.fail(error);
  } finally {
    if (browser !== null) await browser.close();
  }

  return context.succeed(result);
}
