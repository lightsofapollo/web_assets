REPORTER=Spec
WEB_FILE=web_assets.js
VENDOR=./vendor/
LIB_ROOT=./lib/web_assets/

.PHONY: package
JS_ASSETS=lib/web_assets/index.js \
					lib/web_assets/config.js \
					lib/web_assets/loader.js \
					lib/web_assets/dom_queue.js

package: test-agent-config
	mkdir -p $(VENDOR)
	rm -f $(WEB_FILE)
	touch $(WEB_FILE)
	cp ./node_modules/mocha/mocha.js $(VENDOR)
	cp ./node_modules/mocha/mocha.css $(VENDOR)
	cp ./node_modules/chai/chai.js $(VENDOR)
	cp ./node_modules/test-agent/test-agent.js $(VENDOR)
	cp ./node_modules/test-agent/test-agent.css $(VENDOR)

	cat $(JS_ASSETS) >> $(WEB_FILE)

TEST_AGENT_CONFIG=./test-agent/config.json
test-agent-config:
	@rm -f $(TEST_AGENT_CONFIG)
	@touch $(TEST_AGENT_CONFIG)
	@rm -f /tmp/test-agent-config;
	# Build json array of all test files
	for d in test; \
	do \
		find $$d -name '*_test.js' | sed "s:$$d/:/$$d/:g"  >> /tmp/test-agent-config; \
	done;
	@echo '{"tests": [' >> $(TEST_AGENT_CONFIG)

	@cat /tmp/test-agent-config |  \
		sed 's:\(.*\):"\1":' | \
		sed -e ':a' -e 'N' -e '$$!ba' -e 's/\n/,\
	/g' >> $(TEST_AGENT_CONFIG);
	@echo '  ]}' >> $(TEST_AGENT_CONFIG);
	@echo "Built test ui config file: $(TEST_AGENT_CONFIG)"
	#@rm -f /tmp/test-agent-config

.PHONY: test-server
test-server:
	./node_modules/test-agent/bin/js-test-agent server --growl

.PHONY: test-node
test-node:
	@echo "Node support comming soon."
	@exit 1;

	./node_modules/mocha/bin/mocha \
		--ui tdd \
		--reporter $(REPORTER) \
		--growl \
		test/web_assets/build/helper.js test/web_assets/build/*_test.js

.PHONY: test-xpc
TESTS=`find test/web_assets/build -name '*_test.js'`
test-xpc:
	@PATH=$(PWD)/node_modules/xpcwindow/bin:$(PATH)

	./node_modules/xpcwindow/bin/xpcwindow-mocha \
		--ui tdd \
		--reporter $(REPORTER) \
		test/web_assets/build/helper.js $(TESTS)

.PHONY: watch
FILES=
watch:
	./node_modules/mocha/bin/mocha \
		--ui tdd \
		--reporter $(REPORTER) \
		--watch \
		--growl \
		test/build/helper.js $(FILES)

.PHONY: test-browser
test-browser:
	./node_modules/test-agent/bin/js-test-agent test
