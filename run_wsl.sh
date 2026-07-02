#!/bin/bash
set -euo pipefail

if ! command -v pipx >/dev/null 2>&1; then
  sudo apt-get update
  sudo apt-get install -y pipx
fi

export PATH="${HOME}/.local/bin:${PATH}"

if ! command -v ansible >/dev/null 2>&1; then
  pipx install --include-deps ansible
fi

ansible-galaxy collection install -r requirements.yml --upgrade

SUDOERS_DROPIN="/etc/sudoers.d/${USER}"
if [ ! -f "${SUDOERS_DROPIN}" ]; then
  echo "${USER} ALL=(ALL) NOPASSWD: ALL" | sudo tee -a "${SUDOERS_DROPIN}"
fi

until ansible-playbook --extra-vars "local_user=${USER}" setup_wsl.yml; do
  echo "Ansible run disrupted, retrying in 10 seconds..."
  sleep 10
done

sudo rm -f "${SUDOERS_DROPIN}"
