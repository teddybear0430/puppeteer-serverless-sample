import { Page, Browser } from 'puppeteer';
import { BrowserSetting } from './browser';
import { googleSearch } from './google-search';
import { resultObj } from './types';

const getResultElementText = async (
  page: Page, 
  className: string
) => {
  const element = await page.waitForSelector(className);
  const textContent = await element.getProperty('textContent');
  const text = (await textContent.jsonValue()) as string;

  if (className.indexOf('TbwUpd') !== -1) {
    const topPageSiteUrl = text.match(/.+(?= ›)/g)[0];
    return topPageSiteUrl;
  }

  return text;
}

export const main = async (searchWord: string) => {
  let browser: Browser = null;

  const baseResult: resultObj = {
    searchResult: '',
    siteInfo: '',
    pageTitle: '',
    pageUrl: '',
    description: '',
  }

  try {
    const browserSetting = new BrowserSetting();

    browser = await browserSetting.initBrowser();
    const page = await browser.newPage();

    const getResultElement = await googleSearch(page, searchWord);

    if (getResultElement) {
      // titleタグを取得
      const title = await page.title();

      // 検索順位一位のサイトのURLを取得
      const siteInfoClassName = '.TbwUpd';
      const siteInfoText = await getResultElementText(page, siteInfoClassName);

      // 検索順位が一位のサイトの記事タイトルを取得
      const pageTitleClassName = '.rc h3';
      const pageTitleText = await getResultElementText(page, pageTitleClassName)

      // 検索順位が一位のサイトの記事タイトルのURLを取得
      const pageUrlClassName = '.rc a';
      const pageUrl = await page.$eval(pageUrlClassName, (el) => el.href);

      // 検索順位が一位のサイトの記事のデスクリプションを取得
      const descriptionClassName = '.aCOpRe';
      const description = await getResultElementText(page, descriptionClassName);

      return {
        ...baseResult,
        searchResult: title,
        siteInfo: siteInfoText,
        pageTitle: pageTitleText,
        pageUrl: pageUrl,
        description: description
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
