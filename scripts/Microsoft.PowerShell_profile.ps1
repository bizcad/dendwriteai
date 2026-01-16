# DendWriteAI PowerShell Profile
# This automatically loads when PowerShell starts in this workspace

$DendWriteAIRoot = if ($env:DENDWRITEAI_ROOT) { $env:DENDWRITEAI_ROOT } else { "G:\repos\dendwriteai" }

# ========== Shell Command Functions ==========
# Equivalent to Unix 'head' command - shows first 10 lines
# Usage: command | head
function head {
    param(
        [Parameter(ValueFromPipeline=$true)]
        [object]$InputObject
    )
    
    $input | Select-Object -First 10
}

# Equivalent to Unix 'tail' command - shows last 10 lines
# Usage: command | tail
function tail {
    param(
        [Parameter(ValueFromPipeline=$true)]
        [object]$InputObject
    )
    
    $input | Select-Object -Last 10
}

# Equivalent to Unix 'wc -l' command - counts lines
# Usage: command | wc
function wc {
    param(
        [Parameter(ValueFromPipeline=$true)]
        [object]$InputObject
    )
    
    @($input) | Measure-Object -Line | Select-Object -ExpandProperty Lines
}

# grep alias - PowerShell equivalent using Select-String
function grep {
    param(
        [Parameter(Mandatory=$true, Position=0)]
        [string]$Pattern,
        
        [Parameter(ValueFromPipeline=$true, ValueFromRemainingArguments=$true)]
        [string[]]$InputObject
    )
    
    begin {
        $allInput = @()
    }
    
    process {
        if ($InputObject) {
            $allInput += $InputObject
        }
    }
    
    end {
        if ($allInput) {
            # Try to treat as files first, then as pipeline input
            $files = @()
            $lines = @()
            
            foreach ($item in $allInput) {
                if (Test-Path $item -PathType Leaf) {
                    $files += $item
                } else {
                    $lines += $item
                }
            }
            
            if ($files) {
                Get-Content $files | Select-String -Pattern $Pattern
            } elseif ($lines) {
                $lines | Select-String -Pattern $Pattern
            }
        } else {
            Write-Host "Usage: grep 'pattern' [files]" -ForegroundColor Yellow
            Write-Host "Usage: command | grep 'pattern'" -ForegroundColor Yellow
        }
    }
}

# ========== DendWriteAI Project Navigation ==========

# Navigate to project root
function cddend {
    Set-Location $DendWriteAIRoot
}

# Navigate to web folder (Next.js)
function cdweb {
    Set-Location "$DendWriteAIRoot\web"
}

# Navigate to convex folder (Convex backend)
function cdconvex {
    Set-Location "$DendWriteAIRoot\convex"
}

# ========== DendWriteAI Development Commands ==========

# Start Convex dev server (must be run from project root)
function convex-dev {
    [Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseApprovedVerbs', '')]
    param()
    Write-Host "Starting Convex dev server..." -ForegroundColor Cyan
    Write-Host "Changing to: $DendWriteAIRoot" -ForegroundColor Gray
    Set-Location "$DendWriteAIRoot"
    Write-Host "Running: npx convex dev" -ForegroundColor Gray
    npx convex dev
}

# Start Next.js dev server (must be run from web folder)
function web-dev {
    [Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseApprovedVerbs', '')]
    param()
    Write-Host "Starting Next.js dev server..." -ForegroundColor Cyan
    Write-Host "Changing to: $DendWriteAIRoot\web" -ForegroundColor Gray
    Set-Location "$DendWriteAIRoot\web"
    Write-Host "Running: npm run dev" -ForegroundColor Gray
    npm run dev
}

# Install npm dependencies
function install-all {
    Write-Host "Installing dependencies..." -ForegroundColor Cyan
    Push-Location "$DendWriteAIRoot\web"
    npm install
    Pop-Location
}

# ========== Initialization Banner ==========

# Suppress QuestionManager message if it was loaded
function Clear-QuestionManagerAliases {
    if (Test-Path function:cdqm -ErrorAction SilentlyContinue) {
        Remove-Item function:cdqm -ErrorAction SilentlyContinue
    }
}

# Clear any previous project aliases
Clear-QuestionManagerAliases

Write-Host "✓ DendWriteAI development aliases loaded" -ForegroundColor Green
Write-Host "  Navigation: cddend, cdweb, cdconvex" -ForegroundColor Cyan
Write-Host "  Dev servers: convex-dev, web-dev" -ForegroundColor Cyan
Write-Host "  Utilities: head, tail, wc, grep, install-all" -ForegroundColor Cyan

# Load session logging
if ((Get-Location).Path -like "*dendwriteai*" -or (Get-Location).Path -like "*DendWriteAI*") {
    try {
        Push-Location $DendWriteAIRoot
        
        # Load session logging quietly
        if (Test-Path ".\PromptTracking\session-log.ps1") {
            . ".\PromptTracking\session-log.ps1"
            
            if (Test-Path ".\PromptTracking\log-aliases.ps1") {
                . ".\PromptTracking\log-aliases.ps1"
                
                Write-Host "✅ Session logging ready! Try: " -NoNewline -ForegroundColor Green
                Write-Host "log-help" -ForegroundColor Cyan
            }
        }
    }
    catch {
        # Silently continue if session logging fails
    }
    finally {
        Pop-Location
    }
}
