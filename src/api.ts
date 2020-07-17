import { Tx } from './pages/Transactions';
import { getConfirmationCount } from './utils';
import { Web3Provider } from 'ethers/providers';

import { LINKS_CONFIG } from 'src/config';

export async function fetchTransactions(
  amount: number,
  offset: number,
  address: string,
  web3Provider?: Web3Provider,
) {
  const txs: Tx[] = await fetch(
    `https://${LINKS_CONFIG.api}/api/v0.1/account/${address}/history/${offset}/${amount}`,
  ).then(r => r.json());

  return (await Promise.all(
    txs.map(async tx =>
      Object.assign(tx, {
        // confirmCount: web3Provider
        //   ? await getConfirmationCount(web3Provider!, tx.hash)
        //   : 0,
        created_at: new Date(tx.created_at),
      }),
    ),
  )) as Tx[];
}
