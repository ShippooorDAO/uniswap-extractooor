import '../styles/global.css';
import { ThemeProvider } from 'next-themes';

import { AppProps } from 'next/app';
import { combineProviders } from 'react-combine-providers';
import { UniswapV3SubgraphProvider } from '@/shared/UniswapV3Subgraph/UniswapV3SubgraphProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { ExtractoooorProvider } from '@/shared/Extractooor/ExtractooorProvider';
import { LicenseInfo } from '@mui/x-license-pro';
import Script from 'next/script';

if (process.env.NEXT_PUBLIC_MUI_DATA_GRID_PREMIUM_LICENSE_KEY) {
  LicenseInfo.setLicenseKey(
    process.env.NEXT_PUBLIC_MUI_DATA_GRID_PREMIUM_LICENSE_KEY
  );
}

const providers = combineProviders();
providers.push(ThemeProvider, {
  attribute: 'data-theme',
  defaultTheme: 'dark',
});
providers.push(UniswapV3SubgraphProvider);
providers.push(ExtractoooorProvider);
providers.push(LocalizationProvider, { dateAdapter: AdapterMoment });

const MasterProvider = providers.master();

const MyApp = ({ Component, pageProps }: AppProps) => (
  <MasterProvider>
    <Script
      src="https://www.googletagmanager.com/gtag/js?id=G-VSMQE8FD4Z"
      strategy="afterInteractive"
    />
    <Script id="google-analytics" strategy="afterInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){window.dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'G-VSMQE8FD4Z');
      `}
    </Script>
    <Component {...pageProps} />
  </MasterProvider>
);

export default MyApp;
