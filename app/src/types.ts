export interface LambdaEvent {
  searchWord: string;
};

// 最終的に取得する想定のデータ
export interface resultJson {
  siteInfo: string;
  date: string;
  pageTitle: string;
  pageUrl: string;
  description: string;
};
