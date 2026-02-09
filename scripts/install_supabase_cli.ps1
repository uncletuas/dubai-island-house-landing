$ErrorActionPreference = 'Stop'

# Installs Supabase CLI (supabase.exe) into ./.tools/supabase/supabase.exe
# using the latest GitHub release asset for Windows amd64.

$release = Invoke-RestMethod -Uri 'https://api.github.com/repos/supabase/cli/releases/latest'

$asset = $release.assets |
  Where-Object { $_.name -like '*windows_amd64.tar.gz' } |
  Select-Object -First 1

if ($null -eq $asset) {
  throw "Could not find a windows_amd64.tar.gz asset in latest supabase/cli release."
}

$zipPath = Join-Path $env:TEMP 'supabase-cli.tar.gz'
Write-Host "Downloading Supabase CLI from: $($asset.browser_download_url)"
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zipPath

$destDir = Join-Path (Get-Location) '.tools\\supabase'
New-Item -ItemType Directory -Force -Path $destDir | Out-Null

# Extract to a temp folder first, then copy the exe to a stable path
$extractDir = Join-Path $env:TEMP 'supabase-cli-extract'
if (Test-Path $extractDir) { Remove-Item -Recurse -Force $extractDir }
New-Item -ItemType Directory -Force -Path $extractDir | Out-Null

tar -xzf $zipPath -C $extractDir

$exe = Get-ChildItem -Path $extractDir -Recurse -Filter 'supabase.exe' | Select-Object -First 1
if ($null -eq $exe) {
  throw 'supabase.exe not found after extraction.'
}

$targetExe = Join-Path $destDir 'supabase.exe'
Copy-Item -Force -Path $exe.FullName -Destination $targetExe

Write-Host "Installed Supabase CLI to: $targetExe"
& $targetExe --version
