
VERSION="2.3"

all: persian-edition english-edition

persian-edition:
	cat jalali-gcal.user.js | sed 's/this.usePersianDigits\t= false/this.usePersianDigits\t= true/'	| sed 's/this.usePersianNames\t= false/this.usePersianNames\t= true/'	| cat > jalali-gcal-${VERSION}.persian.user.js

english-edition:
	cat jalali-gcal.user.js | cat > jalali-gcal-${VERSION}.english.user.js

