const DOC = document;
const BODY = DOC.body;

const ROOT_SELECTOR = '.certificate__item__img[data-certificate-id]';
const MODAL_SELECTOR = '.modal.modal--certificate';

const BODY_LOCK_CLASSES = [ 'ens-modal-lock', 'no-scroll', 'modal-view' ];

function getAjaxCfg() {
	const cfg = window.appAjax || {};
	const url = cfg.url || window.ajaxurl || '';
	const nonce =
		cfg.nonces && cfg.nonces.ajaxFragments
			? String( cfg.nonces.ajaxFragments )
			: '';
	return { url, nonce };
}

function lockBody() {
	BODY.classList.add( ...BODY_LOCK_CLASSES );
}

function unlockBody() {
	BODY.classList.remove( ...BODY_LOCK_CLASSES );
}

function removeCertificateModal() {
	const modal = DOC.querySelector( MODAL_SELECTOR );
	if ( modal ) modal.remove();
	unlockBody();
}

function mountModal( html ) {
	removeCertificateModal();

	const wrap = DOC.createElement( 'div' );
	wrap.innerHTML = String( html || '' ).trim();

	const modal = wrap.firstElementChild;
	if ( ! modal ) return null;

	BODY.appendChild( modal );
	lockBody();

	const closeBtn = modal.querySelector( '.modal__close' );
	const bg = modal.querySelector( '.modal__bg' );

	const onClose = () => {
		removeCertificateModal();
		DOC.removeEventListener( 'keydown', onKeydown );
	};

	const onKeydown = ( e ) => {
		if ( e.key === 'Escape' ) onClose();
	};

	if ( closeBtn )
		closeBtn.addEventListener( 'click', onClose, { passive: true } );
	if ( bg ) bg.addEventListener( 'click', onClose, { passive: true } );

	DOC.addEventListener( 'keydown', onKeydown );

	if ( closeBtn ) closeBtn.focus();

	return modal;
}

async function fetchModalHtml( attachmentId ) {
	const { url, nonce } = getAjaxCfg();

	if ( ! url || ! nonce ) return null;

	const fd = new FormData();
	fd.append( 'action', 'ensuria_get_certificate_modal' );
	fd.append( 'nonce', nonce );
	fd.append( 'attachment_id', String( attachmentId ) );

	const res = await fetch( url, {
		method: 'POST',
		credentials: 'same-origin',
		body: fd,
	} );

	const data = await res.json().catch( () => null );
	if ( ! data || ! data.success || ! data.data || ! data.data.html )
		return null;

	return data.data.html;
}

function getAttachmentIdFromTarget( target ) {
	const el =
		target && target.closest ? target.closest( ROOT_SELECTOR ) : null;
	if ( ! el ) return 0;

	const raw = el.getAttribute( 'data-certificate-id' ) || '';
	const id = raw ? Number( raw ) : 0;

	if ( ! Number.isFinite( id ) || id <= 0 ) return 0;

	return id;
}

export function initCertificateModal() {
	const onClick = async ( e ) => {
		const id = getAttachmentIdFromTarget( e.target );
		if ( ! id ) return;

		e.preventDefault();

		const html = await fetchModalHtml( id );
		if ( ! html ) return;

		mountModal( html );
	};

	DOC.addEventListener( 'click', onClick );

	return () => {
		DOC.removeEventListener( 'click', onClick );
		removeCertificateModal();
	};
}
