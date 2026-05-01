#!/usr/bin/fish
alias --save ls='exa -l '
alias --save tree='exa -T'
alias --save c='clear'
alias --save grub_update='update-grub'
alias --save vi="nvim"                        
alias --save vim="nvim"             
alias --save sum="shasum -a 256 $1"
alias --save ssh_keygen="ssh-keygen -b 4096 -C `date +%Y-%m-%d` "                                      
alias --save git_all="printf "\\\\n" && find . -maxdepth 4 -type d -name \".git\" -execdir python -c 'import os; from termcolor import colored, cprint; cprint(colored(os.path.abspath(\".\"), \"blue\"))' \; -execdir git pull \;"
alias --save gssh="gcloud beta compute ssh "
