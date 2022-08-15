import '../styles/global.css';
import { ThemeProvider } from 'next-themes';

import { AppProps } from 'next/app';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { ApolloProviderProps } from '@apollo/client/react/context';
import { combineProviders } from 'react-combine-providers';
import { UniswapV3SubgraphProvider } from '@/shared/UniswapV3Subgraph/UniswapV3SubgraphProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { ExtractoooorProvider } from '@/shared/Extractooor/ExtractooorProvider';

const apolloClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
  cache: new InMemoryCache(),
});

const providers = combineProviders();
providers.push(ThemeProvider, { attribute: 'data-theme' });
providers.push(ApolloProvider, {
  client: apolloClient,
} as ApolloProviderProps<any>);
providers.push(UniswapV3SubgraphProvider, { apolloClient });
providers.push(ExtractoooorProvider, { apolloClient });
providers.push(LocalizationProvider, { dateAdapter: AdapterMoment });

const MasterProvider = providers.master();

const MyApp = ({ Component, pageProps }: AppProps) => (
  <MasterProvider>
    <Component {...pageProps} />
  </MasterProvider>
);

export default MyApp;
