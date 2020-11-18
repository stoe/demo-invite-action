/**
 * Reinvitation Action.
 */
const fs = require('fs').promises
const path = require('path')

const {getInput, info, setFailed, warning} = require('@actions/core')
const github = require('@actions/github')
const parse = require('csv-parse/lib/sync')

const normalizeColumns = column => {
  const col = column.toLowerCase()

  switch (col) {
    case 'organization':
      return 'org'
    case 'username':
      return 'login'
    case 'user id':
      return 'invitee_id'
    case 'invitation creation date':
      return 'date'
    default:
      return col
  }
}

const normalizeRecords = (value, context) => {
  if (value === '') {
    return undefined
  }

  switch (context.column) {
    case 'invitee_id':
      return parseInt(value, 10)
    case 'date':
      return new Date(value)
    default:
      return value
  }
}

;(async () => {
  try {
    const reportPath = getInput('report-path', {required: true})

    const filePath = path.join(process.env.GITHUB_WORKSPACE, reportPath)
    const {dir} = path.parse(filePath)

    if (dir.indexOf(process.env.GITHUB_WORKSPACE) < 0) {
      throw new Error(`${reportPath} is not an allowed path`)
    }

    const token = getInput('token', {required: true})
    const octokit = new github.getOctokit(token)

    const content = await fs.readFile(reportPath)

    const records = parse(content, {
      columns: header => header.map(normalizeColumns),
      cast: normalizeRecords,
      trim: true
    })

    // If we do not have any invitees, stop here
    if (records.length <= 0) {
      info(`no invitations found`)
      process.exit(0)
    }

    for (const {org, login: username, email} of records) {
      const opts = {org}

      if (username === undefined) {
        opts.email = email
      } else {
        // get the user id for the username from CSV to use for the invitations call
        const {
          data: {id: invitee_id}
        } = await octokit.request('GET /users/{username}', {username})

        opts.invitee_id = invitee_id
      }

      const {status, data} = await octokit.request('POST /orgs/{org}/invitations', opts)

      if (status !== 201) {
        warning(`organization(${org}) invitation failed for ${data.login ? data.login : data.email}`)
      } else {
        info(`organization(${org}) invitation sent to ${data.login ? data.login : data.email}`)
      }
    }
  } catch (err) {
    setFailed(err.message)
  }
})()
