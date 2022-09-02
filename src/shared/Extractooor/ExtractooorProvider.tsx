import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useUniswapV3SubgraphContext } from '../UniswapV3Subgraph/UniswapV3SubgraphProvider';

import { ExtractooorQuery, ExtractooorProviderState } from './Extractooor.type';
import TokensQuery from './Query/TokensQuery';
import PoolsQuery from './Query/PoolsQuery';

const missingProviderError =
  'You forgot to wrap your code in a provider <ExtractooorProvider>';

const ExtractooorContext = createContext<ExtractooorProviderState>({
  get queries(): never {
    throw new Error(missingProviderError);
  },
});

interface ExtractooorProviderProps {
  apolloClient: ApolloClient<NormalizedCacheObject>;
  children?: ReactNode;
}

export const useExtractooorContext = () =>
  useContext<ExtractooorProviderState>(ExtractooorContext);

export const ExtractoooorProvider: FC<ExtractooorProviderProps> = ({
  children,
  apolloClient,
}: ExtractooorProviderProps) => {
  const { tokenService } = useUniswapV3SubgraphContext();
  const [queries, setQueries] = useState<ExtractooorQuery[] | undefined>();

  useEffect(() => {
    if (tokenService) {
      setQueries([
        /**
         * Initialize all queries here!
         */
        new TokensQuery(apolloClient, tokenService),
        new PoolsQuery(apolloClient, tokenService),
      ]);
    }
  }, [tokenService]);

  return (
    <ExtractooorContext.Provider
      value={{
        queries,
      }}
    >
      {children}
    </ExtractooorContext.Provider>
  );
};
