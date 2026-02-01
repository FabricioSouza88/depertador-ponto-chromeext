# Build Script - Despertador Ponto
# Gera arquivo ZIP para publicacao na Chrome Web Store

Write-Host "Iniciando build da extensao..." -ForegroundColor Cyan
Write-Host ""

$projectRoot = $PSScriptRoot
$outputFile = Join-Path $projectRoot "despertador-ponto.zip"
$tempDir = Join-Path $projectRoot "build-temp"

$filesToInclude = @(
    "manifest.json",
    "popup.html",
    "popup.css",
    "popup-i18n.js",
    "background.js",
    "content.js"
)

$foldersToInclude = @(
    "icons",
    "src"
)

Write-Host "Validando manifest.json..." -ForegroundColor Yellow

$manifestPath = Join-Path $projectRoot "manifest.json"
if (-not (Test-Path $manifestPath)) {
    Write-Host "ERRO: manifest.json nao encontrado!" -ForegroundColor Red
    exit 1
}

try {
    $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
    Write-Host "   Manifest valido" -ForegroundColor Green
    Write-Host "   Nome: $($manifest.name)" -ForegroundColor Gray
    Write-Host "   Versao: $($manifest.version)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "ERRO ao ler manifest.json: $_" -ForegroundColor Red
    exit 1
}

Write-Host "Verificando arquivos obrigatorios..." -ForegroundColor Yellow

$missingFiles = @()
foreach ($file in $filesToInclude) {
    $filePath = Join-Path $projectRoot $file
    if (Test-Path $filePath) {
        Write-Host "   OK: $file" -ForegroundColor Green
    } else {
        Write-Host "   FALTA: $file" -ForegroundColor Red
        $missingFiles += $file
    }
}

$requiredIcons = @("icon16.png", "icon32.png", "icon48.png", "icon128.png")
$iconsPath = Join-Path $projectRoot "icons"
if (Test-Path $iconsPath) {
    Write-Host "   OK: icons/" -ForegroundColor Green
    foreach ($icon in $requiredIcons) {
        $iconPath = Join-Path $iconsPath $icon
        if (Test-Path $iconPath) {
            Write-Host "      OK: $icon" -ForegroundColor Green
        } else {
            Write-Host "      FALTA: $icon" -ForegroundColor Red
            $missingFiles += "icons/$icon"
        }
    }
} else {
    Write-Host "   FALTA: icons/" -ForegroundColor Red
    $missingFiles += "icons/"
}

$srcPath = Join-Path $projectRoot "src"
if (Test-Path $srcPath) {
    Write-Host "   OK: src/" -ForegroundColor Green
} else {
    Write-Host "   AVISO: src/ nao encontrada" -ForegroundColor Yellow
}

Write-Host ""

if ($missingFiles.Count -gt 0) {
    Write-Host "ATENCAO: Alguns arquivos estao faltando!" -ForegroundColor Yellow
    Write-Host "A extensao pode nao funcionar corretamente." -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continuar mesmo assim? (s/N)"
    if ($continue -ne "s" -and $continue -ne "S") {
        Write-Host "Build cancelado." -ForegroundColor Red
        exit 1
    }
    Write-Host ""
}

if (Test-Path $outputFile) {
    Write-Host "Removendo ZIP anterior..." -ForegroundColor Yellow
    Remove-Item $outputFile -Force
    Write-Host "   Removido" -ForegroundColor Green
    Write-Host ""
}

Write-Host "Criando diretorio temporario..." -ForegroundColor Yellow
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
Write-Host "   Criado: $tempDir" -ForegroundColor Green
Write-Host ""

Write-Host "Copiando arquivos..." -ForegroundColor Yellow

$copiedFiles = 0
foreach ($file in $filesToInclude) {
    $sourcePath = Join-Path $projectRoot $file
    if (Test-Path $sourcePath) {
        $destPath = Join-Path $tempDir $file
        Copy-Item $sourcePath $destPath -Force
        Write-Host "   Copiado: $file" -ForegroundColor Green
        $copiedFiles++
    }
}

foreach ($folder in $foldersToInclude) {
    $sourcePath = Join-Path $projectRoot $folder
    if (Test-Path $sourcePath) {
        $destPath = Join-Path $tempDir $folder
        Copy-Item $sourcePath $destPath -Recurse -Force
        Write-Host "   Copiado: $folder/" -ForegroundColor Green
        $copiedFiles++
    }
}

Write-Host ""
Write-Host "   Total: $copiedFiles itens copiados" -ForegroundColor Gray
Write-Host ""

Write-Host "Criando arquivo ZIP..." -ForegroundColor Yellow

try {
    Compress-Archive -Path (Join-Path $tempDir "*") -DestinationPath $outputFile -CompressionLevel Optimal -Force
    
    Write-Host "   ZIP criado com sucesso!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "ERRO ao criar ZIP: $_" -ForegroundColor Red
    Remove-Item $tempDir -Recurse -Force
    exit 1
}

Write-Host "Limpando arquivos temporarios..." -ForegroundColor Yellow
Remove-Item $tempDir -Recurse -Force
Write-Host "   Limpeza concluida" -ForegroundColor Green
Write-Host ""

$fileInfo = Get-Item $outputFile
$fileSizeKB = [math]::Round($fileInfo.Length / 1KB, 2)
$fileSizeMB = [math]::Round($fileInfo.Length / 1MB, 2)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BUILD CONCLUIDO COM SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Arquivo gerado:" -ForegroundColor Cyan
Write-Host "   Local: $outputFile" -ForegroundColor White
Write-Host "   Tamanho: $fileSizeKB KB ($fileSizeMB MB)" -ForegroundColor White
Write-Host "   Data: $($fileInfo.LastWriteTime)" -ForegroundColor White
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Cyan
Write-Host "   1. Acesse: https://chrome.google.com/webstore/devconsole" -ForegroundColor White
Write-Host "   2. Clique em 'New item'" -ForegroundColor White
Write-Host "   3. Faca upload do arquivo: despertador-ponto.zip" -ForegroundColor White
Write-Host "   4. Preencha as informacoes da extensao" -ForegroundColor White
Write-Host "   5. Envie para revisao" -ForegroundColor White
Write-Host ""
Write-Host "Dica: Guarde este arquivo para fazer upload na Chrome Web Store!" -ForegroundColor Yellow
Write-Host ""

# Perguntar apenas se for interativo
if ([Environment]::UserInteractive) {
    $openFolder = Read-Host "Deseja abrir a pasta do arquivo? (S/n)"
    if ($openFolder -ne "n" -and $openFolder -ne "N") {
        explorer.exe /select,$outputFile
    }
}

Write-Host ""
Write-Host "Pronto! Boa sorte com a publicacao!" -ForegroundColor Green
Write-Host ""
