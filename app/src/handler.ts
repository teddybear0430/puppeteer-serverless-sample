import { Context } from 'aws-lambda';
import { LambdaEvent } from './types';
import { main } from './main';

export const handler = async (event: LambdaEvent, context: Context) => {
  const searchWord = event.searchWord;

  if (!searchWord) throw new Error('イベントが設定されていません');

  const result = await main(searchWord);

  return context.succeed(result);
}
