#!/bin/bash

# run create/update migration scripts
echo "create-if-not-exist database"
node node db-migrate db:create brainly -e dev --config ./database/database.json
echo "finished create-if-not-exist database"

echo "update database"
node ./node_modules/db-migrate/bin/db-migrate up -e dev --config ./database/database.json -m ./database/migrations
echo "finished update database"

# run node app
echo "running node app"
# ./node_modules/.bin/nodemon app.js
node app.js
