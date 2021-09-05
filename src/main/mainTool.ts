import { accountController } from './controller';
import { mainEvents } from '../MessageDuplex';

async function initialData() {
  await accountController.refreshAccountsData();
  return true;
}

// 定时任务
function startCronTask() {
  setTimeout(() => {
    accountController.refreshAccountsData();
  }, 10000);
  return true;
}

export async function run() {
  mainEvents.bindEvents();
  await initialData();
  startCronTask();
}

export const a = 1;
