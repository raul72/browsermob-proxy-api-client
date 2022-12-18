import { stop } from './global.server';

export default async (): Promise<void> => {
  stop();
};
