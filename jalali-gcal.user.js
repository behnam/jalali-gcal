// ==UserScript==
// @name		Jalali GCal
// @namespace		http://code.google.com/p/jalali-gcal
// @description		Adds Jalali calendar to Google Calendar web interface
// @include		http://*.google.com/calendar/render*
// @include		https://*.google.com/calendar/render*
// @version		{VERSION}
// ==/UserScript==

/*
 * Project page: http://code.google.com/p/jalali-gcal/
 */

/*
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You can receive a copy of GNU Lesser General Public License at the
 * World Wide Web address <http://www.gnu.org/licenses/lgpl.html>.
 */

/*
 * Copyright (C) 2006,2007,2008  Behnam "ZWNJ" Esfahbod <behnam@zwnj.org>
 * Copyright (C) 2008  Mehdi Ahmadizadeh <mehdia@buffalo.edu>
 */

/* Changes:
 *
 * 2008-09-19: Version 2.4.
 *	* Support writing month name on the first day of each month in the
 *	calendar table
 *	--Behnam "ZWNJ" Esfahbod
 *
 * 2008-09-19: Version 2.3.
 *	* Some more fixes.
 *	--Behnam "ZWNJ" Esfahbod
 *
 * 2008-09-19: Version 2.2.
 *	* Support English and Persian numbers and months names.
 *	--Behnam "ZWNJ" Esfahbod
 *
 * 2008-08-29: Version 2.0.
 *	* Make compatible with new Google Calendar UI.
 *	--Mehdi Ahmadizadeh
 *
 * 2007-01-03: Version 1.2.
 *	* Fix a date format.
 *	--Behnam "ZWNJ" Esfahbod
 *
 * 2006-06-01: Version 1.1.
 *	--Behnam "ZWNJ" Esfahbod
 *
 */

// Main Program ///////////////////////////////////////////////////////////////
var main = function ()
{
    jgc = new JalaliGCal();
    jgc.loop(jgc);
}


// JalaliGCal Object //////////////////////////////////////////////////////////
var JalaliGCal = function ()
{
    this.EDITION	= '{EDITION}';
    this.VERSION	= '{VERSION}'

    // Preferences
    if (this.EDITION == 'Persian') {
	this.usePersianDigits	= true;
	this.usePersianNames	= true;
    }
    else {
	this.usePersianDigits	= false;
	this.usePersianNames	= false;
    }

    this.useMonthNameInFirstDay	= true;

    if (this.usePersianDigits) {
	this.tagOpen		= '<span style="direction: rtl; unicode-bidi: embed; font-family: \'DejaVu Sans\',Tahoma,sans; font-weight: bold; font-size: 120%;">'
	this.tagClose		= '</span>'
    }

    else {
	this.tagOpen		= '<i>'
	this.tagClose		= '</i>'
    }

    //this.splitter	= ' &#x2014; '
    this.splitter	= ' &mdash; '


    // Init values
    this.jc = new JalaliCalendar();
    this.g1 = [];
    this.g2 = [];

    // Persian number support
    this.printPerisanDigit		= function (i)	{ return ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"][i]; }
    this.printPersianNumber		= function (n)	{ var s = ''; for (var i in String(n)) s += this.printPerisanDigit(parseInt(String(n).charAt(i))); return s; }
    this.pN	= this.printNumber	= function (n)	{ if (this.usePersianDigits) { return this.printPersianNumber(n); } else { return String(n); } }

    // Jalali string outputs
    this.jalaliMonthNameEnglishFull	= ["Farvardin","Ordibehesht","Khordad", "Tir","Mordad","Shahrivar", "Mehr","Aban","Azar", "Dey","Bahman","Esfand"];
    this.jalaliMonthNameEnglishAbbr	= ["Far","Ord","Kho", "Tir","Mor","Sha", "Meh","Aba","Aza", "Dey","Bah","Esf"];

    this.jalaliMonthNamePersianFull	= ["فروردین","اردی‌بهشت","خرداد", "تیر","مرداد","شهریور", "مهر","آبان","آذر", "دی","بهمن","اسفند"];
    this.jalaliMonthNamePersianAbbr	= this.jalaliMonthNamePersianFull;
    //this.jalaliMonthNamePersianAbbr	= ["فرو.","ارد.","خرد.", "تیر.","مرد.","شهر.", "مهر.","آبا.","آذر.", "دی","بهم.","اسف."];

    this.pJMNA	= this.printJalaliMonthNameAbbr	= function (i)	{ if (this.usePersianNames) { return this.jalaliMonthNamePersianAbbr[i-1]; } else { return this.jalaliMonthNameEnglishAbbr[i-1]; } }
    this.pJMNF	= this.printJalaliMonthNameFull	= function (i)	{ if (this.usePersianNames) { return this.jalaliMonthNamePersianFull[i-1]; } else { return this.jalaliMonthNameEnglishFull[i-1]; } }

    // Day
    this.printJalaliDay				= function (j1)		{ return this.pN(j1[2])	; }
    this.printJalaliDayOrMonth			= function (j1)		{ if (j1[2] != 1)
									  return this.pN(j1[2])	;
									else
									  return this.pJMNA(j1[1])	;
									}

    // Day & Month
    this.printJalaliMonumDay			= function (j1)		{ return this.pN(j1[1]) +	'/' +	this.pN(j1[2])	; }

    this.printJalaliMonthDay			= function (j1)		{ if (this.usePersianNames)
									  return this.pN(j1[2]) +	' ' +	this.pJMNA(j1[1])	;
									else
									  return this.pJMNA(j1[1]) +	' ' +	this.pN(j1[2])	;
									}

    // Month & Year
    this.printJalaliMonthYear			= function (j1)		{ return this.pJMNF(j1[1]) +	' ' +	this.pN(j1[0])	; }

    this.printJalaliMonthDayYear		= function (j1)		{ if (this.usePersianNames)
									  return this.pN(j1[2]) +	' ' +	this.pJMNA(j1[1]) +	' ' +	this.pN(j1[0])	;
									else
									  return this.pJMNA(j1[1]) +	' ' +	this.pN(j1[2]) +	', ' +	this.pN(j1[0])	;
									}

    // Month & Year (2)
    this.printJalaliMonthMonthYear		= function (j1, j2)	{ return this.pJMNF(j1[1]) +	' - ' +	this.pJMNF(j2[1]) +	' ' +	this.pN(j2[0])	; }
    this.printJalaliMonthYearMonthYear		= function (j1, j2)	{ return this.pJMNF(j1[1]) +	' ' +	this.pN(j1[0]) +	' - ' +	this.pJMNF(j2[1]) +	' ' +	this.pN(j2[0])	; }

    this.printJalaliMonthDayDayYear		= function (j1, j2)	{ if (this.usePersianNames)
									  return this.pN(j1[2]) +	' - ' +	this.pN(j2[2]) +	' ' +	this.pJMNA(j1[1]) +	' ' +	this.pN(j2[0])	;
									else
									  return this.pJMNA(j1[1]) +	' ' +	this.pN(j1[2]) +	' - ' +	this.pN(j2[2]) +	', ' +	this.pN(j2[0])	;
									}

    // Day & Month & Year (2)
    this.printJalaliMonthDayMonthDayYear	= function (j1, j2)	{ if (this.usePersianNames)
									  return this.pN(j1[2]) +	' ' +	this.pJMNA(j1[1]) +	' - ' +	this.pN(j2[2]) +	' ' +	this.pJMNA(j2[1]) +	' ' +	this.pN(j2[0])	;
									else
									  return this.pJMNA(j1[1]) +	' ' +	this.pN(j1[2]) +	' - ' +	this.pJMNA(j2[1]) +	' ' +	this.pN(j2[2]) +	', ' +	this.pN(j2[0])	;
									}

    this.printJalaliMonthDayYearMonthDayYear	= function (j1, j2)	{ if (this.usePersianNames)
									  return this.pN(j1[2]) +	' ' +	this.pJMNA(j1[1]) +	' ' +	this.pN(j1[0]) +	' - ' +	this.pN(j2[2]) +	' ' +	this.pJMNA(j2[1]) +	' ' +	this.pN(j2[0])	;
									else
									  return this.pJMNA(j1[1]) +	' ' +	this.pN(j1[2]) +	', ' +	this.pN(j1[0]) +	' - ' +	this.pJMNA(j2[1]) +	' ' +	this.pN(j2[2]) +	', ' +	this.pN(j2[0])	;
									}


    this.printJalali	= function (days, gs)
    {
	if (!days) { return gs; }
	var j1 = days[0], j2 = days[1], withDay = days[2], output = '';
	// general
	if (1 <= this.type && this.type <= 5) {
	    output += gs + this.splitter + this.tagOpen;
	    if (j1[0] == j2[0]) {	if (j1[1] == j2[1]) {	if (j1[2] == j2[2]) {	if (withDay)	output += this.printJalaliMonthDayYear(j1);
											else		output += this.printJalaliMonthYear(j1);
							    }
							    else {  if (withDay)	output += this.printJalaliMonthDayDayYear(j1,j2);
								    else		output += this.printJalaliMonthYear(j1);
							    }
					}
					else {	if (withDay)	output += this.printJalaliMonthDayMonthDayYear(j1,j2);
						else		output += this.printJalaliMonthMonthYear(j1,j2);
					}
	    }
	    else {	if (withDay)	output += this.printJalaliMonthDayYearMonthDayYear(j1,j2);
			else		output += this.printJalaliMonthYearMonthYear(j1,j2);
	    }
	    output += this.tagClose;
	}

	// cheadX
	else if (this.type == 6) { output += this.g1[3] + ' ' + this.g1[2] + this.splitter + this.tagOpen + this.printJalaliDay(j1) + this.tagClose; }

	// dhX
	else if (this.type == 7) { output += this.g1[2] + this.splitter + this.tagOpen + this.printJalaliDayOrMonth(j1) + this.tagClose; }

	// lv_listview
	else if (this.type == 8) { output += gs + this.splitter + this.tagOpen + this.printJalaliMonthDay(j1) + this.tagClose; }
	else if (this.type == 9) { output += gs + this.splitter + this.tagOpen + this.printJalaliMonthDayYear(j1) + this.tagClose; }

	return output;
    }

    this.getGregorianMonthByName	= function (s)	{ return "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(s.substring(0,3))/3 + 1; }

    this.getDaysFromGregorianString	= function (gs) {
	var j1 = [1300, 1, 1], j2 = [1301, 1, 1], withDay = true;
	//GM_log ("PARSER: Recognized (1) type: " + this.type);

	// Types

	// dateunderlay
	var type1 = /([A-Z][a-z]{2})\s+(\d{1,2}),\s+(\d{4})\s+[\-–]\s+([A-Z][a-z]{2})\s+(\d{1,2}),\s+(\d{4})/; // MONTH1 DAY1, YEAR1 - MONTH2 DAY2, YEAR2
	var type2 = /([A-Z][a-z]{2})\s+(\d{1,2})\s+[\-–]\s+([A-Z][a-z]{2})\s+(\d{1,2}),\s+(\d{4})/; // MONTH1 DAY1 - MONTH2 DAY2, YEAR
	var type3 = /([A-Z][a-z]{2})\s+(\d{1,2})\s+[\-–]\s+(\d{1,2})\s+(\d{4})/; // MONTH DAY1 - DAY2 YEAR
	var type4 = /([A-Z][a-z]{2})\s+(\d{1,2}),\s+(\d{4})/; // MONTH DAY, YEAR
	var type5 = /([A-Z][a-z]{2,})\s+(\d{4})/; // FULLMONTH YEAR

	// cheadX
	var type6 = /([A-Z][a-z]{2})\s+(\d{1,2})\/(\d{1,2})/; // WEEKDAY MONTHNUM/DAY

	// dhX
	var type7 = /(\d{1,2})/; // DAY

	// lv_listview
	var type8 = /([A-Z][a-z]{2})\s+(\d{1,2})/; // MONTH DAY
	var type9 = /([A-Z][a-z]{2})\s+(\d{1,2})\s+(\d{4})/; // MONTH DAY YEAR


	// Matching

	// dateunderlay
	if (1 <= this.type && this.type <= 5) {
	    if      (type1.test(gs))	{ this.type = 1; var res = type1.exec(gs), m1 = this.getGregorianMonthByName(res[1]), d1 = Number(res[2]), y1 = Number(res[3]), m2 = this.getGregorianMonthByName(res[4]), d2 = Number(res[5]), y2 = Number(res[6]); this.g1 = [y1, m1, d1]; this.g2 = [y2, m2, d2]; j1 = this.jc.gregorianToJalali (this.g1); j2 = this.jc.gregorianToJalali (this.g2); withDay = true; }
	    else if (type2.test(gs))	{ this.type = 2; var res = type2.exec(gs), m1 = this.getGregorianMonthByName(res[1]), d1 = Number(res[2]), m2 = this.getGregorianMonthByName(res[3]), d2 = Number(res[4]), y1 = Number(res[5]); this.g1 = [y1, m1, d1]; this.g2 = [y1, m2, d2]; j1 = this.jc.gregorianToJalali (this.g1); j2 = this.jc.gregorianToJalali (this.g2); withDay = true; }
	    else if (type3.test(gs))	{ this.type = 3; var res = type3.exec(gs), m1 = this.getGregorianMonthByName(res[1]), d1 = Number(res[2]), d2 = Number(res[3]), y1 = Number(res[4]); this.g1 = [y1, m1, d1]; this.g2 = [y1, m1, d2]; j1 = this.jc.gregorianToJalali (this.g1); j2 = this.jc.gregorianToJalali (this.g2); withDay = true; }
	    else if (type4.test(gs))	{ this.type = 4; var res = type4.exec(gs), m1 = this.getGregorianMonthByName(res[1]), d1 = Number(res[2]), y1 = Number(res[3]); this.g1 = [y1, m1, d1]; this.g2 = [y1, m1, d1]; j1 = this.jc.gregorianToJalali (this.g1); j2 = this.jc.gregorianToJalali (this.g2); withDay = true; }
	    else if (type5.test(gs))	{ this.type = 5; var res = type5.exec(gs), m1 = this.getGregorianMonthByName(res[1]), y1 = Number(res[2]); this.g1 = [y1, m1, 1]; this.g2 = [y1, m1, this.jc.getGregorianDaysInMonth(y1, m1)]; j1 = this.jc.gregorianToJalali (this.g1); j2 = this.jc.gregorianToJalali (this.g2); withDay = false; }
	    else			{ GM_log ("ERROR IN PARSER! type=" + this.type + " - g1, g2: " + this.g1 + ' - ' + this.g2); return false; }
	}

	// cheadX
	else if (this.type == 6) {
	    if      (type6.test(gs))	{ this.type = 6; var res = type6.exec(gs); if (this.g1[1] > Number(res[2])) { this.g1[0] += 1; } this.g1[1] = Number(res[2]); this.g1[2] = Number(res[3]); this.g1[3] = res[1]; j1 = this.jc.gregorianToJalali (this.g1); }
	    else			{ GM_log ("ERROR IN PARSER! type=" + this.type + " - g1, g2: " + this.g1 + ' - ' + this.g2); return false; }
	}

	// dhX
	else if (this.type == 7) {
	    if (type7.test(gs))		{ this.type = 7; var res = type7.exec(gs); if (this.g1[2] > Number(res[1])) { this.g1[1] += 1; if (this.g1[1] > 12) { this.g1[1] = 1; this.g1[0] += 1; } } this.g1[2] = Number(res[1]); j1 = this.jc.gregorianToJalali (this.g1); }
	    else			{ GM_log ("ERROR IN PARSER! type=" + this.type + " - g1, g2: " + this.g1 + ' - ' + this.g2); return false; }
	}

	// lv_listview
	else if (8 <= this.type && this.type <= 9) {
	    if (type9.test(gs))		{ this.type = 9; var res = type9.exec(gs); this.g1[0] = Number(res[3]); this.g1[1] = this.getGregorianMonthByName(res[1]); this.g1[2] = Number(res[2]); j1 = this.jc.gregorianToJalali (this.g1); }
	    if (type8.test(gs))		{ this.type = 8; var res = type8.exec(gs); this.g1[1] = this.getGregorianMonthByName(res[1]); this.g1[2] = Number(res[2]); j1 = this.jc.gregorianToJalali (this.g1); }
	    else			{ GM_log ("ERROR IN PARSER! type=" + this.type + " - g1, g2: " + this.g1 + ' - ' + this.g2); return false; }
	}

	// dafault
	else				{ GM_log ("ERROR IN PARSER! type=" + this.type + " - g1, g2: " + this.g1 + ' - ' + this.g2); return false; }

	//GM_log ("PARSER: Recognized (2) type: " + this.type);
	//GM_log ("PARSER: g1, g2: " + this.g1 + ' - ' + this.g2);
	//GM_log ("PARSER: j1, j2: " + j1 + ' - ' + j2);
	return [j1, j2, withDay];
    }

    this.getHtml = function (obj)		{ return obj.innerHTML; }
    this.setHtml = function (obj, html)		{ return obj.innerHTML = html; }
    this.getPrev = function (obj)		{ return obj.getAttribute("prev_innerHTML"); }
    this.setPrev = function (obj, prev)		{ return obj.setAttribute("prev_innerHTML", prev, true); }
    this.getOrig = function (obj)		{ return obj.getAttribute("orig_innerHTML"); }
    this.setOrig = function (obj, orig)		{ return obj.setAttribute("orig_innerHTML", orig, true); }

    this.changedHtml	= function (obj)	{ return !this.getPrev(obj) || this.getPrev(obj) != this.getHtml(obj); }
    this.updateHtml	= function (obj, html)	{ this.setOrig (obj, this.getHtml(obj)); this.setHtml (obj, html); this.setPrev (obj, this.getHtml(obj)); }
    this.updateToJalali	= function (obj)	{ this.updateHtml(obj, this.printJalali(this.getDaysFromGregorianString(this.getHtml(obj)), this.getHtml(obj))); }

    this.loop = function (mythis) {
	//GM_log ("LOOP 2.0 ORIG, HTML:" + mythis.getOrig(obj) ' - ' + mythis.getHtml(obj));
	var obj;

	obj = document.getElementById("dateunderlay");
	if (obj && mythis.changedHtml(obj))
	{
	    mythis.type = 1;
	    mythis.updateToJalali (obj);

	    // cheadX
	    for (var i = 0; i < 7; i++)
	    {
		mythis.type = 6;
		id = 'chead' + i;
		obj = document.getElementById(id);
		if (!obj) { break; }
		obj = obj.getElementsByTagName('a')[0];
		if (obj) { mythis.updateToJalali (obj); }
	    }

	    // dhX
	    for (var i = 0; i < 6*7; i++)
	    {
		mythis.type = 7;
		id = 'dh' + i;
		obj = document.getElementById(id);
		if (!obj) { break; }
		mythis.updateToJalali (obj);
	    }

	    // lv_listview
	    obj = document.getElementById("lv_listview");
	    //GM_log ("LOOP: lv_listview: obj: " + obj);
	    if (obj)
	    {
		var objs = obj.firstChild.firstChild.childNodes;
		//GM_log ("LOOP: lv_listview: objs: " + objs);
		for (var i = 0; i < objs.length; i++)
		{
		    mythis.type = 8;
		    ths = objs[i].getElementsByTagName('th');
		    //GM_log ("LOOP: lv_listview: ths: " + ths);
		    if (!ths || !ths[1]) { continue; }
		    //GM_log ("LOOP: lv_listview: ths[1]: " + ths[1]);
		    mythis.updateToJalali (ths[1].getElementsByTagName('a')[0]);
		}
	    }

	}

	/*
	obj = document.getElementById("infowindow");
	if (obj && mythis.changedHtml(obj))
	{
	    mythis.type = 1;
	    if (obj.getElementsByTagName('div')[0] &&
		obj.getElementsByTagName('div')[0].getElementsByTagName('div')[6] &&
		obj.getElementsByTagName('div')[0].getElementsByTagName('div')[6].getElementsByTagName('form')[0] &&
		obj.getElementsByTagName('div')[0].getElementsByTagName('div')[6].getElementsByTagName('form')[0].getElementsByTagName('font')[0])
		{
		    obj = obj.getElementsByTagName('div')[0].getElementsByTagName('div')[6].getElementsByTagName('form')[0].getElementsByTagName('font')[0];
		    mythis.updateToJalali (obj);
		}
	}
	*/

	window.setTimeout (mythis.loop, 100, mythis);
    }
}


/*
 * Jalali Calendar in JavaScript
 */ 

/*
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You can receive a copy of GNU Lesser General Public License at the
 * World Wide Web address <http://www.gnu.org/licenses/lgpl.html>.
 */

/*
 * Copyright (C) 2001  Roozbeh Pournader <roozbeh@sharif.edu>
 * Copyright (C) 2001  Mohammad Toossi <toossi@umd.edu>
 * Copyright (C) 2003  Behdad Esfahbod <js@behdad.org>
 * Copyright (C) 2005-2006  Behnam "ZWNJ" Esfahbod <behnam@zwnj.org>
 *
 */

/* Changes:
 *
 * 2006-May-21:
 *	Move all Jalali support to JalaliCalendar object
 *
 * 2003-Mar-29:
 *	Ported to javascript by Behdad Esfahbod
 *
 * 2001-Sep-21:
 *	Fixed a bug with "30 Esfand" dates, reported by Mahmoud Ghandi
 *
 * 2001-Sep-20:
 *	First LGPL release, with both sides of conversions
 */

// JalaliCalendar Object //////////////////////////////////////////////////////
var JalaliCalendar = function ()
{
    this.gDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    this.jDaysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];

    this.div = function (a,b) { return Math.floor(a/b); }

    this.getGregorianDaysInMonth = function (y, m)
    {
	if (m != 2)					{ return this.gDaysInMonth[m-1]; }
	else	if ((y%4==0 && y%100!=0) || (y%400==0))	{ return this.gDaysInMonth[m-1] + 1; }
		else					{ return this.gDaysInMonth[m-1]; }
    }

    this.gregorianPrevMonth = function (g)
    {
	if (g[2] > 1)
	{
	    g[2] -= 1;
	}
	else
	{
	    if (g[1] > 1)
	    {
		g[1] -= 1;
	    }
	    else
	    {
		g[0] -= 1;
		g[1] = 12;
	    }
	    g[2] = this.getGregorianDaysInMonth[g[0], g[1]];
	}
    }

    this.gregorianToJalali = function (g)
    // input: array containing gregorian date [year, month, day]
    // output: array containing jalali date [year, month, day]
    {
	var gy, gm, gd, g_day_no;
	var jy, jm, jd, j_day_no, j_np;

	var i;

	gy = g[0]-1600;
	gm = g[1]-1;
	gd = g[2]-1;

	// calculating g_day_no
	g_day_no = 365*gy + this.div((gy+3),4) - this.div((gy+99),100) + this.div((gy+399),400);

	for (i=0; i<gm; ++i)
	    g_day_no += this.gDaysInMonth[i];

	if (gm>1 && ((gy%4==0 && gy%100!=0) || (gy%400==0)))
	    ++g_day_no;						// leap and after Feb

	g_day_no += gd;

	// calculating j_day_no, etc
	j_day_no = g_day_no-79;

	j_np = this.div(j_day_no, 12053);
	j_day_no %= 12053;

	jy = 979+33*j_np+4*this.div(j_day_no,1461);
	j_day_no %= 1461;

	if (j_day_no >= 366)
	{
	    jy += this.div((j_day_no-1),365);
	    j_day_no = (j_day_no-1)%365;
	}

	for (i = 0; i < 11 && j_day_no >= this.jDaysInMonth[i]; ++i)
	{
	    j_day_no -= this.jDaysInMonth[i];
	}

	jm = i+1;
	jd = j_day_no+1;

	return [jy, jm, jd];
    }

    this.jalaliToGregorian = function (j)
    // input: array containing jalali date [year, month, day]
    // output: array containing gregorian date [year, month, day]
    {
	var gy, gm, gd;
	var jy, jm, jd;
	var g_day_no, j_day_no;
	var leap;

	var i;

	jy = j[0]-979;
	jm = j[1]-1;
	jd = j[2]-1;

	// calculating j_day_no
	j_day_no = 365*jy + this.div(jy,33)*8 + this.div((jy%33+3),4);
	for (i=0; i < jm; ++i)
	    j_day_no += this.jDaysInMonth[i];

	j_day_no += jd;

	// calculating g_day_no, etc
	g_day_no = j_day_no+79;

	gy = 1600 + 400*this.div(g_day_no,146097);	// 146097 = 365*400 + 400/4 - 400/100 + 400/400
	g_day_no = g_day_no % 146097;

	leap = 1;
	if (g_day_no >= 36525)				// 36525 = 365*100 + 100/4
	{
	    g_day_no--;
	    gy += 100*this.div(g_day_no,36524);		// 36524 = 365*100 + 100/4 - 100/100
	    g_day_no = g_day_no % 36524;

	    if (g_day_no >= 365)
		g_day_no++;
	    else
		leap = 0;
	}

	gy += 4*this.div(g_day_no,1461);		// 1461 = 365*4 + 4/4
	g_day_no %= 1461;

	if (g_day_no >= 366)
	{
	    leap = 0;

	    g_day_no--;
	    gy += this.div(g_day_no, 365);
	    g_day_no = g_day_no % 365;
	}

	for (i = 0; g_day_no >= this.gDaysInMonth[i] + (i == 1 && leap); i++)
	    g_day_no -= this.gDaysInMonth[i] + (i == 1 && leap);

	gm = i+1;
	gd = g_day_no+1;

	return [gy, gm, gd];
    }

    this.printTodayJalali = function ()
    {
	today = new Date();
	glist = [ today.getFullYear(), today.getMonth()+1, today.getDate() ];
	return this.gregorianToJalali( glist );
    }
}


// The END ///////////////////////////////////////////////////////////////

main();

