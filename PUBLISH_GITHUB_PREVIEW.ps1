param(
  [string]$ArchivePath = (Join-Path $env:USERPROFILE 'Downloads\feroxo_FORPSI_ALL_PAGES_TESTED.zip')
)

$ErrorActionPreference = 'Stop'
$Project = 'C:\FeroxoPreview'

if (-not (Test-Path -LiteralPath $ArchivePath)) {
  throw "Archive not found: $ArchivePath"
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw 'Git is not installed. Run: winget install --id Git.Git ; then reopen PowerShell and run this script again.'
}

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  throw 'GitHub CLI is not installed. Run: winget install --id GitHub.cli ; then reopen PowerShell and run this script again.'
}

# Opens GitHub authorization only if the current PowerShell session is not authenticated.
gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
  gh auth login --web --git-protocol https
}

$Owner = (gh api user --jq .login).Trim()
if (-not $Owner) {
  throw 'Could not determine the authenticated GitHub account.'
}

$RepoName = "feroxo-preview-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$Repo = "$Owner/$RepoName"
$PreviewUrl = "https://$Owner.github.io/$RepoName/"

Remove-Item -LiteralPath $Project -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $Project | Out-Null
Expand-Archive -LiteralPath $ArchivePath -DestinationPath $Project -Force

if (-not (Test-Path -LiteralPath (Join-Path $Project 'index.html'))) {
  throw 'The archive does not contain index.html at its root.'
}

Set-Location $Project
git init --initial-branch=main
git config user.name $Owner
git config user.email "$Owner@users.noreply.github.com"
git add .
git commit -m 'Publish Feroxo test preview'

gh repo create $Repo --public --source . --remote origin --push

$Payload = @{
  build_type = 'legacy'
  source = @{
    branch = 'main'
    path = '/'
  }
} | ConvertTo-Json -Depth 5 -Compress

$Payload | gh api --method POST "repos/$Repo/pages" --input - | Out-Null

Write-Host ''
Write-Host "GitHub repository: https://github.com/$Repo" -ForegroundColor Green
Write-Host "Preview URL: $PreviewUrl" -ForegroundColor Green
Write-Host 'GitHub Pages is building. Wait about 1–3 minutes, then open the Preview URL.' -ForegroundColor Yellow

Start-Sleep -Seconds 20
Start-Process $PreviewUrl
