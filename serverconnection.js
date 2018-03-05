'use strict';

import { win, doc, undef } from './domkit.js';
import io from 'socket.io-client';

const	socket = io( ENV_PROD ? 'https://der-vegane-germane.de' : 'https://dev.der-vegane-germane.de', {
			transports:	[ 'websocket' ],
			secure:		true
		}),
		maxTimeout	= 3000;

let		connected	= false;

socket.on( 'reconnect_attempt', () => {
	connected = false;
	if( ENV_PROD === false ) console.log('Reconnecting, also allowing xhr polling...');
	socket.io.opts.transport = [ 'polling', 'websocket' ];
});

socket.on( 'connect', () => {
	connected = true;
	if( ENV_PROD === false ) console.log('server connection established.');
});

socket.on( 'reconnect', attempts => {
	connected = true;
	if( ENV_PROD === false ) console.log('server connection established.');
});

socket.on( 'connect_timeout', timeout => {
	connected = false;
	if( ENV_PROD === false ) console.log('server connection timed out: ', timeout);
});

socket.on( 'disconnect', reason => {
	connected = false;
	if( ENV_PROD === false ) console.log('server connection disconnected: ', reason);
});

socket.on( 'error', error => {
	if( ENV_PROD === false ) console.log('server connection error: ', error);
});

let ServerConnection = target => class extends target {
	constructor() {
		super( ...arguments );
	}

	init() {
		super.init && super.init( ...arguments );
	}

	send( { type = '', payload = { } } = { }, { noTimeout = false } = { } ) {
		let responseTimeout;

		return new Promise( ( resolve, reject ) => {
			if(!noTimeout ) {
				responseTimeout = win.setTimeout(() => {
					if( this.id ) {
						reject( `Server answer for ${ type } timed out.` );
					}
				}, maxTimeout);
			}

			socket.emit( type, payload, response => {
				win.clearTimeout( responseTimeout );

				try {
					this.handleServerReponse( response );
				} catch( ex ) {
					reject( ex );
				}

				if( this.id ) {
					resolve( response );
				}
			});
		});
	}

	recv( type, callback ) {
		socket.on( type, recvData => {
			try {
				this.handleServerReponse( recvData );
			} catch( ex ) {
				throw new Error( ex );
			}

			if( this.id ) {
				callback( recvData );
			}
		});
	}

	handleServerReponse( response ) {
		if( response.error || response.errorCode ) {
			// handle errors
			throw response.error || response.errorCode;
		}
	}
}

export default ServerConnection;
