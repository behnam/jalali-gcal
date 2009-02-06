
VERSION=2.5

all: editions

editions: persian-edition english-edition

persian-edition:
	cat jalali-gcal.user.js | sed 's/{VERSION}/${VERSION}/'	| sed 's/{EDITION}/Persian/'	| cat > jalali-gcal-${VERSION}.persian.user.js

english-edition:
	cat jalali-gcal.user.js | sed 's/{VERSION}/${VERSION}/'	| sed 's/{EDITION}/English/'	| cat > jalali-gcal-${VERSION}.english.user.js

clean:
	rm jalali-gcal-* -f

