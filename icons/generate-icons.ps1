# Script PowerShell para gerar ícones PNG placeholder
# Uso: .\generate-icons.ps1

Add-Type -AssemblyName System.Drawing

$sizes = @(16, 32, 48, 128)
$iconColor = [System.Drawing.Color]::FromArgb(102, 126, 234)
$whiteColor = [System.Drawing.Color]::White
$redColor = [System.Drawing.Color]::FromArgb(231, 76, 60)

Write-Host "🎨 Gerando ícones PNG placeholder..." -ForegroundColor Cyan
Write-Host ""

foreach ($size in $sizes) {
    try {
        # Cria bitmap
        $bmp = New-Object System.Drawing.Bitmap($size, $size)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
        
        # Fundo roxo (círculo)
        $brush = New-Object System.Drawing.SolidBrush($iconColor)
        $g.FillEllipse($brush, 0, 0, $size, $size)
        
        # Relógio branco
        $clockSize = [int]($size * 0.6)
        $clockX = [int](($size - $clockSize) / 2)
        $clockY = [int](($size - $clockSize) / 2)
        
        $whiteBrush = New-Object System.Drawing.SolidBrush($whiteColor)
        $g.FillEllipse($whiteBrush, $clockX, $clockY, $clockSize, $clockSize)
        
        # Ponteiros do relógio
        $centerX = $size / 2
        $centerY = $size / 2
        $penWidth = [Math]::Max(1, $size / 16)
        
        $pen = New-Object System.Drawing.Pen($iconColor, $penWidth)
        $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
        $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
        
        # Ponteiro das horas (para cima)
        $hourLength = $clockSize / 3
        $g.DrawLine($pen, $centerX, $centerY, $centerX, $centerY - $hourLength)
        
        # Ponteiro dos minutos (para direita)
        $minuteLength = $clockSize / 2.5
        $g.DrawLine($pen, $centerX, $centerY, $centerX + $minuteLength, $centerY)
        
        # Badge de notificação
        if ($size -ge 32) {
            $badgeSize = [int]($size * 0.25)
            $badgeX = $size - $badgeSize - 2
            $badgeY = 2
            
            $redBrush = New-Object System.Drawing.SolidBrush($redColor)
            $g.FillEllipse($redBrush, $badgeX, $badgeY, $badgeSize, $badgeSize)
        }
        
        # Salva
        $outputPath = Join-Path $PSScriptRoot "icon$size.png"
        $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        # Cleanup
        $g.Dispose()
        $bmp.Dispose()
        $brush.Dispose()
        $whiteBrush.Dispose()
        $pen.Dispose()
        if ($size -ge 32) { $redBrush.Dispose() }
        
        Write-Host "✅ Gerado: icon$size.png" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Erro ao gerar icon$size.png: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Ícones gerados com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Nota: Estes são ícones placeholder básicos." -ForegroundColor Yellow
Write-Host "   Para ícones de alta qualidade, use npm run generate-icons" -ForegroundColor Yellow
