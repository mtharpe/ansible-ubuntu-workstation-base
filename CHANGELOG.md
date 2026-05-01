# Changelog

## Unreleased
- Convert role layout to mirror `ansible-fedora-workstation-base` (top-level `templates/`, `handlers/`, `meta/`, `molecule/`, `Makefile`)
- Translate Fedora-specific tooling to Ubuntu equivalents: `dnf`→`apt`, `yum_repository`/`rpm_key`→`apt_repository`/`apt_key`, `wheel`→`sudo`, `sshd`→`ssh`, `firewalld`→`ufw`
- Pin Molecule image to `ubuntu:24.04`
- Introduce `ubuntu_version` variable in `vars/vars.yml` for easier future bumps
- Drop WSL playbook/role/wsl.sh, Vagrantfile, scaffolding `template.yml`, and unused `configuration` role
