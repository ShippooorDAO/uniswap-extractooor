import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  TokenResponse,
  UniswapV3SubgraphProviderState,
} from '@/shared/UniswapV3Subgraph/UniswapV3Subgraph.type';
import { TOKENS_BATCH_QUERY } from './UniswapV3SubgraphQueries';
import { batchQuery } from '../Utils/Subgraph';
import { processTokens } from './UniswapV3SubgraphProcess';
import { TokenService } from '../Currency/TokenService';

const missingProviderError =
  'You forgot to wrap your code in a provider <UniswapV3SubgraphProvider>';

const UniswapV3SubgraphContext = createContext<UniswapV3SubgraphProviderState>({
  get tokens(): never {
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

  useEffect(() => {
    batchQuery<TokenResponse>(TOKENS_BATCH_QUERY, apolloClient).then(
      (tokenResponses) => {
        const tokens = processTokens(tokenResponses);
        setTokenService(new TokenService(tokens));
      }
    );
  }, []);
  return (
    <UniswapV3SubgraphContext.Provider
      value={{
        tokenService,
      }}
    >
      {children}
    </UniswapV3SubgraphContext.Provider>
  );
};
