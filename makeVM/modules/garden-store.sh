#!/usr/bin/env bash

USER_DIR_NAME="mario"

vboxmanage modifyvm ${VMNAME} --natpf1 "GardenStore,tcp,,3000,,3000"
vboxmanage modifyvm ${VMNAME} --natpf1 "GardenStoreBackend,tcp,,8000,,8000"
vboxmanage modifyvm ${VMNAME} --natpf1 "GardenStoreSQL,tcp,,3306,,3306"
vboxmanage startvm ${VMNAME} --type headless
echo "Waiting for VM to come up..."
sleep 8

scp -P 2200 -i ${TMPDIR}/rootkey -r modules/resources/GardenStore/ root@127.0.0.1:/home/${USER_DIR_NAME}
ssh -p 2200 -i ${TMPDIR}/rootkey root@127.0.0.1 "cd /home/${USER_DIR_NAME}/GardenStore && bash setup.sh"
