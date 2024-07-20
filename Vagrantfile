# -*- mode: ruby -*-
# vi: set ft=ruby :

MACHINE_NAME = 'ubuntu-22'.freeze

Vagrant.configure(2) do |config|
  config.vm.box = 'generic/ubuntu2204'
  config.vm.synced_folder '.', '/vagrant', disabled: false
  config.vm.network :private_network, auto_network: true
  config.vm.hostname = MACHINE_NAME
  config.hostmanager.enabled = true
  config.hostmanager.manage_host = true
  config.hostmanager.manage_guest = true
  config.hostmanager.ignore_private_ip = false
  config.hostmanager.include_offline = true

  config.vm.provider 'virtualbox' do |v|
    v.gui = false
    v.name = MACHINE_NAME
    v.cpus = 1
    v.memory = 4096
    v.linked_clone = false
    config.vm.box_check_update = false
    v.check_guest_additions = false
    v.customize ['modifyvm', :id, '--clipboard', 'bidirectional']
    v.customize ['modifyvm', :id, '--draganddrop', 'bidirectional']
  end
  
  config.vm.provision 'shell', inline: <<-SHELL
    sudo apt-get update
    sudo apt-get install -y software-properties-common
    sudo apt-add-repository --yes --update ppa:ansible/ansible
    sudo apt-get update
    sudo apt-get install -y ubuntu-gnome-desktop ansible
    ansible-playbook /vagrant/setup_workstation.yml
  SHELL
end
