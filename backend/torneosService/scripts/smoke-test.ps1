param(
  [string]$BaseUrl = "http://localhost:3005"
)

$ErrorActionPreference = "Stop"

function Invoke-JsonPost($Path, $Body) {
  Invoke-RestMethod `
    -Uri "$BaseUrl$Path" `
    -Method Post `
    -ContentType "application/json" `
    -Body ($Body | ConvertTo-Json)
}

Write-Host "Probando API en $BaseUrl"

$suffix = Get-Random
$carnet = 100000 + (Get-Random -Maximum 899999)
$registered = Invoke-JsonPost "/auth/register" @{
  nombre = "Smoke"
  apellido = "Test"
  carnet = "$carnet"
  email = "smoke$suffix@ucb.edu.bo"
  celular = "70000000"
  password = "test123"
}

Write-Host "OK auth/register"

$registeredLogin = Invoke-JsonPost "/auth/login" @{
  email = $registered.email
  password = "test123"
}

if (-not $registeredLogin.access_token) {
  throw "Login no devolvio access_token"
}

Write-Host "OK auth/login"

if ($registeredLogin.usuario.roles -notcontains "JUGADOR") {
  throw "El usuario registrado no recibio rol JUGADOR"
}

Write-Host "OK rol por defecto"

$cancha = Invoke-JsonPost "/cancha" @{
  nombre = "Cancha Smoke $suffix"
  ubicacion = "Campus"
  capacidad = 20
  tipo_superficie = "Cesped"
  estado = "disponible"
}

Write-Host "OK cancha"

$reserva = Invoke-JsonPost "/reserva" @{
  cancha_id = $cancha.id
  fecha = "2026-05-12"
  hora_inicio = "10:00"
  hora_fin = "11:00"
  estado = "pendiente"
}

Write-Host "OK reserva"

$torneo = Invoke-JsonPost "/torneo" @{
  nombre = "Torneo Smoke $suffix"
  tipo = "Interno"
  disciplina_id = 1
}

$equipo = Invoke-JsonPost "/equipo" @{
  nombre_equipo = "Equipo Smoke Local $suffix"
  carrera_id = 1
  disciplina_id = 1
}

$equipoVisitante = Invoke-JsonPost "/equipo" @{
  nombre_equipo = "Equipo Smoke Visitante $suffix"
  carrera_id = 1
  disciplina_id = 1
}

$fixture = Invoke-JsonPost "/fixture" @{
  torneo_id = $torneo.id
  ronda = 1
  equipo_local_id = $equipo.id
  equipo_visitante_id = $equipoVisitante.id
  fecha_hora = "2026-05-12T20:00:00"
  estadio = "Cancha Smoke"
}

Write-Host "OK torneo/equipo/fixture"

Invoke-RestMethod -Uri "$BaseUrl/fixture/$($fixture.id)" -Method Delete | Out-Null
Invoke-RestMethod -Uri "$BaseUrl/equipo/$($equipoVisitante.id)" -Method Delete | Out-Null
Invoke-RestMethod -Uri "$BaseUrl/equipo/$($equipo.id)" -Method Delete | Out-Null
Invoke-RestMethod -Uri "$BaseUrl/torneo/$($torneo.id)" -Method Delete | Out-Null
Invoke-RestMethod -Uri "$BaseUrl/reserva/$($reserva.id)" -Method Delete | Out-Null
Invoke-RestMethod -Uri "$BaseUrl/cancha/$($cancha.id)" -Method Delete | Out-Null
Invoke-RestMethod -Uri "$BaseUrl/persona/$($registered.id)" -Method Delete | Out-Null

Write-Host "Smoke test completo: OK"
