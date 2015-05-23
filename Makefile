BABEL_CMD=node node_modules/babel/bin/babel --copy-files --source-maps inline --optional es7.exportExtensions
SRC_DIR=src
TEST_DIR=tests

SRC_OUT_DIR=lib
TEST_OUT_DIR=lib/tests


.PHONY: build watch-build clean-build test

build: clean-build build-core build-tests

build-core:
	$(BABEL_CMD) $(SRC_DIR)  --out-dir $(SRC_OUT_DIR)

build-tests:
	$(BABEL_CMD) $(TEST_DIR) --out-dir $(TEST_OUT_DIR)

watch-build: clean-build
	$(BABEL_CMD) $(SRC_DIR)  --out-dir $(SRC_OUT_DIR)  --watch &
	$(BABEL_CMD) $(TEST_DIR) --out-dir $(TEST_OUT_DIR) --watch

github-deploy:
	git checkout built
	git checkout master -- package.json src Makefile
	npm install --verbose --force
	npm install babel-core
	make build-core
	npm install webpack
	node_modules/.bin/webpack lib/index.js lib/bundle.js
	rm -r node_modules src Makefile
	git add -A
	git commit -m "Updating built branch: built from $$(git rev-parse --short --verify master) [skip ci]"
	- git push

clean-build:
	rm -rf lib

test:
	mocha $(TEST_OUT_DIR)/index.js