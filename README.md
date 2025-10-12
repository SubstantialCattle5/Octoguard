[![Issues][issues-shield]][issues-url]

<!-- PROJECT LOGO -->

  <h3 align="center">Octoguard</h3>

  <p align="center">
    Automated GitHub Actions for managing low-effort PRs and AI-assisted contributions
    <br />
    <a href="https://github.com/substantialcattle5/Octoguard"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/substantialcattle5/Octoguard">View Repository</a>
    ·
    <a href="https://github.com/substantialcattle5/Octoguard/issues">Report Bug</a>
    ·
    <a href="https://github.com/substantialcattle5/Octoguard/issues">Request Feature</a>
  </p>



<!-- TABLE OF CONTENTS -->
## Table of Contents

* [About the Project](#about-the-project)
  * [Built With](#built-with)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
* [Usage](#usage)
* [Roadmap](#roadmap)
* [Contributing](#contributing)
* [License](#license)
* [Contributors](#contributors-)

<!-- ABOUT THE PROJECT -->
## About The Project

Octoguard is a comprehensive GitHub Actions solution designed to help maintainers manage low-effort pull requests and identify AI-assisted contributions during events like Hacktoberfest. It provides automated triage, labeling, and closure workflows to maintain repository quality while reducing manual maintenance overhead.

### Key Features

* **Low-effort PR Detection**: Automatically identifies and labels PRs that appear to be low-effort contributions
* **AI-Assisted Detection**: Flags PRs that may have been created with AI assistance
* **Automated Triage**: Provides guidance to contributors and sets deadlines for improvement
* **Auto-close Policy**: Automatically closes PRs that don't meet quality standards after a grace period
* **Reusable Actions**: Can be used as GitHub Marketplace actions in other repositories

### Built With

* GitHub Actions
* Node.js
* JavaScript



<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.
* npm
```sh
npm install npm@latest -g
```

### Installation
 
1. Clone the repo
```sh
git clone https://github.com/substantialcattle5/Octoguard.git
```
2. Install NPM packages
```sh
npm install
```



<!-- USAGE EXAMPLES -->
## Usage

### Using Octoguard in Your Repository

Add the Octoguard workflows to your repository by copying the workflow files from `.github/workflows/` to your repository's `.github/workflows/` directory.

#### Low-Effort Triage Workflow

This workflow automatically labels PRs that appear to be low-effort contributions:

```yaml
name: Low-Effort Triage
on:
  pull_request_target:
    types: [opened, edited, synchronize]
jobs:
  triage:
    runs-on: ubuntu-latest
    steps:
      - name: Low-effort triage
        uses: substantialcattle5/Octoguard/.github/actions/low-effort@main
        with:
          grace_hours: '48'
```

#### Auto-Close Workflow

This workflow automatically closes PRs that remain labeled as low-effort after the grace period:

```yaml
name: Auto-Close Low-Effort
on:
  schedule:
    - cron: '0 * * * *'
  workflow_dispatch:
jobs:
  close:
    runs-on: ubuntu-latest
    steps:
      - name: Auto-close
        uses: substantialcattle5/Octoguard/.github/actions/auto-close-low-effort@main
        with:
          grace_hours: '48'
```

#### AI Suspect Detection

This workflow detects and labels AI-assisted contributions:

```yaml
name: AI Suspect Detection
on:
  pull_request_target:
    types: [opened, edited, synchronize]
jobs:
  detect:
    runs-on: ubuntu-latest
    steps:
      - name: AI suspect detection
        uses: substantialcattle5/Octoguard/.github/actions/ai-suspect@main
```



<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/substantialcattle5/Octoguard/issues) for a list of proposed features (and known issues).

### Planned Features

- Enhanced AI detection algorithms
- Customizable triage rules
- Integration with more CI/CD platforms
- Dashboard for monitoring PR quality metrics



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push -u origin feature/AmazingFeature`)
5. Open a Pull Request

You are requested to follow the contribution guidelines specified in [CONTRIBUTING.md](./CONTRIBUTING.md) while contributing to the project :smile:.

## Hacktoberfest

This repository includes GitHub Actions workflows to support Hacktoberfest and maintain contribution quality:

- Low-effort triage: PRs that appear low-effort (e.g., trivial docs-only changes, lockfile-only changes, generic/empty explanations) are labeled `needs-justification` with a comment outlining required actions.
- Auto-close policy: If a PR remains `needs-justification` without substantial updates, it may be auto-closed after 48 hours. The grace period is configurable via `LOW_EFFORT_GRACE_HOURS`.
- AI indicators: If AI assistance is disclosed or suspected, PRs may receive `ai-assisted` or `ai-suspected` labels for human review.

No extra steps are required beyond following `CONTRIBUTING.md` and completing the PR template.

<!-- LICENSE -->
## License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for more information.




<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[issues-shield]: https://img.shields.io/github/issues/substantialcattle5/Octoguard.svg?style=flat-square
[issues-url]: https://github.com/substantialcattle5/Octoguard/issues
