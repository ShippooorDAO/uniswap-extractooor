import type { ReactNode } from 'react';

import Footer from '@/components/template/Footer';
import Navbar from '@/components/template/Navbar';
import Breadcrumbs, { BreadcrumbLink } from '@/components/Breadcrumbs';
import { useExtractooorContext } from '@/shared/Extractooor/ExtractooorProvider';

type IMainProps = {
  meta?: ReactNode;
  children: ReactNode;
  breadcrumbs?: BreadcrumbLink[];
};

export const Main = (props: IMainProps) => {
  const { fullscreen } = useExtractooorContext();

  return (
    <div className="antialiased">
      {props.meta}
      <Navbar>
        <>
          <img
            src="/assets/wave.svg"
            className="scale-[4] w-full fixed top-[-140px] right-[-37px] dark:opacity-20 overflow-hidden invert rotate-90"
          />
          <div className="relative bg-[url('/assets/images/background-50.png')] bg-opacity-50 bg-no-repeat bg-fixed">
            <div className="md:py-4 px-8">
              {props.breadcrumbs && <Breadcrumbs links={props.breadcrumbs} />}
            </div>
            <div className={!fullscreen ? 'max-w-7xl mx-auto' : ''}>
              {props.children}
            </div>
          </div>
        </>
        <Footer />
      </Navbar>
    </div>
  );
};

export default Main;
