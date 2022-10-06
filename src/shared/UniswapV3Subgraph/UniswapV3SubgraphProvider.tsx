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
    import('./cached_pools_response.json').then((jsonImport) => {
      const cachedPoolResponses = jsonImport.default;
      const latestTimestampInStorage =
        cachedPoolResponses.length > 0
          ? Math.max(
              ...cachedPoolResponses.map((pool) =>
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
          processPools(cachedPoolResponses);
        const { tokens: queriedTokens, pools: queriedPools } =
          processPools(poolResponses);

        const tokens = [...queriedTokens, ...storedTokens];
        const pools = [...queriedPools, ...storedPools];

        const tokenService = new TokenService(tokens);
        setTokenService(tokenService);
        setUniswapPoolService(new UniswapPoolService(pools, tokenService));
      });
    });
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
