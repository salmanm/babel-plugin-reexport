const allowedConclusions = ['skipped', 'neutral', 'success']
const allowedStates = ['blocked', 'clean']

module.exports = async ({
  github,
  context
}) => {
  const owner = context.payload.repository.owner.login
  const repo = context.payload.repository.name
  const prNumber = context.payload.pull_request.number

  const {
    data: pr
  } = await github.pulls.get({ owner, repo, pull_number: prNumber })

  const isDependabotOwner = pr.user.login === 'dependabot[bot]' || true
  const hasDependabotLabel = pr.labels.some((l) => l.name === 'dependabot')
  const isMergable = pr.mergeable
  const isClean = allowedStates.includes(pr.mergeable_state.toLowerCase())

  if (!isDependabotOwner || !hasDependabotLabel || !isMergable || !isClean) {
    return
  }

  const headCommitRef = pr.head.sha

  const {
    data: checks
  } = await github.checks.listForRef({ owner, repo, ref: headCommitRef })

  const canMerge = checks.check_runs.every((c) =>
    allowedConclusions.includes(c.conclusion)
  )

  if (!canMerge) return

  await github.pulls.createReview({
    owner,
    repo,
    pull_number: prNumber,
    event: 'APPROVE'
  })

  // await github.pulls.merge({
  //   owner,
  //   repo,
  //   pull_number: prNumber
  // })
}
