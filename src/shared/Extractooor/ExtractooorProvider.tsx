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
import TicksQuery from './Query/TicksQuery';
import PositionsQuery from './Query/PositionsQuery';
import PositionSnapshotsQuery from './Query/PositionSnapshotsQuery';
import TransactionsQuery from './Query/TransactionsQuery';
import MintsQuery from './Query/MintsQuery';
import BurnsQuery from './Query/BurnsQuery';
import SwapsQuery from './Query/SwapsQuery';
import CollectsQuery from './Query/CollectsQuery';
import FlashesQuery from './Query/FlashesQuery';
import UniswapDayDatasQuery from './Query/UniswapDayDatasQuery';
import PoolDayDatasQuery from './Query/PoolDayDatasQuery';

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
        new TicksQuery(apolloClient, tokenService),
        new PositionsQuery(apolloClient, tokenService),
        new PositionSnapshotsQuery(apolloClient, tokenService),
        new TransactionsQuery(apolloClient),
        new MintsQuery(apolloClient, tokenService),
        new BurnsQuery(apolloClient, tokenService),
        new SwapsQuery(apolloClient, tokenService),
        new CollectsQuery(apolloClient, tokenService),
        new FlashesQuery(apolloClient, tokenService),
        new UniswapDayDatasQuery(apolloClient, tokenService),
        new PoolDayDatasQuery(apolloClient, tokenService),
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
