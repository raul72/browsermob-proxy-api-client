import { start } from './global.server';

export default async (): Promise<void> => {
  await start();
};
