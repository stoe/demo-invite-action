# ghec-report-reinvite-action

> GitHub Action to reinvite users to GitHub Enterprise Cloud organizations after https://github.com/ActionsDesk/ghec-invitations-report-action created a report.

[![Test](https://github.com/ActionsDesk/ghec-report-reinvite-action/workflows/Test/badge.svg)](https://github.com/ActionsDesk/ghec-report-reinvite-action/actions?query=workflow%3ATest) [![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

## Usage

**Scheduled report example**

```yml
on:
  schedule:
    # Runs at 00:00 UTC on the first of every month
    - cron: '0 0 1 * *'

name: 'Invitation report'

jobs:
  report:
    runs-on: ubuntu-latest

    steps:
      - name: 'Scheduled report'
        uses: ActionsDesk/ghec-invitations-report-action@main
        with:
          token: ${{ secrets.REPORT_TOKEN }}
          enterprise: 'my-enterprise'
          report-path: 'reports/enterprise-invitations.csv'

  reinvite:
    needs: report

    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Reinvite users
        uses: ActionsDesk/ghec-report-reinvite-action@v1
        with:
          token: ${{ secrets.REPORT_TOKEN }}
          report-path: 'reports/enterprise-invitations.csv'
```

<details>
  <summary><strong>On-demand report example</strong></summary>

```yml
on:
  workflow_dispatch:
    inputs:
      enterprise:
        description: 'GitHub Enterprise Cloud account, if omitted the report will target the repository organization only'
        required: false
        default: ''
      report-path:
        description: 'Path to the report file'
        default: 'reports/invitations.csv'
        required: false

name: 'Invitation report'

jobs:
  report:
    runs-on: ubuntu-latest

    steps:
      - name: 'On-demand report'
        uses: ActionsDesk/ghec-invitations-report-action@v1
        with:
          token: ${{ secrets.REPORT_TOKEN }}
          enterprise: ${{ github.event.inputs.enterprise }}
          report-path: ${{ github.event.inputs.report-path }}

  reinvite:
    needs: report

    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Reinvite users
        uses: ActionsDesk/ghec-report-reinvite-action@v1
        with:
          token: ${{ secrets.REPORT_TOKEN }}
          report-path: ${{ github.event.inputs.report-path }}
```

</details>

### Action Inputs

| Name          | Description                                           | Default                 | Required |
| :------------ | :---------------------------------------------------- | :---------------------- | :------- |
| `token`       | A `admin:org`, `read:user`, `user:email` scoped [PAT] |                         | `true`   |
| `report-path` | Report CSV file path within the repository            | `invitation-report.csv` | `true`   |

## License

- [MIT License](./license)

[pat]: https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token 'Personal Access Token'
