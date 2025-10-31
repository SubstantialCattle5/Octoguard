# Contributing

Thanks for contributing! :smile:

The following is a set of guidelines for contributing. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

> Note: Contributions should be made via pull requests to the dev branch of the repository.

## Table of Contents

1. [Styleguides](#styleguides)
2. [What should I know before I get started?](#what-should-i-know-before-i-get-started)
3. [How Can I contribute?](#how-can-i-contribute)
4. [Conventional Commits](#conventional-commits)
5. [Branch Naming](#branch-naming)
6. [Pull Request Quality Criteria](#pull-request-quality-criteria)
7. [Local Development for GitHub Actions](#local-development-for-github-actions)

# Guidelines

The following are the guidelines we request you to follow in order to contribute to this project.

## Styleguides

### Commit Messages

The commit messages should follow the following pattern:

```bash
feat: Description # if a new feature is added
fix: Description # if a bug is fixed
refactor: Description # if code is refactored
docs: Description # if documentation is added
lint: Description # if a lint issue is fixed
```

### Issues

```bash
update: Description # if an update is required for a feature
bug: Description # if there is a bug in a particular feature
suggestion: Description # if you want to suggest a better way to implement a feature
```

### Code Styleguide

The code should satisfy the following:

- Have meaningful variable names, either in `snake_case` or `camelCase`.
- Have no `lint` issues.
- Have meaningful file names, directory names and directory structure.
- Have a scope for easy fixing, refactoring and scaling.

### Pull Requests

Pull requests should have:

- A concise commit message.
- A description of what was changed/added.

## What should I know before I get started

You can contribute to any of the features you want, here's what you need to know:

- How the project works.
- The technology stack used for the project.
- A brief idea about writing documentation.

## How Can I Contribute

You can contribute by:

- Reporting Bugs
- Suggesting Enhancements
- Code Contribution
- Pull Requests

Make sure to document the contributions well in the pull request.

> It is not compulsory to follow the guidelines mentioned above, but it is strongly recommended.

## Conventional Commits

We use [Conventional Commits](https://www.conventionalcommits.org/) to standardize our commit messages.

**Examples:**

- `feat: add user authentication to API`
- `fix: correct typo in README`
- `docs: update CONTRIBUTING guidelines`
- `refactor: simplify response handling`
- `lint: fix formatting issues`

**Checklist:**

- [ ] Use a valid type (`feat`, `fix`, `docs`, `refactor`, `test`, `lint`, etc.)
- [ ] Use a short, imperative summary after the colon
- [ ] Reference issues where applicable (e.g., `fix: resolve #7`)

---

## Branch Naming

Please name your branches following this pattern:

`<type>/<short-description>`

**Types:** `feature`, `fix`, `docs`, `chore`, `refactor`

**Examples:**

- `feature/add-login-page`
- `fix/email-validation`
- `docs/update-api-usage`

---

## Pull Request Quality Criteria

Before submitting a pull request, ensure:

- [ ] The PR title follows Conventional Commits (see above)
- [ ] The PR description explains what and why of your changes
- [ ] Related issues are referenced (e.g., `Closes #7`)
- [ ] Code is well-formatted and linted
- [ ] New/updated tests are included (if applicable)
- [ ] No sensitive credentials or secrets are committed
- [ ] Screenshots or GIFs are provided for UI changes

**Example PR Description:**

```
### What Changed
- Added user authentication to the API

### Why
- Fixes #7; authentication is required for protected routes

### Additional Notes
- Added tests for new endpoints
```

---

## Local Development for GitHub Actions

If you are working on GitHub Actions, follow these steps to test locally:

1. **Clone the repository and install dependencies:**

   ```sh
   git clone https://github.com/SubstantialCattle5/Octoguard.git
   cd Octoguard
   npm install
   ```

2. **Test Actions locally:**

   - Use [act](https://github.com/nektos/act) to run actions locally:
     ```sh
     act
     ```
   - Ensure you have all necessary secrets set up in your environment.

3. **Checklist for Actions:**
   - [ ] Action runs successfully with `act`
   - [ ] All workflow files validate with `act -l`
   - [ ] No hard-coded secrets/tokens in workflows
