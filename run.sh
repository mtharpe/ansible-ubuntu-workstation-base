#!/bin/bash
ansible=`which ansible`

if [ -z "$ansible" ]; then
 sudo apt install ansible -y
fi

if [ ! -f "/etc/sudoers/${USER}" ]; then
  echo "${USER} ALL=(ALL) NOPASSWD: ALL" | sudo tee -a /etc/sudoers.d/${USER}
fi

if [ -z "$ansible" ]; then
 sudo dnf install ansible -y
fi

until ansible-playbook --extra-vars "local_user=${USER}" setup_workstation.yml; do
  echo Ansible run disrupted, retrying in 10 seconds...
  sleep 10
done

sudo rm -f /etc/sudoers.d/${USER}