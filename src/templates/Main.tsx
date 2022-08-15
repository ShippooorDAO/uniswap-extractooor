import type { ReactNode } from 'react';

import Footer from '@/components/template/Footer';
import Navbar from '@/components/template/Navbar';
import Breadcrumbs, { BreadcrumbLink } from '@/components/Breadcrumbs';

type IMainProps = {
  meta?: ReactNode;
  children: ReactNode;
  breadcrumbs?: BreadcrumbLink[];
};

export const Main = (props: IMainProps) => (
  <div className="antialiased">
    {props.meta}
    <Navbar>
      <div className="h-full">
        <img
          src="/assets/wave.svg"
          className="scale-[4] w-full fixed top-[-140px] right-[-37px] dark:opacity-20 overflow-hidden invert rotate-90"
        />
        <div className="relative max-w-7xl mx-auto px-2 sm:px-0 h-full">
          <div className="py-4 pl-4">
            {props.breadcrumbs && <Breadcrumbs links={props.breadcrumbs} />}
          </div>
          {props.children}
        </div>
      </div>
      <Footer />
    </Navbar>
  </div>
);

export default Main;
