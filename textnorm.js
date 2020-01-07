//**************************************************
// 2019 text normalisation JavaScript Lib, Prof. Charlotte Schubert Alte Geschichte, Leipzig


/*
GPLv3 copyrigth

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

//
"use strict"; 

//globals
let doUVlatin = false; //should be var 
let analysisNormalform = "NFKD";
let dispnormalform = "NFC";

//**************************************************
// Section 00 
// basic UNICODE NORMAL FORM 
//**************************************************
function setAnaFormTO( fnew ){
    analysisNormalform = fnew;
}

function setDisplFormTO( fnew ){
    dispnormalform = fnew;
}

function normarrayk( aarray ){
	let replacearray = new Object();
	for( let p in aarray ){
		replacearray[ disambiguDIAkritika( p.normalize( analysisNormalform ) ) ] = aarray[p];
	}
	return replacearray;
}

function normatext( text, wichnorm ){
    let spt = text.split( " " )
    for( let w = 0; w < spt.length; w++ ){
        let nw = sameuninorm( spt[ w ], wichnorm );
        spt[ w ] = nw;
    }
    return spt.join( " " )
}

// function takes sting and normalform string (for example "NFD")
function sameuninorm( aword, wichnorm ){
    return aword.normalize( wichnorm ) 
}

//**************************************************
// Section 0 
// basic cleaning and string conversion via regexp 
//**************************************************

let cleanhtmltags = new RegExp( /\<[\w\/]*\>/, 'g' );
let cleanhtmlformat1 = new RegExp( '&nbsp;', 'g' );
let regEbr1 = new RegExp( "<br/>", 'g' ); 
let regEbr2 = new RegExp( "<br>", 'g' );
let cleanNEWL = new RegExp('\n', 'g');
let cleanRETL = new RegExp('\r', 'g');
let cleanstrangehochpunkt = new RegExp('‧', 'g');
let cleanthisbinde = new RegExp('—', 'g');
let cleanthisleer = new RegExp('\xa0', 'g');
let cleanleerpunkt = new RegExp(' \\.', 'g');
let cleanleerdoppelpunkt = new RegExp(' :', 'g');
let cleanleerkoma = new RegExp(' ,', 'g');
let cleanleersemik = new RegExp(' ;', 'g');
let cleanleerausrufe = new RegExp(' !', 'g');
let cleanleerfrege = new RegExp(' \\?', 'g');

// breakdown typographic letiances "Bindestriche und Geviertstriche"
let cleanklbindstrichvollbreit = new RegExp('－', 'g');
let cleanklbindstrichkurz = new RegExp('﹣', 'g');
let cleanklgeviert = new RegExp('﹘', 'g');
let cleanviertelgeviert = new RegExp('‐', 'g');
let cleanziffbreitergeviert = new RegExp('‒', 'g');
let cleanhalbgeviert = new RegExp('–', 'g');
let cleangeviert = new RegExp('—', 'g');

let escspitzeL = new RegExp( '<', 'g' );
let escspitzeR = new RegExp( '>', 'g' );

function spitzeklammernHTML( astr ){
    return astr.replace( escspitzeL, '&lt;' ).replace( escspitzeR, '&gt;' );
}

function basClean( astring ){
    astring = astring.replace(cleanNEWL, " <br/>").replace(cleanRETL, " <br/>").replace(cleanstrangehochpunkt,"·").replace(cleanthisbinde," — ").replace( cleanthisleer, ' ').replace( cleanleerpunkt, '.').replace( cleanleerdoppelpunkt, ':').replace( cleanleerkoma, ',').replace( cleanleersemik, ';').replace( cleanleerausrufe, '!').replace( cleanleerfrege, '?').replace(cleangeviert, '-').replace(cleanhalbgeviert, '-').replace(cleanziffbreitergeviert, '-').replace(cleanviertelgeviert, '-').replace(cleanklgeviert, '-').replace(cleanklbindstrichkurz, '-').replace(cleanklbindstrichvollbreit, '-');

    // remove hyphens
    let ws = astring.split(" ");
        let ca = [];
        let halfw = "";
        let secondhalf = "";
        for( let w in ws ){
            if( ws[w].indexOf( "-" ) != -1 ){
                let h = ws[w].split( "-" );
                halfw = h[0].replace(" ", "");
                secondhalf = h[1].replace(" ", "");
                if( secondhalf.indexOf("]") != -1 ){ 
                    let hh = h[1].split("]");
                    if( hh[1].length > 1 ){
                        ca.push( halfw + hh[1] + " " + hh[0] + "]<br/>" );
                        halfw = "";
                        secondhalf = "";
                    }
                }
            } else if ( "<br/>" != ws[w] && ws[w] != "" && ws[w] != " " && halfw != "" ){
                if( ws[w].indexOf("]") != -1 ){
                
                    secondhalf = ws[w].replace(" ", "");
                } else {
                    ca.push( halfw + ws[w].replace("<br/>", "") + " " + secondhalf + "<br/>" ); //trennstriche
                    halfw = "";
                    secondhalf = "";
                }
            } else {
                if( ws[w] != "" ){ //remove mehrfache leerstellen
                    ca.push( ws[w] );
                }
            }
        }
        return ca.join( " " );
}

//**************************************************
// Section 1 
// unicode related comparing and norming, handling of diacritics
//**************************************************

// array of unicode diacritics (relevant for polytonic greek)
let diacriticsunicodeRegExp = new Array( 
	new RegExp('\u{0313}', 'g'), 
	new RegExp("\u{0314}", 'g'), 
	new RegExp("\u{0300}", 'g'), 
	new RegExp("\u{0301}", 'g'), 
	new RegExp("\u{00B4}", 'g'), 
	new RegExp("\u{02CA}", 'g'), 
	new RegExp("\u{02B9}", 'g'), 
	new RegExp("\u{0342}", 'g'), 
	new RegExp("\u{0308}", 'g'), 
	new RegExp("\u{0304}", 'g'), 
	new RegExp("\u{0306}", 'g')
);

// function takes string, splits it with jota subscriptum and joins the string again using jota adscriptum
let regJotaSub = new RegExp('\u{0345}', 'g');
function iotasubiotoad( aword ){
 	return aword.split("\u0345").join("ι");
}

// function takes "one word"
function ohnediakritW( aword ){
    for( let dia in diacriticsunicodeRegExp ){
		aword = aword.replace( diacriticsunicodeRegExp[ dia ], "" );
	}
	return aword;
}

function capitali( astring ) {
    return astring.charAt(0).toUpperCase() + astring.slice(1).toLowerCase();
}

// precompiled regular expressions
let strClean1 = new RegExp('’', 'g');
let strClean2 = new RegExp('\'', 'g');
let strClean3 = new RegExp('᾽', 'g');
let strClean4 = new RegExp('´', 'g');

// function takes a string replaces some signs with regexp and oth
function nodiakinword( aword ){
    let spt = ((aword.replace(strClean1, "").replace(strClean2, "").replace(strClean3, "").replace(strClean4, "")).normalize( analysisNormalform ));
    return iotasubiotoad( ohnediakritW( spt ) );
}

//**************************************************
// Section 2: deleting things that could be not same in two texts
//**************************************************

// function take a string and deletes diacritical signes, ligatures, remaining interpunction, line breaks, capital letters to small ones, equalizes sigma at the end of greek words, and removes brakets
function delall( text ){
    if( doUVlatin ){ // convert u to v in classical latin text
        text = deluv( delklammern( sigmaistgleich( delgrkl( delumbrbine( delligaturen( delinterp( deldiak(  text))))))));
    } else {
        text = delklammern( sigmaistgleich( delgrkl( delumbrbine( delligaturen( delinterp( deldiak(  text  ) ) ) ) ) ) );
    }
    return text;
}

// precompiled regular expressions of the relevant ligatures 
let regEstigma = new RegExp( '\u{03DA}', 'g' ); 
let regEstigmakl = new RegExp( '\u{03DB}', 'g' );
let regEomikonyplsi = new RegExp( 'Ȣ', 'g' );
let regEomikonyplsiK = new RegExp( 'ꙋ', 'g' );
let regEkai = new RegExp( 'ϗ', 'g' );
let regEl1 = new RegExp( '\u{0223}', 'g' );
let regEl2 = new RegExp( '\u{0222}', 'g' );
let regEl3 = new RegExp( '\u{03DB}', 'g' );
// function take a string and replaces all occorences of a regular expression
function delligaturen( text ){
    return text.replace( regEstigma, "στ").replace( regEstigmakl, "στ").replace(regEomikonyplsi, "ου").replace(regEomikonyplsiK, "ου").replace(regEkai, "καὶ").replace(regEl1, "\u039F\u03C5" ).replace(regEl2, "\u03BF\u03C5" ).replace( regEl3, "\u03C3\u03C4" );
}

// function takes string and splits it into words, than normalizes each word, joins the string again
function deldiak( text ){
    let spt = text.split( " " ); //seperate words
    for( let wi = 0; wi < spt.length; wi++ ){
        spt[ wi ] = nodiakinword( spt[ wi ] );
    }
    return  spt.join( " " );
}    

let regEdoppelP = new RegExp( ':', 'g' );
let regEeinfahP = new RegExp( '\\.', 'g' );
let regEkomma = new RegExp( ',', 'g' );
let regEsemiK = new RegExp( ';', 'g' );
let regEhochP = new RegExp( '·', 'g' );
let regEausr = new RegExp( '!', 'g' );
let regEfarge = new RegExp( '\\?', 'g' );
let regEan1 = new RegExp( '“', 'g' );
let regEan5 = new RegExp( '„', 'g' );
let regEan2 = new RegExp( '”', 'g' );
let regEan3 = new RegExp( '"', 'g' );
let regEan4 = new RegExp( "'", 'g' );
// function takes a string and replaces interpunction
function delinterp( text ){
    return text.replace(regEdoppelP, "").replace(regEeinfahP, "").replace(regEkomma, "").replace(regEsemiK, "").replace(regEhochP, "").replace(regEausr, "").replace(regEfarge, "").replace(regEan1, "").replace(regEan2, "").replace(regEan3, "").replace(regEan4, "").replace(regEan5, "");
}

// function takes string and replace html line breakes
function delumbrbine( text ){
    return text.replace(regEbr1, "").replace(regEbr2, "");
}

// ...
function delgrkl( text ){
    return text.toLowerCase();
}

// function takes string and converts tailing sigma to inline sigma (greek lang)
let regEtailingsig = new RegExp( "ς", 'g' );
function sigmaistgleich( text ){
    return text.replace(regEtailingsig, "σ");
}

let regEkla1 = new RegExp( "\\(", 'g' );
let regEkla2 = new RegExp( "\\)", 'g' );
let regEkla3 = new RegExp( "\\{", 'g' );
let regEkla4 = new RegExp( "\\}", 'g' );
let regEkla5 = new RegExp( "\\[", 'g' );
let regEkla6 = new RegExp( "\\]", 'g' );
let regEkla7 = new RegExp( "\\<", 'g' );
let regEkla8 = new RegExp( "\\>", 'g' );
let regEkla9 = new RegExp( "⌈", 'g' );
let regEkla10 = new RegExp( "⌉", 'g' );
let regEkla11 = new RegExp( "‹", 'g' );
let regEkla12 = new RegExp( "›", 'g' );
let regEkla13 = new RegExp( "«", 'g' );
let regEkla14 = new RegExp( "»", 'g' );
// function take sstring and replaces the brakets
function delklammern( text ){
    return text.replace(regEkla1, "").replace(regEkla2, "").replace(regEkla3, "").replace(regEkla4,"").replace(regEkla5,"").replace(regEkla6,"").replace(regEkla7,"").replace(regEkla8,"").replace(regEkla9,"").replace(regEkla10,"").replace(regEkla11,"").replace(regEkla12,"").replace(regEkla13,"").replace(regEkla14,"");
}

let regEuv = new RegExp( "u", 'g' );
// function takes string and replaces u by v, used in classical latin texts
function deluv( text ){
    return text.replace( regEuv, "v" );
}

// USAGE
function demUsage( ){
    //small greek/latin example
    let atesttext = "ἀλλ’ ἑτέραν τινὰ φύσιν ἄπειρον, ἐξ ἧς ἅπαντας γίνεσθαι τοὺς οὐρανοὺς καὶ τοὺς ἐν αὐτοῖς κόσμους· ἐξ ὧν δὲ ἡ γένεσίς ἐστι τοῖς οὖσι, καὶ τὴν φθορὰν εἰς ταῦτα γίνεσθαι κατὰ τὸ χρεών. διδόναι γὰρ αὐτὰ δίκην καὶ τίσιν ἀλλήλοις τῆς ἀδικίας κατὰ τὴν τοῦ χρόνου τάξιν, ποιητικωτέροις οὕτως ὀνόμασιν αὐτὰ λέγων· δῆλον δὲ ὅτι τὴν εἰς ἄλληλα μεταβολὴν τῶν τεττάρων στοιχείων οὗτος θεασάμενος οὐκ ἠξίωσεν ἕν τι τούτων ὑποκείμενον ποιῆσαι, ἀλλά τι ἄλλο παρὰ ταῦτα. οὗτος δὲ οὐκ ἀλλοιουμένου τοῦ στοιχείου τὴν γένεσιν ποιεῖ, ἀλλ’ ἀποκρινομένων τῶν ἐναντίων διὰ τῆς ἀιδίου κινή- σεως·" 
 +" 1 Summá pecúniae, quam dedit in aerarium vel plebei Romanae vel dimissis militibus: denarium sexiens milliens.  "
 +"2 Opera fecit nova § aedem Martis, Iovis Tonantis et Feretri, Apollinis, díví Iúli, § Quirini, § Minervae, Iunonis Reginae, Iovis Libertatis, Larum, deum Penátium, § Iuventatis, Matris deum, Lupercal, pulvinar ad [11] circum, § cúriam cum chalcidico, forum Augustum, basilicam 35 Iuliam, theatrum Marcelli, § porticus . . . . . . . . . . , nemus trans Tiberím Caesarum. §  "
 +"3 Refécit Capitolium sacrasque aedes numero octoginta duas, theatrum Pompeí, aquarum rivos, viam Flaminiam.  ";

    let atttext = "";

    //latin
    doUVlatin = true; 
    let str1 = "<b>Textinput 1:</b>";
    console.log( str1 );
    console.log( atesttext );
    atttext = atttext + "<br/>"+ str1+"<br/>"+ atesttext;

    let basicres = normatext( basClean( atesttext ), analysisNormalform );   
    let str2 = "<b>a) Text output basic norm:</b>";
    console.log( str2 );
    console.log( basicres );
    atttext = atttext + "<br/>"+ str2+"<br/>"+ basicres;

    let diakdelled = deldiak( basicres );
    let str3 = "<b>b) Text output without diacritics:</b>" ;
    console.log( str3 );
    console.log( diakdelled );
    atttext = atttext + "<br/>"+ str3+"<br/>"+ diakdelled;

    let interpdelled = delinterp( basicres );
    let str4 = "<b>c) Text output without punctuation:</b>";
    console.log( str4 );
    console.log( interpdelled );
    atttext = atttext + "<br/>"+ str4+"<br/>"+ interpdelled;

    let ligdelled = delligaturen( basicres );
    let str5 = "<b>d) Text output without ligature:</b>";
    console.log( str5 );
    console.log( ligdelled );
    atttext = atttext + "<br/>"+ str5+"<br/>"+ ligdelled;

    let umbrdelled = delumbrbine( basicres );
    let str6 = "<b>e) Text output without newline:</b>";
    console.log( str6 );
    console.log( umbrdelled );
    atttext = atttext + "<br/>"+ str6+"<br/>"+ umbrdelled;

    let grkldelled = delgrkl( basicres );
    let str7 = "<b>f) Text output equal case:</b>";
    console.log( str7 );
    console.log( grkldelled );
    atttext = atttext + "<br/>"+ str7+"<br/>"+ grkldelled;

    let sidelled = sigmaistgleich( basicres );
    let str8 = "<b>g) Text output tailing sigma uniform:</b>";
    console.log( str8 );
    console.log( sidelled );
    atttext = atttext + "<br/>"+ str8+"<br/>"+ sidelled;

    let kladelled = delklammern( basicres );
    let str9 = "<b>h) Text output no brackets:</b>";
    console.log( str9 );
    console.log( kladelled );
    atttext = atttext + "<br/>"+ str9+"<br/>"+ kladelled;

    let uvdelled = deluv( basicres );
    let str10 = "<b>i) Text output latin u-v:</b>";
    console.log( str10 );
    console.log( uvdelled );
    atttext = atttext + "<br/>"+ str10+"<br/>"+ uvdelled;

    let alldelled = delall( basicres );
    let str11 = "<b>j) Text output all deleted:</b>";
    console.log( str11 );
    console.log( alldelled );   
    atttext = atttext + "<br/>"+ str11+"<br/>"+ alldelled;

    document.body.innerHTML = atttext;
}