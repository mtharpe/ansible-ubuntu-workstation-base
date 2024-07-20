# -*- mode: ruby -*-
# vi: set ft=ruby :

MACHINE_NAME = 'ubuntu-22'.freeze
ANSIBLE_PATH = '/vagrant'.freeze
ANSIBLE_PLAYBOOK = 'setup_workstation.yml'.freeze

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
    v.check_guest_additions = false
  end

  if Vagrant.has_plugin?("vagrant-vbguest") then
    config.vbguest.auto_update = false
  end

  config.vm.provision 'ansible_local' do |ansible|
    ansible.playbook = "#{ANSIBLE_PATH}/#{ANSIBLE_PLAYBOOK}"
    ansible.verbose = false 
  end
end
