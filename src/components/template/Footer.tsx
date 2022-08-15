const Footer = () => {
  return (
    <footer className="drop-shadow-md">
      <div className="container mx-auto mb-4">
        <div className="grid grid-cols-1 justify-items-center gap-6 text-center lg:grid-cols-12 lg:gap-0">
          <div className="flex flex-row justify-between lg:col-span-3 lg:justify-self-start m-5 bg-gray-400 rounded p-2">
            <img
              className="h-6"
              src="/assets/images/uniswap-logo.png"
              alt="uniswap logo"
            />
          </div>

          <div className="flex items-center lg:col-span-9 lg:justify-self-end">
            <a className="text-sm" href="http://shippooor.xyz">
              Made by &#128674; Shippoooor
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
