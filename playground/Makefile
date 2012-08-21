# Simple make file the intent
# is that web assets is bundled with
# some kind of build step where we can
# swap out relevant files in a idempotent way.
# In some cases we might swap out the js as well
# in that case we should have some dev or vendor folder...
all:
ifeq ($(DEBUG),1)
	rm -f style.css app.js
	touch style.css
	cp dev/web_assets.js app.js
else
	rm -f app.js style.css
	@# Obviously there could be issues where the remote server
	@# is down and you want to check your new assets in
	@# this can be handled by bundling building blocks in gaia
	@# and using httpd to server a static copy....
	../bin/web_assets install $(PWD)
endif
