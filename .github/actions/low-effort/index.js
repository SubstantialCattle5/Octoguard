module.exports = async ({ github, context }) => {
  const pr = context.payload.pull_request;
  const owner = context.repo.owner;
  const repo = context.repo.repo;
  const graceHours = parseFloat(process.env.LOW_EFFORT_GRACE_HOURS || "48");

  // Fetch changed files
  const files = await github.paginate(github.rest.pulls.listFiles, {
    owner, repo, pull_number: pr.number, per_page: 100
  });

  const body = pr.body || "";
  const title = pr.title || "";
  const indicators = [];
  let isLowEffort = false;

  // Check if issue is linked
  const hasIssueLink = /#\d+/.test(body) || /closes|fixes|resolves/i.test(body);
  if (!hasIssueLink) {
    indicators.push("❌ No linked issue found");
  }

  // Check if template was filled out
  const hasEmptyTemplate = /- \[ \] .+/g.test(body) &&
                           !/- \[x\] .+/gi.test(body) &&
                           body.split('\n').filter(l => l.trim()).length < 8;
  if (hasEmptyTemplate) {
    indicators.push("❌ PR template not filled out properly");
  }

  // Check if explanation section is empty or generic
  const explanationMatch = body.match(/explain.*in your own words[:\s]+(.*?)(\n#{1,3}|\n-|\n\*|$)/is);
  const explanation = explanationMatch?.[1]?.trim() || "";
  if (!explanation || explanation.length < 20) {
    indicators.push("❌ Missing or minimal explanation of changes");
  }

  const genericPhrases = [
    /^(updated|improved|fixed|enhanced|optimized)\s*(the)?\s*(code|readme|documentation|docs)\.?$/i,
    /^minor (fix|update|change)\.?$/i,
    /^typo\.?$/i,
    /^formatting\.?$/i,
    /^see (title|description)\.?$/i
  ];
  if (genericPhrases.some(p => p.test(explanation.trim()))) {
    indicators.push("⚠️ Generic/vague explanation provided");
  }

  // Analyze file changes
  const fileNames = files.map(f => f.filename);
  const totalChanges = files.reduce((n, f) => n + (f.changes || 0), 0);
  const additions = files.reduce((n, f) => n + (f.additions || 0), 0);
  const deletions = files.reduce((n, f) => n + (f.deletions || 0), 0);

  // Lockfile-only changes
  const lockFiles = ['package-lock.json', 'yarn.lock', 'go.sum', 'Gemfile.lock', 'Cargo.lock', 'pnpm-lock.yaml'];
  const onlyLockFiles = fileNames.length > 0 && fileNames.every(f => lockFiles.some(lf => f.endsWith(lf)));
  if (onlyLockFiles) {
    indicators.push("🔒 Only lockfile changes (no code changes)");
    isLowEffort = true;
  }

  // Trivial README/docs-only changes
  const onlyDocs = fileNames.length > 0 && fileNames.every(f => /\.(md|txt|rst)$/i.test(f));
  if (onlyDocs && totalChanges < 10) {
    indicators.push("📄 Trivial documentation-only change (<10 lines)");
    isLowEffort = true;
  }

  // Whitespace/formatting only (high deletions+additions, low net change)
  const netChange = Math.abs(additions - deletions);
  if (totalChanges > 100 && netChange < 10 && additions > 50 && deletions > 50) {
    indicators.push("⚪ Likely whitespace/formatting-only changes");
    isLowEffort = true;
  }

  // Single word typo fixes
  if (totalChanges === 2 && additions === 1 && deletions === 1) {
    indicators.push("✏️ Single word change (likely typo fix)");
    isLowEffort = true;
  }

  // Generic title patterns
  const genericTitles = [
    /^update readme\.?$/i,
    /^fix typo\.?$/i,
    /^improve (docs?|documentation)\.?$/i,
    /^formatting\.?$/i,
    /^minor (fix|update|change)\.?$/i,
    /^updated\.?$/i
  ];
  if (genericTitles.some(p => p.test(title.trim()))) {
    indicators.push("⚠️ Generic PR title");
  }

  // Check author's recent PRs (potential spam pattern)
  try {
    const recentPRs = await github.rest.search.issuesAndPullRequests({
      q: `author:${pr.user.login} type:pr repo:${owner}/${repo} created:>=${new Date(Date.now() - 24*60*60*1000).toISOString().split('T')[0]}`,
      per_page: 10
    });
    if (recentPRs.data.total_count >= 3) {
      indicators.push(`⚠️ Author has ${recentPRs.data.total_count} PRs opened in last 24h`);
    }
  } catch (_) {
    // ignore errors fetching PRs
  }

  // Decide on action
  const criticalFlags = indicators.filter(i => i.startsWith("❌")).length;
  const needsJustification = isLowEffort || criticalFlags >= 2 || (indicators.length >= 3 && !hasIssueLink);

  if (needsJustification) {
    await github.rest.issues.addLabels({ owner, repo, issue_number: pr.number, labels: ["needs-justification"] });

    const summary = indicators.map(i => `- ${i}`).join("\n");
    const deadline = new Date(Date.now() + graceHours * 60 * 60 * 1000).toISOString();
    const message = `### ⚠️ This PR Needs Justification\n\nThis contribution appears to be low-effort or lacks proper context. Please address the following:\n\n${summary}\n\n**Required Actions:**\n1. Link to a relevant issue (if none exists, create one explaining the problem)\n2. Fill out the PR template completely\n3. Explain in your own words:\n   - What problem does this solve?\n   - Why is this change valuable?\n   - How did you test it?\n\n**Note:** PRs without justification may be closed within ${graceHours} hours. We appreciate quality contributions that add real value to the project.\n\nIf you believe this is a false positive, please reply with additional context.\n\n<!-- low-effort-deadline:${deadline} -->`;

    await github.rest.issues.createComment({ owner, repo, issue_number: pr.number, body: message });

    // If it's Hacktoberfest season (Sept 26 - Oct 31), add extra label
    const now = new Date();
    const month = now.getMonth(); // 0-indexed
    const day = now.getDate();
    const isHacktoberfest = (month === 8 && day >= 26) || month === 9;
    if (isHacktoberfest && isLowEffort) {
      await github.rest.issues.addLabels({ owner, repo, issue_number: pr.number, labels: ["hacktoberfest-spam-suspect"] });
    }
  } else if (indicators.length > 0) {
    const summary = indicators.map(i => `- ${i}`).join("\n");
    const message = `### 💡 Suggestions to Improve This PR\n\n${summary}\n\nConsider addressing these points to make your contribution stronger. Thanks for contributing!`;
    await github.rest.issues.createComment({ owner, repo, issue_number: pr.number, body: message });
  }
};
