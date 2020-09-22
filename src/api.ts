import { Tx } from './pages/Transactions';
import { getConfirmationCount } from './utils';

import { LINKS_CONFIG } from 'src/config';

export async function fetchTransactions(
  amount: number,
  offset: number,
  address: string,
) {
  const txs: Tx[] = await fetch(
    `https://${LINKS_CONFIG.api}/api/v0.1/account/${address}/history/${offset}/${amount}`,
  ).then(r => r.json());

  return (await Promise.all(
    txs.map(async tx =>
      Object.assign(tx, {
        created_at: new Date(tx.created_at),
      }),
    ),
  )) as Tx[];
}
