import { accountController } from './controller';
import * as mainEvents from '../MessageDuplex/events/mainEvents';

async function initialData() {
  await accountController.refreshAccountsData(false);
  return true;
}

// 定时任务
function startCronTask() {
  setInterval(() => {
    accountController.refreshAccountsData(true);
  }, 10000);
  return true;
}

export async function run() {
  mainEvents.bindEvents();
  await initialData();
  startCronTask();
}

export const a = 1;
