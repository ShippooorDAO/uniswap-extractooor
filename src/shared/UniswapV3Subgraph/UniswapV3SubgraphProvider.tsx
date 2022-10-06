import {
  ApolloClient,
  DocumentNode,
  NormalizedCacheObject,
  TypedDocumentNode,
} from '@apollo/client';
import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  BatchQueryResponse,
  PoolResponse,
  UniswapV3SubgraphProviderState,
} from '@/shared/UniswapV3Subgraph/UniswapV3Subgraph.type';
import {
  POOLS_BATCH_QUERY_BY_TIMESTAMP,
  POOLS_BATCH_QUERY_BY_ID,
} from './UniswapV3SubgraphQueries';
import { processPools } from './UniswapV3SubgraphProcess';
import { TokenService } from '../Currency/TokenService';
import { UniswapPoolService } from '../UniswapPool/UniswapPoolService';
import { batchQuery } from '../Utils/Subgraph';

export async function batchQueryPoolsByTimestamp(
  query:
    | DocumentNode
    | TypedDocumentNode<
        PoolResponse,
        { pageSize: number; createdAfterTimestamp: number }
      >,
  apolloClient: ApolloClient<NormalizedCacheObject>,
  createdAfterTimestamp: number = 0,
  pageSize = 1000
): Promise<PoolResponse[]> {
  let hasMoreResults = false;
  const batchResult: PoolResponse[] = [];

  do {
    try {
      const results = await apolloClient.query<
        BatchQueryResponse<PoolResponse>
      >({
        query,
        variables: {
          pageSize,
          createdAfterTimestamp,
        },
      });
      const dataList: PoolResponse[] = results.data.batch ?? [];
      batchResult.push(...dataList);

      hasMoreResults = dataList.length > 0;
      if (hasMoreResults) {
        createdAfterTimestamp = Number(dataList.at(-1)!.createdAtTimestamp);
      }
    } catch (e: unknown) {
      continue;
    }
  } while (hasMoreResults);

  return batchResult;
}

const missingProviderError =
  'You forgot to wrap your code in a provider <UniswapV3SubgraphProvider>';

const UniswapV3SubgraphContext = createContext<UniswapV3SubgraphProviderState>({
  get tokenService(): never {
    throw new Error(missingProviderError);
  },
  get uniswapPoolService(): never {
    throw new Error(missingProviderError);
  },
});

interface UniswapV3SubgraphProviderProps {
  apolloClient: ApolloClient<NormalizedCacheObject>;
  children?: ReactNode;
}

export const useUniswapV3SubgraphContext = () =>
  useContext<UniswapV3SubgraphProviderState>(UniswapV3SubgraphContext);

export const UniswapV3SubgraphProvider: FC<UniswapV3SubgraphProviderProps> = ({
  children,
  apolloClient,
}: UniswapV3SubgraphProviderProps) => {
  const [tokenService, setTokenService] = useState<TokenService | undefined>();
  const [uniswapPoolService, setUniswapPoolService] = useState<
    UniswapPoolService | undefined
  >();

  useEffect(() => {
    const storageKey = 'uniswap-extractooor:pools';
    const storedPoolsJson = window.localStorage.getItem(storageKey);
    const storedPoolsResponses: PoolResponse[] = storedPoolsJson
      ? JSON.parse(storedPoolsJson)
      : [];

    if (storedPoolsResponses.length === 0) {
      /**
       * Querying pools for the first time.
       *
       * All results will be stored on browser's local storage to be reused in following sessions
       * to make initial page load faster in the future.
       *
       * Batch query is indexed by ID to make the subgraph query as fast as possible server-side.
       */
      batchQuery<PoolResponse>(POOLS_BATCH_QUERY_BY_ID, apolloClient).then(
        (poolResponses) => {
          const { tokens, pools } = processPools(poolResponses);

          const tokenService = new TokenService(tokens);
          setTokenService(tokenService);
          setUniswapPoolService(new UniswapPoolService(pools, tokenService));

          window.localStorage.setItem(
            storageKey,
            JSON.stringify([...poolResponses, ...storedPoolsResponses])
          );
        }
      );
    } else {
      /**
       * Pools have already been queried in the past.
       *
       * We only need to load pools that have been created since last session.
       * Then, we store these new pools in browser's local storage along with those that were already stored
       * so that initial page loading time is faster in the future.
       *
       * Batch query is indexed by timestamp to ensure we can query only what is necessary.
       * Subgraph performance is not very good when indexing by timestamp, but this will surely make less network calls than loading everything like above batch query.
       */
      const latestTimestampInStorage =
        storedPoolsResponses.length > 0
          ? Math.max(
              ...storedPoolsResponses.map((pool) =>
                Number(pool.createdAtTimestamp)
              )
            )
          : 0;
      batchQueryPoolsByTimestamp(
        POOLS_BATCH_QUERY_BY_TIMESTAMP,
        apolloClient,
        latestTimestampInStorage
      ).then((poolResponses) => {
        const { tokens: storedTokens, pools: storedPools } =
          processPools(storedPoolsResponses);
        const { tokens: queriedTokens, pools: queriedPools } =
          processPools(poolResponses);

        const tokens = [...queriedTokens, ...storedTokens];
        const pools = [...queriedPools, ...storedPools];

        const tokenService = new TokenService(tokens);
        setTokenService(tokenService);
        setUniswapPoolService(new UniswapPoolService(pools, tokenService));

        window.localStorage.setItem(
          storageKey,
          JSON.stringify([...poolResponses, ...storedPoolsResponses])
        );
      });
    }
  }, []);

  return (
    <UniswapV3SubgraphContext.Provider
      value={{
        tokenService,
        uniswapPoolService,
      }}
    >
      {children}
    </UniswapV3SubgraphContext.Provider>
  );
};
