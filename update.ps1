# Updates your class skills. Safe to run any time, safe to run twice.
#
# Needs nothing installed. No GitHub account, no git, no login.
# It NEVER touches your vault. Your notes stay exactly as they are.
#
# Works on Windows 10 and 11 with the PowerShell that is already there.

$ErrorActionPreference = "Stop"

# Older Windows 10 builds still default to TLS 1.0, which GitHub refuses.
# Without this the download fails with an unhelpful "could not create SSL/TLS
# secure channel" error.
try {
  [Net.ServicePointManager]::SecurityProtocol =
    [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
} catch { }

# In Windows PowerShell 5.1 the download progress bar can make a small download
# take minutes. Turning it off is a large speedup, not a cosmetic change.
$ProgressPreference = "SilentlyContinue"

$Zip    = "https://codeload.github.com/youdidwhat-towho/ai-builder-class/zip/refs/heads/main"
$Skills = Join-Path $env:USERPROFILE ".claude\skills"
$Cmds   = Join-Path $env:USERPROFILE ".claude\commands"
$Tmp    = Join-Path $env:TEMP ("aibc-" + [guid]::NewGuid().ToString())
$Kit    = Join-Path $Tmp "kit.zip"

New-Item -ItemType Directory -Force -Path $Tmp | Out-Null

try {
  Write-Host "Downloading the latest kit..."
  Invoke-WebRequest -Uri $Zip -OutFile $Kit -UseBasicParsing

  Write-Host "Unpacking..."
  Expand-Archive -Path $Kit -DestinationPath $Tmp -Force

  $Src = Join-Path $Tmp "ai-builder-class-main"
  $SrcSkills = Join-Path $Src "claude-config\skills"

  if (-not (Test-Path $SrcSkills)) {
    Write-Host ""
    Write-Host "Something went wrong. The download does not look right."
    Write-Host "Nothing on your computer was changed."
    Write-Host "Tell Claude: the update script downloaded but the skills folder was missing."
    exit 1
  }

  New-Item -ItemType Directory -Force -Path $Skills | Out-Null
  New-Item -ItemType Directory -Force -Path $Cmds   | Out-Null

  Copy-Item -Path (Join-Path $SrcSkills "*") -Destination $Skills -Recurse -Force
  Copy-Item -Path (Join-Path $Src "claude-config\commands\*") -Destination $Cmds -Recurse -Force

  Write-Host ""
  Write-Host "Done. You now have these skills:"
  Get-ChildItem -Path $Skills -Directory | Select-Object -ExpandProperty Name
  Write-Host ""
  Write-Host "Your vault was not touched."
  Write-Host "Now close Claude Code and open it again, then type / to see them."
}
catch {
  Write-Host ""
  Write-Host "The update did not finish. Nothing was changed."
  Write-Host "Copy the red text below and paste it to Claude, and say you are on Windows."
  Write-Host ""
  throw
}
finally {
  Remove-Item -Recurse -Force $Tmp -ErrorAction SilentlyContinue
}
