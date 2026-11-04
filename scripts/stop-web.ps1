Get-CimInstance Win32_Process -Filter "name='node.exe'" |
  Where-Object { $_.CommandLine -like "*next start*" -or $_.CommandLine -like "*next-server*" -or $_.CommandLine -like "*next\dist\bin\next*" } |
  ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
    "stopped next pid $($_.ProcessId)"
  }
