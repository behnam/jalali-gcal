
VERSION=3.9

all: editions
#all: dev

editions:
	cat jalali-gcal.user.js | sed 's/{VERSION}/${VERSION}/'	| sed 's/{EDITION}/Persian/'	| cat > dist/jalali-gcal-${VERSION}.persian.user.js
	cat jalali-gcal.user.js | sed 's/{VERSION}/${VERSION}/'	| sed 's/{EDITION}/English/'	| cat > dist/jalali-gcal-${VERSION}.english.user.js

dev:
	jslint -good jalali-gcal.user.js

clean:
	rm jalali-gcal-* -f

