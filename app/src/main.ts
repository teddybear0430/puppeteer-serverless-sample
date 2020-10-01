import { Browser } from 'puppeteer';
import { BrowserSetting } from './browser';
import { googleSearch } from './google-search';

export const main = async (searchWord: string) => {
  let browser: Browser = null;

  try {
    const browserSetting = new BrowserSetting();

    browser = await browserSetting.initBrowser();
    const page = await browser.newPage();

    const getResultElement = await googleSearch(page, searchWord);

    if (getResultElement) {
      // titleタグを取得
      const title = await page.title();

      return title;
    }

    await browser.close();
  } catch(er) {
    console.error(er);

    return undefined;
  } finally {
    if (browser !== null) await browser.close();
  }
};
