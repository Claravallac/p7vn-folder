$ErrorActionPreference = 'Stop'

$owner = 'Claravallac'
$repo = 'p7vn-folder'
$branch = 'main'
$message = 'update: v1.0.62 limpeza tecnica'

$files = @(
  '.gitignore',
  'index.html',
  'package.json',
  'version.json',
  'changelog.json',
  'integrity.json',
  'integrity-full.json',
  'make-delta.js',
  'make-integrity.js',
  'make-integrity-full.js',
  'scripts/check-project.js'
)

function Invoke-GhJson {
  param(
    [Parameter(Mandatory = $true)][string[]]$Arguments,
    [string]$InputFile
  )

  $baseArgs = @('api') + $Arguments
  if ($InputFile) {
    $baseArgs += @('--input', $InputFile)
  }

  $raw = & gh @baseArgs
  if ($LASTEXITCODE -ne 0) {
    throw "gh api falhou: gh $($baseArgs -join ' ')"
  }
  return $raw | ConvertFrom-Json
}

$ref = Invoke-GhJson -Arguments @("repos/$owner/$repo/git/ref/heads/$branch")
$baseCommitSha = $ref.object.sha
$baseCommit = Invoke-GhJson -Arguments @("repos/$owner/$repo/git/commits/$baseCommitSha")
$baseTreeSha = $baseCommit.tree.sha

$treeEntries = @()
foreach ($file in $files) {
  if (-not (Test-Path -LiteralPath $file)) {
    throw "Arquivo nao encontrado: $file"
  }

  $content = Get-Content -LiteralPath $file -Raw -Encoding UTF8
  $blobBody = @{
    content = $content
    encoding = 'utf-8'
  } | ConvertTo-Json -Depth 5

  $blobFile = New-TemporaryFile
  Set-Content -LiteralPath $blobFile -Value $blobBody -Encoding UTF8
  try {
    $blob = Invoke-GhJson -Arguments @('-X', 'POST', "repos/$owner/$repo/git/blobs") -InputFile $blobFile
  } finally {
    Remove-Item -LiteralPath $blobFile -Force
  }

  $treeEntries += @{
    path = $file.Replace('\', '/')
    mode = '100644'
    type = 'blob'
    sha = $blob.sha
  }
}

$treeBody = @{
  base_tree = $baseTreeSha
  tree = $treeEntries
} | ConvertTo-Json -Depth 10

$treeFile = New-TemporaryFile
Set-Content -LiteralPath $treeFile -Value $treeBody -Encoding UTF8
try {
  $newTree = Invoke-GhJson -Arguments @('-X', 'POST', "repos/$owner/$repo/git/trees") -InputFile $treeFile
} finally {
  Remove-Item -LiteralPath $treeFile -Force
}

$commitBody = @{
  message = $message
  tree = $newTree.sha
  parents = @($baseCommitSha)
} | ConvertTo-Json -Depth 10

$commitFile = New-TemporaryFile
Set-Content -LiteralPath $commitFile -Value $commitBody -Encoding UTF8
try {
  $newCommit = Invoke-GhJson -Arguments @('-X', 'POST', "repos/$owner/$repo/git/commits") -InputFile $commitFile
} finally {
  Remove-Item -LiteralPath $commitFile -Force
}

$refBody = @{
  sha = $newCommit.sha
  force = $false
} | ConvertTo-Json -Depth 5

$refFile = New-TemporaryFile
Set-Content -LiteralPath $refFile -Value $refBody -Encoding UTF8
try {
  Invoke-GhJson -Arguments @('-X', 'PATCH', "repos/$owner/$repo/git/refs/heads/$branch") -InputFile $refFile | Out-Null
} finally {
  Remove-Item -LiteralPath $refFile -Force
}

Write-Host "Publicado em $branch: $($newCommit.sha)"
Write-Host "Release usada: https://github.com/$owner/$repo/releases/tag/v1.0.62"
