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

clean-build:
	rm -rf lib

test:
	mocha $(TEST_OUT_DIR)/index.js
