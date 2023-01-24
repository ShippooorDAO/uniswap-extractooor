# Uniswap Extractooor

Grant: https://dydxgrants.com/funded-grants/approved-grants/treasury-management-dashboard

## Requirements

- Node.js 16+ and npm

Run the following command to install dependencies:

```shell
npm install
```

## Running

### Development

```shell
npm run dev
```

Open http://localhost:3000

### Production

Insert Docker setup here

```shell
npm run build
npm run start
```

## Testing

All tests are colocated with the source code inside the same directory. So, it makes it easier to find them. Unfortunately, it is not possible with the `pages` folder which is used by Next.js for routing. So, what is why we have a `pages.test` folder to write tests from files located in `pages` folder.

Tests can be ran with the following command:

```shell
npm run test
```

## Project structure

```shell
.
├── README.md                       # README file
├── __mocks__                       # Mocks for testing
├── .github                         # GitHub folder
├── .husky                          # Husky configuration
├── .vscode                         # VSCode configuration
├── public                          # Public assets folder
├── src
│   ├── layouts                     # Layouts components
│   ├── pages                       # Next JS Pages
│   ├── pages.test                  # Next JS Pages tests (this avoid test to treated as a Next.js pages)
│   ├── styles                      # Styles folder
│   ├── templates                   # Default template
│   └── utils                       # Utility functions
├── tailwind.config.js              # Tailwind CSS configuration
└── tsconfig.json                   # TypeScript configuration
```

## Technical stack

- [Next.js](https://nextjs.org)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com) with [daisyUI](https://daisyui.com)
- [ESLint](https://eslint.org)
- [Prettier](https://prettier.io)
- Testing with Jest and React Testing Library
- SEO metadata, JSON-LD and Open Graph tags with Next SEO

Comitting to this repository is done by following the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) standard. It can be either prefixed by:

```
feat:
fix:
docs:
chore:
```

## Regenerating cache files

For optimal page load speed performance, the following cache files can be regenerated periodically.

- [src/shared/UniswapV3Subgraph/Cache/arbitrum.json](src/shared/UniswapV3Subgraph/Cache/arbitrum.json)
- [src/shared/UniswapV3Subgraph/Cache/celo.json](src/shared/UniswapV3Subgraph/Cache/celo.json)
- [src/shared/UniswapV3Subgraph/Cache/ethereum.json](src/shared/UniswapV3Subgraph/Cache/ethereum.json)
- [src/shared/UniswapV3Subgraph/Cache/optimism.json](src/shared/UniswapV3Subgraph/Cache/optimism.json)
- [src/shared/UniswapV3Subgraph/Cache/polygon.json](src/shared/UniswapV3Subgraph/Cache/polygon.json)

To regenerate cache files, open your browser's development console, look for those console log statements:

```
Arbitrum pools cache successfully generated. Copy and paste the following object in src/shared/UniswapV3Subgraph/Cache/arbitrum.json to update the cache. (1461) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, …]
```

These console logs will show up every time when changing the "Chain" option.
