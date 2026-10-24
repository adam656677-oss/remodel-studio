// Remodel Studio built-in renderer: physically based path tracing on the GPU (three-gpu-pathtracer, MIT).
// Runs with its own copy of three.js so the app's viewer can stay on its version.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { WebGLPathTracer, PhysicalCamera, ProceduralEquirectTexture, ShapedAreaLight, DenoiseMaterial } from 'three-gpu-pathtracer';
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';

const SKIES = {
	// zenith, horizon, sun glow color, sky brightness, sun strength, default exposure
	day: { zen: [0.10, 0.28, 0.78], hor: [0.60, 0.74, 0.93], glow: [1.0, 0.92, 0.78], sky: 1.0, sun: 3.2, exp: 1.0 },
	overcast: { zen: [0.62, 0.66, 0.72], hor: [0.85, 0.87, 0.9], glow: [1, 1, 1], sky: 1.25, sun: 0.0, exp: 1.1 },
	golden: { zen: [0.22, 0.32, 0.62], hor: [1.0, 0.72, 0.45], glow: [1.0, 0.62, 0.32], sky: 0.7, sun: 2.4, exp: 1.25 },
	dusk: { zen: [0.06, 0.09, 0.22], hor: [0.75, 0.42, 0.32], glow: [1.0, 0.45, 0.25], sky: 0.006, sun: 0.0, exp: 110 },
	night: { zen: [0.03, 0.045, 0.12], hor: [0.08, 0.1, 0.16], glow: [0, 0, 0], sky: 0.0006, sun: 0.0, exp: 400 },
};
// light units: the sun is about 100,000 lux and drawn at intensity SUN; electric lights are scaled the same way
const LUX_SCALE = 3.2 / 100000;

function makeSky( mode, sunDir ) {

	const S = SKIES[ mode ] || SKIES.day;
	const tex = new ProceduralEquirectTexture( 512, 256 );
	const d = new THREE.Vector3(), zen = new THREE.Color( ...S.zen ), hor = new THREE.Color( ...S.hor ), glow = new THREE.Color( ...S.glow );
	const ground = new THREE.Color( 0.18, 0.19, 0.17 ).multiplyScalar( Math.max( S.sky, 0.02 ) );
	tex.generationCallback = ( polar, uv, coord, color ) => {

		d.setFromSpherical( polar );
		if ( d.y < 0 ) {

			color.copy( ground ).lerp( hor.clone().multiplyScalar( S.sky ), Math.max( 0, 1 + d.y * 8 ) );
			return;

		}

		color.lerpColors( hor, zen, Math.pow( d.y, 0.55 ) ).multiplyScalar( S.sky );
		if ( sunDir && S.glow[ 0 ] > 0 ) {

			const c = Math.max( 0, d.dot( sunDir ) );
			const g = Math.pow( c, 48 ) * 2.5 + Math.pow( c, 6 ) * 0.25;
			color.r += glow.r * g * S.sky; color.g += glow.g * g * S.sky; color.b += glow.b * g * S.sky;

		}

	};
	tex.update();
	return tex;

}

function fixMaterials( root ) {

	const swap = new Map();
	root.traverse( o => {

		if ( ! o.isMesh ) return;
		o.castShadow = o.receiveShadow = true;
		const fix = m => {

			if ( swap.has( m ) ) return swap.get( m );
			let out = m;
			const name = ( m.name || '' ).toLowerCase();
			const glassy = ( m.transparent && m.opacity < 0.95 ) || /glass|glazing|pane/.test( name );
			if ( glassy ) {

				out = new THREE.MeshPhysicalMaterial( {
					color: new THREE.Color( 1, 1, 1 ).lerp( m.color || new THREE.Color( 1, 1, 1 ), 0.25 ),
					transmission: 1, roughness: 0.02, metalness: 0, ior: 1.5, thickness: 0.006, transparent: false, side: THREE.DoubleSide,
				} );
				out.name = m.name;

			} else if ( /water|pool/.test( name ) ) {

				out = new THREE.MeshPhysicalMaterial( { color: 0x7fb6c8, transmission: 0.9, roughness: 0.05, ior: 1.33, thickness: 1 } );

			} else {

				if ( m.transparent && m.opacity >= 0.95 ) { m.transparent = false; m.opacity = 1; }
				m.side = THREE.DoubleSide; // single-sided ceilings and trim would otherwise let light leak through from behind
				if ( /metal|steel|chrome|nickel|stainless|faucet|hardware|brass|bronze/.test( name ) ) { m.metalness = Math.max( m.metalness || 0, 0.85 ); m.roughness = Math.min( m.roughness ?? 0.4, 0.3 ); }
				if ( /quartz|granite|marble|counter|porcelain|tile|lacquer|gloss/.test( name ) ) m.roughness = Math.min( m.roughness ?? 0.5, 0.25 );
				if ( /floor.*(wood|oak|hardwood|lvp|vinyl)|hardwood|laminate/.test( name ) ) m.roughness = Math.min( m.roughness ?? 0.6, 0.45 );

			}

			swap.set( m, out );
			return out;

		};
		o.material = Array.isArray( o.material ) ? o.material.map( fix ) : fix( o.material );

	} );

}

function addLights( scene, list, scale ) {

	for ( const L of list || [] ) {

		const lm = Math.max( 1, L.lm || 800 );
		const col = new THREE.Color().setRGB( ...( L.color || [ 1, 0.84, 0.66 ] ) );
		if ( L.kind === 'disc' || L.kind === 'panel' ) {

			// ceiling cans and flush lights: a small glowing disc facing down; power = nits * area * pi
			const r = L.radius || 0.07, area = L.kind === 'panel' ? ( L.w || 0.3 ) * ( L.h || 0.3 ) : Math.PI * r * r;
			const light = new ShapedAreaLight( col, lm / ( area * Math.PI ) * LUX_SCALE * scale, L.kind === 'panel' ? ( L.w || 0.3 ) : r * 2, L.kind === 'panel' ? ( L.h || 0.3 ) : r * 2 );
			light.isCircular = L.kind === 'disc';
			light.position.set( ...L.pos );
			light.lookAt( L.pos[ 0 ], L.pos[ 1 ] - 1, L.pos[ 2 ] );
			scene.add( light );

		} else {

			// bulbs: pendants, sconces, porch lights; candela = lumens / 4 pi
			const light = new THREE.PointLight( col, lm / ( 4 * Math.PI ) * LUX_SCALE * scale, 0, 2 );
			light.radius = L.radius || 0.05;
			light.position.set( ...L.pos );
			scene.add( light );

		}

	}

}

async function create( canvas, opt ) {

	const renderer = new THREE.WebGLRenderer( { canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' } );
	renderer.setPixelRatio( 1 );
	renderer.setSize( opt.width, opt.height, false );
	renderer.toneMapping = THREE.NeutralToneMapping;
	renderer.outputColorSpace = THREE.SRGBColorSpace;

	const scene = new THREE.Scene();
	const gltf = await new GLTFLoader().parseAsync( opt.glb, '' );
	const model = gltf.scene;
	fixMaterials( model );
	scene.add( model );
	model.updateMatrixWorld( true );
	const box = new THREE.Box3().setFromObject( model );

	if ( opt.ground !== false ) {

		const g = new THREE.Mesh( new THREE.CircleGeometry( 400, 64 ), new THREE.MeshStandardMaterial( { color: opt.groundColor || 0x5d7a3f, roughness: 1 } ) );
		g.rotation.x = - Math.PI / 2; g.position.y = ( opt.groundY ?? 0 ) - 0.01; g.name = 'ground';
		scene.add( g );

	}

	const sunDir = new THREE.Vector3( ...( opt.sunDir || [ 0.4, 0.7, 0.3 ] ) ).normalize();
	const sky = SKIES[ opt.sky ] || SKIES.day;
	let sunLight = null;
	if ( sky.sun > 0 && sunDir.y > 0.01 ) {

		sunLight = new THREE.DirectionalLight( new THREE.Color( ...( opt.sky === 'golden' ? [ 1, 0.78, 0.55 ] : [ 1, 0.96, 0.9 ] ) ), sky.sun );
		sunLight.position.copy( sunDir ).multiplyScalar( 100 );
		sunLight.target.position.set( 0, 0, 0 );
		scene.add( sunLight, sunLight.target );

	}

	const env = makeSky( opt.sky, sunDir );
	scene.background = env;
	scene.environment = env;
	scene.environmentIntensity = 1;
	addLights( scene, opt.lights, ( opt.lightLevel ?? 1 ) );

	const camera = new PhysicalCamera( opt.fov || 50, opt.width / opt.height, 0.05, 2000 );
	const setCam = c => {

		camera.position.set( ...c.pos );
		camera.fov = c.fov || camera.fov;
		camera.aspect = opt.width / opt.height;
		camera.lookAt( new THREE.Vector3( ...c.target ) );
		camera.focusDistance = camera.position.distanceTo( new THREE.Vector3( ...c.target ) );
		camera.fStop = c.fStop || 16;
		camera.updateProjectionMatrix();

	};
	setCam( opt.camera );
	renderer.toneMappingExposure = sky.exp * Math.pow( 2, opt.ev || 0 );

	const gl = renderer.getContext(), px = new Uint8Array( 4 );
	const pt = new WebGLPathTracer( renderer );
	pt.bounces = opt.bounces || 6;
	pt.transmissiveBounces = 6;
	pt.filterGlossyFactor = 0.5;
	pt.minSamples = 1;
	pt.renderDelay = 0;
	pt.fadeDuration = 0;
	pt.tiles.set( opt.tiles || 2, opt.tiles || 2 );
	pt.multipleImportanceSampling = true;
	pt.setScene( scene, camera );
	// edge-aware smoothing of the remaining grain (glslSmartDeNoise), applied only to what is shown
	let denoise = !! opt.denoise;
	const dMat = new DenoiseMaterial( { map: null, blending: THREE.NoBlending, premultipliedAlpha: renderer.getContextAttributes().premultipliedAlpha } );
	dMat.sigma = 2.5; dMat.kSigma = 2.0;
	const dQuad = new FullScreenQuad( dMat );
	const defaultCb = pt.renderToCanvasCallback;
	pt.renderToCanvasCallback = ( target, r, quad ) => {

		if ( ! denoise ) { defaultCb( target, r, quad ); return; }
		dMat.map = target.texture;
		dMat.threshold = 0.1 / Math.max( 1e-4, r.toneMappingExposure );
		dMat.opacity = 1;
		const ac = r.autoClear; r.autoClear = false; dQuad.render( r ); r.autoClear = ac;

	};

	// auto exposure: measure the average brightness of what has been rendered and set the exposure to a mid gray
	let autoExp = opt.autoExposure !== false, baseExp = sky.exp, measured = 0;
	const meter = () => {

		const t = pt.target; if ( ! t ) return;
		const W = t.width, H = t.height, n = 12, buf = new Float32Array( 4 );
		let sum = 0, cnt = 0;
		for ( let i = 0; i < n; i ++ ) for ( let j = 0; j < n; j ++ ) {

			const x = Math.floor( ( i + 0.5 ) / n * W ), y = Math.floor( ( j + 0.5 ) / n * H );
			try { renderer.readRenderTargetPixels( t, x, y, 1, 1, buf ); } catch ( e ) { return; }
			const L = 0.2126 * buf[ 0 ] + 0.7152 * buf[ 1 ] + 0.0722 * buf[ 2 ];
			if ( isFinite( L ) ) { sum += Math.log( L + 1e-5 ); cnt ++; }

		}
		if ( ! cnt ) return;
		const key = Math.exp( sum / cnt );
		baseExp = Math.min( 5000, Math.max( 0.05, 0.22 / key ) );
		renderer.toneMappingExposure = baseExp * Math.pow( 2, opt.ev || 0 );

	};
	return {
		get exposure() { return baseExp; },
		box: { min: box.min.toArray(), max: box.max.toArray() },
		get samples() { return pt.samples; },
		step( n = 1 ) { for ( let i = 0; i < n; i ++ ) { pt.renderSample(); if ( autoExp && ( pt.samples === 2 || pt.samples === 6 || pt.samples === 16 ) && measured < pt.samples ) { measured = pt.samples; meter(); } } gl.readPixels( 0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px ); return pt.samples; },
		setExposure( ev ) { opt.ev = ev; renderer.toneMappingExposure = baseExp * Math.pow( 2, ev || 0 ); pt.renderSample(); },
		setCamera( c ) { setCam( c ); pt.updateCamera(); },
		reset() { pt.reset(); },
		setDenoise( on ) { denoise = !! on; pt.renderSample(); },
		toBlob( type = 'image/png', q ) { return new Promise( res => canvas.toBlob( res, type, q ) ); },
		dispose() { pt.dispose(); renderer.dispose(); env.dispose(); scene.traverse( o => { if ( o.geometry ) o.geometry.dispose(); } ); renderer.forceContextLoss?.(); },
	};

}

window.RSRender = { create, skies: Object.keys( SKIES ), three: THREE.REVISION, engine: 'three-gpu-pathtracer 0.0.27' };
