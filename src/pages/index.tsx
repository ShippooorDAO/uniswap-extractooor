import Extractooor from '@/components/extractooor/Extractooor';
import { Meta } from '@/layouts/Meta';
import { Main } from '@/templates/Main';

const Index = () => {
  return (
    <Main
      meta={
        <Meta title="Uniswap Extractooor" description="Uniswap Extractooor" />
      }
    >
      <Extractooor />
    </Main>
  );
};

export default Index;
