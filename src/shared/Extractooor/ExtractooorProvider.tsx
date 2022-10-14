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
import PoolHourDatasQuery from './Query/PoolHourDatasQuery';
import TickHourDatasQuery from './Query/TickHourDatasQuery';
import TickDayDatasQuery from './Query/TickDayDatasQuery';
import TokenDayDatasQuery from './Query/TokenDayDatasQuery';
import TokenHourDatasQuery from './Query/TokenHourDatasQuery';

const missingProviderError =
  'You forgot to wrap your code in a provider <ExtractooorProvider>';

const ExtractooorContext = createContext<ExtractooorProviderState>({
  get queries(): never {
    throw new Error(missingProviderError);
  },
  get fullscreen(): never {
    throw new Error(missingProviderError);
  },
  get setFullscreen(): never {
    throw new Error(missingProviderError);
  },
});

interface ExtractooorProviderProps {
  children?: ReactNode;
}

export const useExtractooorContext = () =>
  useContext<ExtractooorProviderState>(ExtractooorContext);

export const ExtractoooorProvider: FC<ExtractooorProviderProps> = ({
  children,
}: ExtractooorProviderProps) => {
  const { tokenService, uniswapPoolService, apolloClient } =
    useUniswapV3SubgraphContext();
  const [queries, setQueries] = useState<
    (() => ExtractooorQuery)[] | undefined
  >();
  const [fullscreen, setFullscreen] = useState<boolean>(false);

  useEffect(() => {
    if (tokenService && uniswapPoolService) {
      setQueries([
        /**
         * Initialize all queries here!
         */
        () =>
          new UniswapDayDatasQuery(
            apolloClient,
            tokenService,
            uniswapPoolService
          ),
        () => new SwapsQuery(apolloClient, tokenService, uniswapPoolService),
        () => new TokensQuery(apolloClient, tokenService, uniswapPoolService),
        () => new PoolsQuery(apolloClient, tokenService, uniswapPoolService),
        () => new TicksQuery(apolloClient, tokenService, uniswapPoolService),
        () =>
          new PositionsQuery(apolloClient, tokenService, uniswapPoolService),
        () =>
          new PositionSnapshotsQuery(
            apolloClient,
            tokenService,
            uniswapPoolService
          ),
        () =>
          new TransactionsQuery(apolloClient, tokenService, uniswapPoolService),
        () => new MintsQuery(apolloClient, tokenService, uniswapPoolService),
        () => new BurnsQuery(apolloClient, tokenService, uniswapPoolService),
        () => new CollectsQuery(apolloClient, tokenService, uniswapPoolService),
        () => new FlashesQuery(apolloClient, tokenService, uniswapPoolService),
        () =>
          new PoolDayDatasQuery(apolloClient, tokenService, uniswapPoolService),
        () =>
          new PoolHourDatasQuery(
            apolloClient,
            tokenService,
            uniswapPoolService
          ),
        () =>
          new TickHourDatasQuery(
            apolloClient,
            tokenService,
            uniswapPoolService
          ),
        () =>
          new TickDayDatasQuery(apolloClient, tokenService, uniswapPoolService),
        () =>
          new TokenDayDatasQuery(
            apolloClient,
            tokenService,
            uniswapPoolService
          ),
        () =>
          new TokenHourDatasQuery(
            apolloClient,
            tokenService,
            uniswapPoolService
          ),
      ]);
    }
  }, [tokenService]);

  return (
    <ExtractooorContext.Provider
      value={{
        queries,
        fullscreen,
        setFullscreen,
      }}
    >
      {children}
    </ExtractooorContext.Provider>
  );
};
