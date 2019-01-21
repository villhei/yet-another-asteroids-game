#!/bin/bash
set -e

# .gitignore
# .prettierrc
# tsconfig.json
# tslint.json
#

npm init
npm install --save-dev typescript tslint tslint-config-airbnb-base tslint-react tslint-config-prettier typestrict parcel-bundler
mkdir src