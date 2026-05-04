[![CircleCI](https://circleci.com/gh/mtharpe/ansible-ubuntu-workstation-base/tree/main.svg?style=svg)](https://circleci.com/gh/mtharpe/ansible-ubuntu-workstation-base/tree/main)

# Ubuntu Workstation Base

Ansible playbook and role collection that automates the setup of an **Ubuntu 24.04+** GNOME workstation for development and daily use.

## What this does

Configures an Ubuntu workstation with:

- **Common packages** — developer tooling, fonts, multimedia codecs, system utilities (`roles/common`)
- **Third-party apps** — Chrome, VS Code, Slack, Zoom, Docker, etc., gated by feature flags (`roles/third-party`). Each install removes any conflicting snap of the same package first, so the apt/deb version is the one that runs.
- **GNOME settings** — sensible dconf defaults, dark theme, workspace layout (`roles/gnome`)
- **Shell setup** — bash or fish with TPM, Starship, FiraCode Nerd Font (toggle in `vars/vars.yml`)
- **Hardening** — sshd config, fail2ban, ufw desktop firewall (opt-in)

## Requirements

- Ubuntu 24.04 or newer
- A user account with sudo access
- Internet access for package installs

## Quick start

1. Clone the repository:

   ```sh
   git clone https://github.com/mtharpe/ansible-ubuntu-workstation-base.git
   cd ansible-ubuntu-workstation-base
   ```

2. Edit `vars/vars.yml` to set your `local_user` and toggle features:

   ```yaml
   local_user: yourusername
   install_chrome: true
   install_vscode: true
   install_fish: true
   ```

3. Run the bootstrap script (installs Ansible if missing, applies the playbook):

   ```sh
   ./run.sh
   ```

   Or invoke ansible directly:

   ```sh
   sudo apt-get update && sudo apt-get install -y ansible
   ansible-playbook --extra-vars "local_user=$USER" setup_workstation.yml
   ```

## Feature flags

All toggles live in `vars/vars.yml`. The most useful ones:

| Flag | Default | What it controls |
|------|---------|------------------|
| `install_chrome` | `true` | Google Chrome browser |
| `install_vscode` | `true` | Visual Studio Code |
| `install_slack` | `true` | Slack desktop client |
| `install_zoom` | `true` | Zoom client |
| `install_docker` | `false` | docker.io + docker-compose (otherwise podman is the default) |
| `install_gcloud` | `false` | Google Cloud SDK + kubectl |
| `install_ansible` | `false` | Ansible (apt) for running playbooks locally |
| `install_claude` | `true` | Claude Code CLI (official installer to `~/.local/bin`) |
| `install_kubectl` | `true` | kubectl from the official Kubernetes apt repo (`pkgs.k8s.io`) |
| `install_multipass` | `true` | Multipass via snap (snap is the only Linux distribution channel) |
| `install_fish` | `true` | Fish shell + Pure prompt + Fisher |
| `install_bash` | `false` | Bash dotfiles |
| `install_nerd_font` | `true` | FiraCode Nerd Font for prompts/icons |
| `install_eza` | `true` | `eza` (modern `ls` replacement) |
| `enable_sshd` | `false` | Enable and harden sshd |
| `enable_fail2ban` | `true` | Enable fail2ban with desktop-friendly defaults |

## Testing with Molecule

Two Molecule scenarios converge the playbook against a containerized Ubuntu 24.04. The role detects `is_container` from `ansible_facts['virtualization_type']` and skips the `gnome` role plus any task that would try to start systemd services (ssh, fail2ban, docker) or hit netfilter (ufw), so container runs stay fast and don't fail on operations that aren't possible in an unprivileged container.

```sh
make test-podman          # full create/converge/idempotence/verify on podman
make test-docker          # same on docker
make syntax-podman        # parse-only check
make idempotence-podman   # converge twice, expect zero changes the second time
```

## Linting and CI

CircleCI runs four checks on every push (see `.circleci/config.yml`):

- `ansible-lint` — playbook & role linting
- `yamllint` — YAML quality
- `ansible-playbook --syntax-check` — playbook parses
- `shellcheck` — shell scripts

Run them locally:

```sh
ansible-lint .
yamllint .
shellcheck run.sh
ansible-playbook --syntax-check setup_workstation.yml
```

## Customization

- Add/remove packages: `roles/common/tasks/packages.yml`
- System tweaks: `roles/common/tasks/system.yml` and `roles/common/tasks/harden.yml`
- Drop dotfiles into `templates/` and reference them from a role task
- Snap-conflict removal: include `roles/third-party/tasks/remove-snap.yml` from any new install task and pass `snap_names: [<name>, ...]` — it's a no-op if snapd isn't present or the snap isn't installed

## Related

- [`ansible-fedora-workstation-base`](https://github.com/mtharpe/ansible-fedora-workstation-base) — Fedora 43+
- [`ansible-ubuntu-workstation-base`](https://github.com/mtharpe/ansible-ubuntu-workstation-base) — Ubuntu 24.04+ (this repo)
- [`ansible-manjaro-workstation-base`](https://github.com/mtharpe/ansible-manjaro-workstation-base) — Manjaro/Arch

## License

MIT License. See [LICENSE](LICENSE) for details.
