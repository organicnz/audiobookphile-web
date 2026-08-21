#!/bin/bash
sed -i '' 's/master/main/g' lefthook.yml
git add lefthook.yml
git commit -m "fix(ci): update lefthook target branch to main"
git push origin chore/ci-automation
gh pr create --title "chore(ci): setup dependabot and auto-merge automation" --body "Sets up Dependabot updates for GitHub Actions and NPM, alongside an auto-approve and auto-merge workflow for dependabot PRs to provide a highly pro-active auto-updating ecosystem."
