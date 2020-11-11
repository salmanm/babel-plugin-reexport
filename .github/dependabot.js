const getMergeMethod = (repo) => {
  if (repo.allow_merge_commit) return 'merge'
  if (repo.allow_squash_merge) return 'squash'
  return 'rebase'
}

module.exports = async ({ github, context }) => {
  const owner = context.payload.repository.owner.login
  const repo = context.payload.repository.name
  const prNumber = context.payload.pull_request.number

  const {
    data: pr
  } = await github.pulls.get({ owner, repo, pull_number: prNumber })

  const isDependabotPR = pr.user.login === 'dependabot[bot]'

  if (!isDependabotPR) {
    return console.log('Unable to merge')
  }

  await github.pulls.createReview({
    owner,
    repo,
    pull_number: prNumber,
    event: 'APPROVE'
  })

  await github.pulls.merge({
    owner,
    repo,
    pull_number: prNumber,
    merge_method: getMergeMethod(pr.head.repo)
  })
}
