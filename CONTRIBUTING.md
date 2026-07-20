# Contributing

Thank you for contributing to this repository.

Before making substantial changes, please discuss the change you want to make
with the project owners through an issue, email, or another appropriate
channel. This helps avoid duplicated work and keeps the scope aligned.

Please note that this project has a code of conduct. Follow it in all
interactions with the project.

## Development Setup

This project uses:

- `Node.js` `24.18.0` (see `.nvmrc`)
- `pnpm` as the package manager
- `Vite+` (`vp`) as the main development toolchain

If you use `nvm`, you can prepare the environment with:

```bash
nvm use
```

Install dependencies before starting:

```bash
vp install
```

If `vp` is not available globally in your environment yet, install it first
according to the Vite+ documentation used by your setup.

## Project Structure

Important directories and files:

- `src/` - library source code
- `src/tests/` - automated tests
- `dist/` - build output
- `vite.config.ts` - Vite+ configuration for build, lint, format, and tests
- `package.json` - available scripts and package metadata

## Running the Project

This package is a library, so the normal local workflow is to build it in watch
mode while you develop.

Start development build in watch mode:

```bash
pnpm run dev
```

Create a production build:

```bash
pnpm run build
```

The build output is generated in `dist/`.

## Validation and Quality Checks

Run the full project checks before opening a pull request:

```bash
vp check
vp test
```

You can also use the package scripts below.

### Linting and Type Checking

Run the standard checks:

```bash
pnpm run check
```

Run lint only:

```bash
pnpm run lint
```

Run lint with automatic fixes when possible:

```bash
pnpm run lint:fix
```

## Running Tests

Run the test suite once:

```bash
pnpm run test
```

Run tests in watch mode during development:

```bash
pnpm run test:watch
```

Run the interactive Vitest UI without coverage:

```bash
pnpm run test:ui
```

Run the interactive Vitest UI with coverage enabled:

```bash
pnpm run test:ui:coverage
```

Generate coverage locally:

```bash
pnpm run test:coverage
```

Run the CI-style coverage workflow:

```bash
pnpm run test:ci
```

Run tests related to staged files:

```bash
pnpm run test:staged
```

## Bundle Analysis

Generate an interactive bundle-size report with the configured bundle analyzer:

```bash
pnpm run bundle:analyze
```

The command enables the analyzer only for that build through `VP_ANALYZER=true`.
Use it when a change may affect package size, such as adding dependencies,
changing imports, or modifying build configuration.

## Pull Request Process

Before opening a pull request:

1. Make sure the branch is up to date and dependencies are installed with
   `vp install`.
2. Run `vp check` and `vp test`, or the equivalent `pnpm` scripts, and fix any
   issues directly related to your change.
3. If your change affects public behavior, APIs, configuration, or usage,
   update `README.md` and any relevant documentation.
4. Ensure any temporary build artifacts or unnecessary generated files are not
   committed.

Additional project requirements:

1. Ensure any install or build dependencies are removed before the end of the
   layer when doing a build.
2. Update the `README.md` with details of changes to the interface, including
   new environment variables, exposed ports, useful file locations, and
   container parameters.
3. Increase the version numbers in any example files and in `README.md` to the
   new version represented by the pull request. The versioning scheme used is
   [SemVer](http://semver.org/).
4. You may merge the pull request once you have sign-off from two other
   developers. If you do not have permission to merge, request the second
   reviewer to merge it for you.

## Commit Guidance

This repository uses `commitlint` with the conventional commit preset. Prefer
messages such as:

- `feat: add support for ...`
- `fix: handle invalid storage value`
- `docs: update contributing guide`
- `test: cover async storage flow`

## Code of Conduct

### Our Pledge

In the interest of fostering an open and welcoming environment, we as
contributors and maintainers pledge to making participation in our project and
our community a harassment-free experience for everyone, regardless of age, body
size, disability, ethnicity, gender identity and expression, level of
experience, nationality, personal appearance, race, religion, or sexual
identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment
include:

* Using welcoming and inclusive language
* Being respectful of differing viewpoints and experiences
* Gracefully accepting constructive criticism
* Focusing on what is best for the community
* Showing empathy towards other community members

Examples of unacceptable behavior by participants include:

* The use of sexualized language or imagery and unwelcome sexual attention or
  advances
* Trolling, insulting/derogatory comments, and personal or political attacks
* Public or private harassment
* Publishing others' private information, such as a physical or electronic
  address, without explicit permission
* Other conduct which could reasonably be considered inappropriate in a
  professional setting

### Our Responsibilities

Project maintainers are responsible for clarifying the standards of acceptable
behavior and are expected to take appropriate and fair corrective action in
response to any instances of unacceptable behavior.

Project maintainers have the right and responsibility to remove, edit, or
reject comments, commits, code, wiki edits, issues, and other contributions
that are not aligned to this Code of Conduct, or to ban temporarily or
permanently any contributor for other behaviors that they deem inappropriate,
threatening, offensive, or harmful.

### Scope

This Code of Conduct applies both within project spaces and in public spaces
when an individual is representing the project or its community. Examples of
representing a project or community include using an official project e-mail
address, posting via an official social media account, or acting as an
appointed representative at an online or offline event. Representation of a
project may be further defined and clarified by project maintainers.

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be
reported by contacting the project team at michelon.souza@hotmail.com. All
complaints will be reviewed and investigated and will result in a response that
is deemed necessary and appropriate to the circumstances. The project team is
obligated to maintain confidentiality with regard to the reporter of an
incident. Further details of specific enforcement policies may be posted
separately.

Project maintainers who do not follow or enforce the Code of Conduct in good
faith may face temporary or permanent repercussions as determined by other
members of the project's leadership.

### Attribution

This Code of Conduct is adapted from the [Contributor Covenant][homepage],
version 1.4, available at
[http://contributor-covenant.org/version/1/4][version]

[homepage]: http://contributor-covenant.org
[version]: http://contributor-covenant.org/version/1/4/
