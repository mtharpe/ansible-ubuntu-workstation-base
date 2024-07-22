[![CircleCI](https://dl.circleci.com/status-badge/img/gh/mtharpe/ansible-fedora-workstation-base/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/mtharpe/ansible-fedora-workstation-base/tree/main)

# Ansible Ubuntu Workstation Base

This Ansible playbook is designed to set up a base configuration for an Ubuntu workstation. It automates the installation and configuration of common software and tools that are typically used in a development environment.

## Prerequisites

Before running this playbook, ensure that you have the following:

- An Ubuntu workstation with SSH access
- Ansible installed on your local machine

## Usage

1. Clone this repository to your local machine.
2. Update the `hosts` file with the IP address or hostname of your Ubuntu workstation.
3. Customize the variables in the `vars/main.yml` file to fit your requirements.
4. Run the playbook using the following command:

```shell
ansible-playbook -i hosts main.yml
```

## Features

- Installs and configures essential packages such as Git, Vim, and Docker.
- Sets up a basic development environment with Node.js, Python, and Ruby.
- Configures the system with common development tools like Visual Studio Code and Postman.
- Applies security configurations and hardening measures.

## Customization

You can customize the playbook by modifying the variables in the `vars/main.yml` file. This allows you to specify different versions of software, additional packages to install, or any other specific configurations you require.

## Contributing

Contributions are welcome! If you have any suggestions, bug reports, or feature requests, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
