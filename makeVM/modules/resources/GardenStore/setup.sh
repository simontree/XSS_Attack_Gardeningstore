#!/usr/bin/env bash

DB_PW='Its4321?!'

# Install Packages
printf '\n--Install packs\n'
apt-get update -y
apt-get install -y mariadb-server
apt-get install -y curl
curl -sL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Setup Database Backend
printf "\n--Setup database\n" 
cd backend/Database
mysql << EOF
create database sys;
create user mario@localhost identified by 'Its4321?!';
grant all privileges on sys.* to mario@localhost;
flush privileges;
EOF

printf "\n--Fill DB\n"
mysql --password=$DB_PW sys < create_tables.sql
mysql --password=$DB_PW sys < INSERT_products_users.sql
#CREATES KEY ERROR:
#mysql --password=$DB_PW sys < INSERT_comments.sql

# Install dependencies 
printf "\n--Install dependencies\n"
cd ..
npm i
cd ../frontend
npm i

# Start Servers
printf "\n--Start Server Backend\n"
cd ../backend
npm run start

#printf "\n--Start Server Frontend\n"
#cd ../frontend
#npm run start &

printf '\n--GardenStore is up.\n'