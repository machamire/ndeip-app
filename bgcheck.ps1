# Find background processes and services that could be stopped
Write-Output "=== BACKGROUND PROCESSES USING CPU/RAM ==="
Write-Output "(Excluding system-critical and Antigravity processes)"
Write-Output ""

$exclude = @("System", "Idle", "svchost", "csrss", "wininit", "winlogon", "lsass", 
    "smss", "services", "dwm", "explorer", "Antigravity", "language_server_windows_x64",
    "conhost", "RuntimeBroker", "dllhost", "taskhostw", "sihost", "fontdrvhost",
    "WmiPrvSE", "SearchHost", "StartMenuExperienceHost", "ShellExperienceHost",
    "TextInputHost", "ctfmon", "SecurityHealthSystray", "RtkAudUService64",
    "chrome", "powershell", "cmd")

Get-Process | Where-Object { $exclude -notcontains $_.ProcessName } | 
Sort-Object WorkingSet64 -Descending | 
Select-Object -First 30 | ForEach-Object {
    $memMB = [math]::Round($_.WorkingSet64 / 1MB, 1)
    $cpuTime = [math]::Round($_.CPU, 1)
    $desc = $_.Description
    if (-not $desc) { $desc = "No description" }
    Write-Output "${memMB} MB | CPU: ${cpuTime}s | $($_.ProcessName) | $desc"
}

Write-Output ""
Write-Output "=== STARTUP ITEMS (Task Manager startup tab) ==="
Get-CimInstance Win32_StartupCommand | ForEach-Object {
    Write-Output "Name: $($_.Name) | Command: $($_.Command) | Location: $($_.Location)"
}

Write-Output ""
Write-Output "=== NON-MICROSOFT SERVICES RUNNING ==="
Get-Service | Where-Object { $_.Status -eq 'Running' } | ForEach-Object {
    $svc = Get-CimInstance Win32_Service -Filter "Name='$($_.Name)'" -ErrorAction SilentlyContinue
    if ($svc -and $svc.PathName -and $svc.PathName -notlike "*Windows*" -and $svc.PathName -notlike "*Microsoft*" -and $svc.PathName -notlike "*system32*" -and $svc.PathName -notlike "*SysWOW64*") {
        Write-Output "Service: $($_.DisplayName) | Name: $($_.Name) | StartType: $($_.StartType) | Path: $($svc.PathName)"
    }
}

Write-Output ""
Write-Output "=== SCHEDULED TASKS (non-Microsoft, enabled) ==="
Get-ScheduledTask | Where-Object { $_.State -ne 'Disabled' -and $_.Author -and $_.Author -notlike "*Microsoft*" } | Select-Object -First 20 | ForEach-Object {
    Write-Output "Task: $($_.TaskName) | Author: $($_.Author) | State: $($_.State)"
}
