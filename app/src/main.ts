import { IS_LOCAL } from './config';

const chromium = require('chrome-aws-lambda');

export const main = async (searchWord: string) => {
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

    // MEMO: goto()
    // 引数に表示したいページのURLを指定
    page.goto('https://www.google.co.jp/', {
      // MEMO: ページ内のDOMツリーが完全に構築されるまで待機
      waitUntil: 'domcontentloaded'
    });
    console.log('browser start');

    // MEMO: waitForSelector()
    // 要素が出現するまで待つ
    await page.waitForSelector('input[title="検索"]');

    // keydown、keypress、keyupイベントで送信する要素の指定？
    await page.type('input[title="検索"]', searchWord);

    // 入力後5秒待って、エンターを押す
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');

    // 検索成功したときにある要素
    // 検索失敗したときの条件が必要になりそう
    await page.waitForSelector('#top_nav');
    console.log('Success!');

    const title = await page.title();
    result = title;
  } catch(er) {
    return console.error(er);
  } finally {
    if (browser !== null) await browser.close();
  }

  return result;
};
