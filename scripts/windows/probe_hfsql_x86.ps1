param([Parameter(Mandatory=$true)][string]$Dsn, [string]$TablesFile)
$ErrorActionPreference = 'Stop'
$connection = New-Object System.Data.Odbc.OdbcConnection("DSN=$Dsn")
try {
    $connection.Open()
    Write-Output "Connected: $([IntPtr]::Size * 8)-bit; driver=$($connection.Driver)"
    if ($TablesFile) {
        $names = Get-Content -LiteralPath $TablesFile -Raw | ConvertFrom-Json
    } else {
        $tables = $connection.GetSchema('Tables')
        $names = @($tables.Rows | Where-Object { $_.TABLE_TYPE -eq 'TABLE' } | ForEach-Object { $_.TABLE_NAME })
    }
    Write-Output "Tables=$($names.Count)"
    foreach ($name in $names) {
        $command = $connection.CreateCommand()
        $command.CommandText = 'SELECT COUNT(*) FROM "' + $name.Replace('"','""') + '"'
        Write-Output "$name=$($command.ExecuteScalar())"
        $command.Dispose()
    }
} finally { $connection.Dispose() }
