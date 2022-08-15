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

## VSCode information (optional)

If you are VSCode users, you can have a better integration with VSCode by installing the suggested extension in `.vscode/extension.json`. The starter code comes up with Settings for a seamless integration with VSCode. The Debug configuration is also provided for frontend and backend debugging experience.

With the plugins installed on your VSCode, ESLint and Prettier can automatically fix the code and show you the errors. Same goes for testing, you can install VSCode Jest extension to automatically run your tests and it also show the code coverage in context.

Pro tips: if you need a project wide type checking with TypeScript, you can run a build with <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd> on Mac.

## License

Licensed under the MIT License, Copyright © 2022

See [LICENSE](LICENSE) for more information.
