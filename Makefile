
all: persian-version

persian-version:
	cat jalali-gcal.user.js | sed 's/this.usePersianDigits\t= false/this.usePersianDigits\t= true/'	| sed 's/this.usePersianNames\t= false/this.usePersianNames\t= true/'	| cat > jalali-gcal-persian.user.js

