import { Browser } from 'puppeteer';
import { BrowserSetting } from './browser';
import { googleSearch } from './google-search';
import { resultObj } from './types';

export const main = async (searchWord: string) => {
  let browser: Browser = null;
  const baseResult: resultObj = {
    searchResult: '',
    siteInfo: '',
  }

  try {
    const browserSetting = new BrowserSetting();

    browser = await browserSetting.initBrowser();
    const page = await browser.newPage();

    const getResultElement = await googleSearch(page, searchWord);

    if (getResultElement) {
      // titleタグを取得
      const title = await page.title();

      const siteInfoClassName = '.TbwUpd';
      const siteInfo = await page.waitForSelector(siteInfoClassName);
      const siteInfoTextContent = await siteInfo.getProperty('textContent');
      const siteInfoText = (await siteInfoTextContent.jsonValue());

      return {
        ...baseResult,
        searchResult: title,
        siteInfo: siteInfoText,
      };
    }

    await browser.close();
  } catch(er) {
    console.error(er);

    return undefined;
  } finally {
    if (browser !== null) await browser.close();
  }
};
