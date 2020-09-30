import { BrowserSetting } from './browser';
import { Browser } from 'puppeteer';

export const main = async (searchWord: string) => {
  let result: string | null = null;
  let browser: Browser = null;

  try {
    const browserSetting = new BrowserSetting();

    browser = await browserSetting.initBrowser();
    const page = await browser.newPage();

    // MEMO: goto()
    // 引数に表示したいページのURLを指定
    page.goto('https://www.google.co.jp', {
      // MEMO: ページ内のDOMツリーが完全に構築されるまで待機
      waitUntil: 'domcontentloaded'
    });
    console.info('browser start');

    // 検索窓のinput要素のクラス
    const searchBox = '.gLFyf';

    // MEMO: waitForSelector()
    // input要素が出現するまで待つ
    await page.waitForSelector(searchBox);
    console.info('Chromeのinput要素を確認');

    // inputをフォーカス
    await page.focus(searchBox);

    // keydown、keypress、keyupイベントで送信する要素(input)の指定？
    await page.type(searchBox, searchWord);

    // 入力後5秒待って、エンターを押す
    await page.waitFor(500);
    await page.keyboard.press('Enter');

    // 検索成功したときに存在する要素
    const getResultElement = await page.waitForSelector('#result-stats', {
      timeout: 2000
    })
    .catch((er) => {
      // MAX20秒待っても要素が確認できない場合は例外として処理
      console.info(er);
      console.info(`${searchWord}に一致する情報は見つかりませんでした。`);

      return result;
    });

    if (getResultElement) {
      // titleタグを取得
      const title = await page.title();
      result = title;

      return result;
    }

    await browser.close();
  } catch(er) {
    console.error(er);

    return undefined;
  } finally {
    if (browser !== null) await browser.close();
  }
};
