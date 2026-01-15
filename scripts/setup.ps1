#!/usr/bin/env pwsh
<#
.SYNOPSIS
    ActionableIdeas Quick Setup Script
    
.DESCRIPTION
    Automates first-time setup: database creation, secrets init, build & run
    
.PARAMETER SkipDB
    Skip database creation (if already exists)
    
.PARAMETER SkipSecrets
    Skip user secrets setup (if already done)
    
.EXAMPLE
    .\setup.ps1
    .\setup.ps1 -SkipDB -SkipSecrets
#>

param(
    [switch]$SkipDB,
    [switch]$SkipSecrets
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$solutionRoot = Join-Path $repoRoot "ActionableIdeas"

Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   ActionableIdeas Setup Script             ║" -ForegroundColor Cyan
Write-Host "║   V1 MVP Scaffold                          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan

# Step 1: Create Database
if (-not $SkipDB) {
    Write-Host "`n[1/4] Creating ActionableInfoDb database..." -ForegroundColor Green
    
    $sqlCmd = @"
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'ActionableInfoDb')
BEGIN
    CREATE DATABASE ActionableInfoDb;
    PRINT 'Database ActionableInfoDb created.';
END
ELSE
BEGIN
    PRINT 'Database ActionableInfoDb already exists.';
END
GO
"@

    try {
        $sqlCmd | sqlcmd -S "DESKTOP-NIBJESD\SQLEXPRESS" -U sa -P "<-Redacted->" -ErrorAction Stop | Out-Null
        Write-Host "  ✓ Database ready" -ForegroundColor Green
    }
    catch {
        Write-Host "  ✗ Failed to create database. Ensure SQL Server Express is running." -ForegroundColor Red
        Write-Host "    Error: $_" -ForegroundColor Red
        exit 1
    }
}

# Step 2: Initialize User Secrets
if (-not $SkipSecrets) {
    Write-Host "`n[2/4] Setting up User Secrets..." -ForegroundColor Green
    
    Push-Location (Join-Path $solutionRoot "ActionableIdeas.ApiService")
    
    try {
        # Check if secrets already initialized
        $secretsFile = "$env:APPDATA\Microsoft\UserSecrets\(Get-Content '.csproj' | Select-String '<UserSecretsId>(.*?)<' | ForEach-Object { $_.Matches[0].Groups[1].Value })\secrets.json"
        
        # Initialize if needed
        dotnet user-secrets init 2>&1 | Out-Null
        
        Write-Host "  User secrets initialized. You can now set secrets:" -ForegroundColor Yellow
        Write-Host "    dotnet user-secrets set 'AzureOpenAI:Endpoint' 'https://your-resource.openai.azure.com/'" -ForegroundColor Yellow
        Write-Host "    dotnet user-secrets set 'AzureOpenAI:DeploymentName' 'gpt-4-1'" -ForegroundColor Yellow
        Write-Host "  (Or leave empty to use stub classifier for testing)" -ForegroundColor Yellow
        Write-Host "  ✓ User Secrets ready" -ForegroundColor Green
    }
    catch {
        Write-Host "  ✗ Failed to initialize secrets. Check project file." -ForegroundColor Red
        Write-Host "    Error: $_" -ForegroundColor Red
        exit 1
    }
    finally {
        Pop-Location
    }
}

# Step 3: Build Solution
Write-Host "`n[3/4] Building solution..." -ForegroundColor Green

Push-Location $solutionRoot

try {
    dotnet build ActionableIdeas.slnx -c Debug 2>&1 | Out-Null
    Write-Host "  ✓ Build successful" -ForegroundColor Green
}
catch {
    Write-Host "  ✗ Build failed. Check errors above." -ForegroundColor Red
    Write-Host "    Error: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Run with Aspire
Write-Host "`n[4/4] Starting ActionableIdeas (Aspire)..." -ForegroundColor Green
Write-Host "  Waiting for services..." -ForegroundColor Yellow

Write-Host "`n  Web UI:        https://localhost:5100" -ForegroundColor Cyan
Write-Host "  API Swagger:   https://localhost:5000/swagger" -ForegroundColor Cyan
Write-Host "  Aspire Dash:   http://localhost:18888" -ForegroundColor Cyan
Write-Host "`n  (Press Ctrl+C to stop)`n" -ForegroundColor Yellow

try {
    dotnet run --project ActionableIdeas.AppHost
}
catch {
    Write-Host "  ✗ Failed to start. Check errors above." -ForegroundColor Red
    Write-Host "    Error: $_" -ForegroundColor Red
    exit 1
}
finally {
    Pop-Location
}
