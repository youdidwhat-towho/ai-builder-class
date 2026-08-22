# Updates your class skills. Safe to run any time, safe to run twice.
#
# Needs nothing installed. No GitHub account, no git, no login.
# It NEVER touches your vault. Your notes stay exactly as they are.
$ErrorActionPreference = "Stop"

$Zip    = "https://codeload.github.com/youdidwhat-towho/ai-builder-class/zip/refs/heads/main"
$Skills = Join-Path $env:USERPROFILE ".claude\skills"
$Cmds   = Join-Path $env:USERPROFILE ".claude\commands"
$Tmp    = Join-Path $env:TEMP ("aibc-" + [guid]::NewGuid().ToString())

New-Item -ItemType Directory -Force -Path $Tmp | Out-Null
try {
  Write-Host "Downloading the latest kit..."
  Invoke-WebRequest -Uri $Zip -OutFile (Join-Path $Tmp "kit.zip") -UseBasicParsing

  Write-Host "Unpacking..."
  Expand-Archive -Path (Join-Path $Tmp "kit.zip") -DestinationPath $Tmp -Force
  $Src = Join-Path $Tmp "ai-builder-class-main"

  if (-not (Test-Path (Join-Path $Src "claude-config\skills"))) {
    Write-Host "Something went wrong, the download does not look right. Nothing was changed."
    exit 1
  }

  New-Item -ItemType Directory -Force -Path $Skills, $Cmds | Out-Null
  Copy-Item -Recurse -Force (Join-Path $Src "claude-config\skills\*") $Skills
  Copy-Item -Recurse -Force (Join-Path $Src "claude-config\commands\*") $Cmds

  Write-Host ""
  Write-Host "Done. You now have these skills:"
  Get-ChildItem -Name $Skills
  Write-Host ""
  Write-Host "Your vault was not touched."
  Write-Host "Now restart Claude Code, then type / to see them."
}
finally {
  Remove-Item -Recurse -Force $Tmp -ErrorAction SilentlyContinue
}
