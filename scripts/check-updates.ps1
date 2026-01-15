#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Check and update NuGet packages in the dendwriteai solution.

.DESCRIPTION
    Scans the dendwriteai solution for outdated NuGet packages and optionally
    updates them interactively. Uses the dotnet-outdated-tool for cross-platform
    compatibility.

    Requires: dotnet outdated tool
    Install: dotnet tool install -g dotnet-outdated-tool

.PARAMETER Interactive
    If set, prompts to update packages interactively after showing what's outdated.
    Without this flag, only displays outdated packages (read-only).

.PARAMETER Force
    Skips the tool installation check and attempts to run directly.

.EXAMPLE
    .\scripts\check-updates.ps1
    # Shows what packages are outdated

    .\scripts\check-updates.ps1 -Interactive
    # Shows outdated packages and prompts to update

.NOTES
    Author: Automated setup
    Date: 2026-01-13
    Part of: dendwriteai MVP scaffold
#>

param(
    [switch]$Interactive = $false,
    [switch]$Force = $false
)

$ErrorActionPreference = "Stop"

# Configuration
$solutionRoot = Split-Path -Parent $PSScriptRoot
$projectDir = $solutionRoot

Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   NuGet Package Update Checker             ║" -ForegroundColor Cyan
Write-Host "║   dendwriteai Solution                 ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "Solution root: $solutionRoot" -ForegroundColor Gray
Write-Host ""

# Check if solution exists by looking for csproj files
$csprojFiles = @(Get-ChildItem -Path $solutionRoot -Filter "*.csproj" -Recurse -ErrorAction SilentlyContinue)
if ($csprojFiles.Count -eq 0) {
    Write-Host "❌ Error: No .csproj files found in $solutionRoot" -ForegroundColor Red
    exit 1
}

# Check if dotnet-outdated tool is installed (unless -Force)
if (-not $Force) {
    Write-Host "[1/3] Checking for dotnet-outdated tool..." -ForegroundColor Yellow
    
    $toolCheck = & dotnet tool list -g 2>&1 | Select-String "dotnet-outdated"
    
    if (-not $toolCheck) {
        Write-Host "⚠️  dotnet-outdated tool not found." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Installing dotnet-outdated-tool (one-time setup)..." -ForegroundColor Cyan
        Write-Host "   Command: dotnet tool install -g dotnet-outdated-tool" -ForegroundColor Gray
        Write-Host ""
        
        try {
            & dotnet tool install -g dotnet-outdated-tool --verbosity minimal
            Write-Host "✅ Tool installed successfully" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Failed to install dotnet-outdated-tool" -ForegroundColor Red
            Write-Host "   Please run manually: dotnet tool install -g dotnet-outdated-tool" -ForegroundColor Yellow
            exit 1
        }
    }
    else {
        Write-Host "✅ dotnet-outdated tool is installed" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "[2/3] Checking for outdated packages..." -ForegroundColor Yellow
Write-Host ""

# Run dotnet outdated on each project
$hasErrors = $false
foreach ($csprojFile in $csprojFiles) {
    Write-Host "Project: $($csprojFile.Name)" -ForegroundColor Cyan
    Write-Host "---" -ForegroundColor Gray
    
    try {
        & dotnet outdated $csprojFile.FullName
    }
    catch {
        Write-Host "⚠️  Failed to check $($csprojFile.Name)" -ForegroundColor Yellow
        $hasErrors = $true
    }
    
    Write-Host ""
}

if ($hasErrors) {
    Write-Host "⚠️  Some projects could not be checked" -ForegroundColor Yellow
}

Write-Host ""

# Interactive update if requested
if ($Interactive) {
    Write-Host "[3/3] Interactive update mode" -ForegroundColor Yellow
    Write-Host ""
    
    $response = Read-Host "Update packages interactively? (y/n)"
    
    if ($response -eq "y" -or $response -eq "yes") {
        Write-Host ""
        Write-Host "Starting interactive package update..." -ForegroundColor Cyan
        Write-Host "   Follow the prompts to update each package" -ForegroundColor Gray
        Write-Host ""
        
        try {
            & dotnet package update --interactive --root-path $solutionRoot
            Write-Host ""
            Write-Host "✅ Package update completed" -ForegroundColor Green
            Write-Host ""
            Write-Host "💡 Next steps:" -ForegroundColor Cyan
            Write-Host "   1. Review changes: git diff" -ForegroundColor Gray
            Write-Host "   2. Build solution: dotnet build dendwriteai.slnx" -ForegroundColor Gray
            Write-Host "   3. Run tests: dotnet test dendwriteai.Tests" -ForegroundColor Gray
            Write-Host "   4. Commit if successful: git commit -m 'Update NuGet packages'" -ForegroundColor Gray
        }
        catch {
            Write-Host "❌ Failed to update packages" -ForegroundColor Red
            Write-Host "   Error: $_" -ForegroundColor Yellow
            exit 1
        }
    }
    else {
        Write-Host "Skipped interactive update" -ForegroundColor Gray
    }
}
else {
    Write-Host "ℹ️  Run with -Interactive flag to update packages:" -ForegroundColor Cyan
    Write-Host "   .\scripts\check-updates.ps1 -Interactive" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Or use dotnet CLI directly:" -ForegroundColor Cyan
    Write-Host "   dotnet package update              # Update all in project" -ForegroundColor Gray
    Write-Host "   dotnet add package Name --version X.Y.Z  # Update specific" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ Check complete" -ForegroundColor Green
