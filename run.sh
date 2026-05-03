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

if ! command -v ansible-lint >/dev/null 2>&1; then
  pipx install ansible-lint
fi

if ! command -v yamllint >/dev/null 2>&1; then
  pipx install yamllint
fi

if ! command -v molecule >/dev/null 2>&1; then
  pipx install --include-deps molecule
  pipx inject molecule 'molecule-plugins[docker]'
fi

# Ubuntu's apt-shipped ansible.posix is too old and emits a `to_native`
# deprecation on every sysctl task. Pull the pinned versions from Galaxy.
ansible-galaxy collection install -r requirements.yml --upgrade

SUDOERS_DROPIN="/etc/sudoers.d/${USER}"
if [ ! -f "${SUDOERS_DROPIN}" ]; then
  echo "${USER} ALL=(ALL) NOPASSWD: ALL" | sudo tee -a "${SUDOERS_DROPIN}"
fi

until ansible-playbook --extra-vars "local_user=${USER}" setup_workstation.yml; do
  echo "Ansible run disrupted, retrying in 10 seconds..."
  sleep 10
done

sudo rm -f "${SUDOERS_DROPIN}"
