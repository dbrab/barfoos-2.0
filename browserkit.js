'use strict';

import { extend, mix } from './toolkit.js';
import { Mediator } from './mediator.js';
import { doc, win, LogTools } from './domkit.js';

/*****************************************************************************************************
 * Class BrowserKit provides basic browser event abstraction into BarFoos events
 * Any Browser related task will be handled here
 *****************************************************************************************************/
class BrowserKit extends mix().with( LogTools, Mediator ) {
	constructor() {
		super( ...arguments );

		extend( this ).with({
		});

		this.init();
	}

	async init() {
		doc.addEventListener( 'visibilitychange', this.visibilityChange.bind( this ), false );
		doc.addEventListener( 'focusin', this.focusin.bind( this ), false );
		doc.addEventListener( 'focusout', this.focusout.bind( this ), false );

		this.on( 'isAppHidden.appEvents', () => doc.hidden );
		this.on( 'isAppFocused.appEvents', () => doc.hasFocus() );
		// onbeforeunload
		// resize
		// scroll
	}

	loadImage( url ) {
		this.log('loadImage as class member call...!');
		try {
			return fetch( url ).then( res => res.blob() ).then( blob => URL.createObjectURL( blob ) );
		} catch ( ex ) {
			this.log( `Error: ${ ex.message }` );
		}
	}

	visibilityChange() {
		this.fire( 'appVisibilityChange.appEvents', !doc.hidden );
	}

	focusin() {
		this.fire( 'appFocusChange.appEvents', doc.hasFocus() );
	}

	focusout() {
		this.fire( 'appFocusChange.appEvents', doc.hasFocus() );
	}
}
/****************************************** BrowserKit End ******************************************/

export { BrowserKit };
