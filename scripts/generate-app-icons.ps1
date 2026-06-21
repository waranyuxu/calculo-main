Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"
$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$ImagesDir = Join-Path $ProjectRoot "assets/images"
$MascotPath = Join-Path $ImagesDir "mascots/mascot-cheer-transparent.png"

function New-Canvas {
  param(
    [int]$Width,
    [int]$Height
  )

  $bitmap = New-Object System.Drawing.Bitmap $Width, $Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $bitmap.SetResolution(144, 144)
  return $bitmap
}

function New-RoundedRectPath {
  param(
    [System.Drawing.RectangleF]$Rect,
    [float]$Radius
  )

  $diameter = $Radius * 2
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddArc($Rect.X, $Rect.Y, $diameter, $diameter, 180, 90)
  $path.AddArc($Rect.Right - $diameter, $Rect.Y, $diameter, $diameter, 270, 90)
  $path.AddArc($Rect.Right - $diameter, $Rect.Bottom - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($Rect.X, $Rect.Bottom - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function Use-Graphics {
  param(
    [System.Drawing.Bitmap]$Bitmap,
    [scriptblock]$Draw
  )

  $graphics = [System.Drawing.Graphics]::FromImage($Bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

  try {
    & $Draw $graphics
  } finally {
    $graphics.Dispose()
  }
}

function Save-Png {
  param(
    [System.Drawing.Bitmap]$Bitmap,
    [string]$Path
  )

  $Bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $Bitmap.Dispose()
}

function Draw-GradientBackground {
  param(
    [System.Drawing.Graphics]$Graphics,
    [System.Drawing.RectangleF]$Rect
  )

  $path = New-RoundedRectPath $Rect 152
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $Rect,
    [System.Drawing.Color]::FromArgb(31, 199, 231),
    [System.Drawing.Color]::FromArgb(33, 170, 206),
    90
  )

  try {
    $Graphics.FillPath($brush, $path)
  } finally {
    $brush.Dispose()
    $path.Dispose()
  }
}

function Draw-Mascot {
  param(
    [System.Drawing.Graphics]$Graphics,
    [System.Drawing.Image]$Mascot,
    [System.Drawing.Rectangle]$Destination
  )

  $Graphics.DrawImage($Mascot, $Destination)
}

function Make-AppIcon {
  param([System.Drawing.Image]$Mascot)

  $bitmap = New-Canvas 1024 1024
  Use-Graphics $bitmap {
    param($graphics)
    $graphics.Clear([System.Drawing.Color]::White)
    Draw-GradientBackground $graphics ([System.Drawing.RectangleF]::new(86, 102, 852, 820))
    Draw-Mascot $graphics $Mascot ([System.Drawing.Rectangle]::new(-92, -42, 1208, 1208))
  }
  Save-Png $bitmap (Join-Path $ImagesDir "icon.png")
}

function Make-AdaptiveBackground {
  $bitmap = New-Canvas 1024 1024
  Use-Graphics $bitmap {
    param($graphics)
    $rect = [System.Drawing.RectangleF]::new(0, 0, 1024, 1024)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
      $rect,
      [System.Drawing.Color]::FromArgb(31, 199, 231),
      [System.Drawing.Color]::FromArgb(8, 141, 190),
      90
    )

    try {
      $graphics.FillRectangle($brush, $rect)
    } finally {
      $brush.Dispose()
    }
  }
  Save-Png $bitmap (Join-Path $ImagesDir "android-icon-background.png")
}

function Make-AdaptiveForeground {
  param([System.Drawing.Image]$Mascot)

  $bitmap = New-Canvas 1024 1024
  Use-Graphics $bitmap {
    param($graphics)
    $graphics.Clear([System.Drawing.Color]::Transparent)
    Draw-Mascot $graphics $Mascot ([System.Drawing.Rectangle]::new(-92, -42, 1208, 1208))
  }
  Save-Png $bitmap (Join-Path $ImagesDir "android-icon-foreground.png")
}

function Make-MonochromeIcon {
  param([System.Drawing.Image]$Mascot)

  $bitmap = New-Canvas 1024 1024
  Use-Graphics $bitmap {
    param($graphics)
    $graphics.Clear([System.Drawing.Color]::Transparent)
    Draw-Mascot $graphics $Mascot ([System.Drawing.Rectangle]::new(-92, -42, 1208, 1208))
  }

  for ($y = 0; $y -lt $bitmap.Height; $y++) {
    for ($x = 0; $x -lt $bitmap.Width; $x++) {
      $pixel = $bitmap.GetPixel($x, $y)
      if ($pixel.A -gt 8) {
        $bitmap.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($pixel.A, 255, 255, 255))
      }
    }
  }

  Save-Png $bitmap (Join-Path $ImagesDir "android-icon-monochrome.png")
}

function Make-SplashIcon {
  param([System.Drawing.Image]$Mascot)

  $bitmap = New-Canvas 512 512
  Use-Graphics $bitmap {
    param($graphics)
    $graphics.Clear([System.Drawing.Color]::Transparent)
    Draw-Mascot $graphics $Mascot ([System.Drawing.Rectangle]::new(24, 8, 464, 464))
  }
  Save-Png $bitmap (Join-Path $ImagesDir "splash-icon.png")
}

$mascot = [System.Drawing.Image]::FromFile($MascotPath)
try {
  Make-AppIcon $mascot
  Make-AdaptiveBackground
  Make-AdaptiveForeground $mascot
  Make-MonochromeIcon $mascot
  Make-SplashIcon $mascot
} finally {
  $mascot.Dispose()
}

Write-Host "Generated app icon, Android adaptive icons, and splash icon."
