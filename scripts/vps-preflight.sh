#!/usr/bin/env bash
set -eu

printf '\nVaidora VPS preflight (read only)\n'
printf 'User: '
id -un
printf 'Architecture: '
uname -m
printf 'CPU cores: '
getconf _NPROCESSORS_ONLN
printf '\nOperating system\n'
if [ -r /etc/os-release ]; then
  sed -n '/^PRETTY_NAME=/p' /etc/os-release
fi
printf '\nMemory\n'
free -h
printf '\nDisk\n'
df -h / /opt 2>/dev/null || df -h /
printf '\nInstalled tools\n'
for tool in git node docker nginx caddy; do
  if command -v "$tool" >/dev/null 2>&1; then
    printf '%s: %s\n' "$tool" "$(command -v "$tool")"
  fi
done
if command -v docker >/dev/null 2>&1; then
  docker version --format 'Docker server: {{.Server.Version}}' 2>/dev/null || printf 'Docker daemon unavailable to this user.\n'
  docker compose version 2>/dev/null || true
  printf '\nExisting containers (names, status and ports only)\n'
  docker ps --format '{{.Names}} | {{.Status}} | {{.Ports}}' 2>/dev/null || true
fi
printf '\nListening TCP ports\n'
if command -v ss >/dev/null 2>&1; then
  ss -ltn
fi
printf '\nExisting Vaidora directories\n'
for directory in /opt/vaidora /srv/vaidora; do
  if [ -d "$directory" ]; then
    printf '%s already exists; inspect before installation.\n' "$directory"
  fi
done
