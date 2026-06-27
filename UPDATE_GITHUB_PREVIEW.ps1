param(
  [string]$ArchivePath = "$env:USERPROFILE\Downloads\feroxo_CONTACT_FIXES_28_06.zip",
  [string]$RepoPath = "C:\FeroxoPreview"
)

$ErrorActionPreference = 'Stop'
$Extract = Join-Path $env:TEMP 'FeroxoContactFix'

if (-not (Test-Path $ArchivePath)) { throw "Archive not found: $ArchivePath" }
if (-not (Test-Path (Join-Path $RepoPath '.git'))) { throw "Git repository not found: $RepoPath" }

Remove-Item $Extract -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $Extract | Out-Null
Expand-Archive -Path $ArchivePath -DestinationPath $Extract -Force

Get-ChildItem $Extract -Force |
  Where-Object { $_.Name -notin @('.git', '.github') } |
  Copy-Item -Destination $RepoPath -Recurse -Force

Set-Location $RepoPath
git add -A
git commit -m 'fix: align contact page with approved Figma reference'
git push origin main

Start-Process 'https://negoruha.github.io/feroxo-preview/pages/contact.html'
