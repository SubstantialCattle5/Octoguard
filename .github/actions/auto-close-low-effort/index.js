const { getValidatedGraceHours } = require('../utils/validateInputs');

module.exports = async ({ github, context }) => {
  const owner = context.repo.owner;
  const repo = context.repo.repo;

  // ✅ Validate grace_hours input
  const graceHours = getValidatedGraceHours();
  const now = new Date();

  // Find open PRs
  const prs = await github.paginate(github.rest.pulls.list, { owner, repo, state: 'open', per_page: 100 });

  for (const pr of prs) {
    const number = pr.number;

    // Check for needs-justification label
    const hasNeedsJust = (pr.labels || []).some(l => (l.name || l) === 'needs-justification');
    if (!hasNeedsJust) continue;

    // Get latest comments to find deadline marker
    const comments = await github.paginate(github.rest.issues.listComments, { owner, repo, issue_number: number, per_page: 100 });
    const markerComment = comments.reverse().find(c => /<!--\s*low-effort-deadline:/.test(c.body || ''));
    if (!markerComment) {
      const assumedDeadline = new Date(new Date(pr.updated_at).getTime() + graceHours * 60 * 60 * 1000);
      if (assumedDeadline > now) continue;
    } else {
      const m = markerComment.body.match(/low-effort-deadline:([^\s]+)\s*-->/);
      if (m && m[1]) {
        const deadline = new Date(m[1]);
        if (deadline > now) continue;
      }
    }

    // Recent commits within grace period -> skip
    const commits = await github.paginate(github.rest.pulls.listCommits, { owner, repo, pull_number: number, per_page: 10 });
    const since = new Date(now.getTime() - graceHours * 60 * 60 * 1000);
    const hasRecentCommit = commits.some(c => new Date(c.commit.author.date) > since);
    if (hasRecentCommit) continue;

    // Comment and close
    const closeMsg = `### 🚫 Auto-Closing Low-Effort PR\n\nThis PR was previously labeled \`needs-justification\` and no sufficient justification or updates were provided within ${graceHours} hours.\n\nIf you believe this was closed in error, please push additional commits or comment for re-evaluation.`;

    await github.rest.issues.createComment({ owner, repo, issue_number: number, body: closeMsg });
    await github.rest.issues.addLabels({ owner, repo, issue_number: number, labels: ['closed-low-effort'] });
    await github.rest.pulls.update({ owner, repo, pull_number: number, state: 'closed' });
  }
};
