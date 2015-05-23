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

github-setup-deploy:
	git checkout built
	git checkout master -- package.json src Makefile
	npm install
	make build-core
	npm install webpack
	node_modules/.bin/webpack lib/index.js lib/bundle.js
	rm -r node_modules src
	git add -A
	git rm --cached Makefile

github-deploy:
	if !(test `git rev-parse --abbrev-ref HEAD` = "built"); then echo "Please run 'make github-setup-deploy'" 1>&2 ; exit 1; fi
	rm Makefile
	git commit -m "Updating built branch: built from master@$$(git rev-parse --verify master) [skip ci]"
	git push

clean-build:
	rm -rf lib

test:
	mocha $(TEST_OUT_DIR)/index.js