import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ThreeMpPose } from '../demo/RPMThreeMpPose';
import type { MpLandmark } from '../demo/RPMThreeMpPose';
// ─── types ────────────────────────────────────────────────────────────────────
interface AvatarStageProps {
  /** Path (relative to /public) to the .glb avatar. Default: '/female.glb' */
  avatarUrl?: string;
  /** Path (relative to /public) to the MediaPipe JSON animation. Default: '/BETTER_smoothed_frozen.json' */
  animationData?: { animation_data: MpLandmark[][] } | null;

  /** How many world units in front of the camera the MP skeleton is projected. Default: 4 */
  mpDistFromCam?: number;
  /** Vertical offset applied after projection. Default: (0, -1, 0) */
  mpOffset?: THREE.Vector3;
  /** Playback FPS cap (0 = uncapped). Default: 30 */
  fpsCap?: number;
  /** When true, repositions camera to fit avatar after GLB load (overrides initial camera.position). Default: true */
  autoFrameCamera?: boolean;
}
type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

// ─── component ────────────────────────────────────────────────────────────────

export default function SignAvatar ({
  avatarUrl      = '/female.glb',
  animationData  = null,
  mpDistFromCam  = 4.0,
  mpOffset       = new THREE.Vector3(0, -1, 0),
  fpsCap         = 30,
  autoFrameCamera = true,
}: AvatarStageProps) {
  const mountRef  = useRef<HTMLDivElement>(null);
  const stateRef  = useRef<{
    renderer:   THREE.WebGLRenderer | null;
    rafId:      number;
    frameIndex: number;
    skeleton:   THREE.Skeleton | null;
    mpData:     MpLandmark[][] | null;
    mpPose:     ThreeMpPose;
    camera:     THREE.PerspectiveCamera | null;
    controls:   OrbitControls | null;
    scene:      THREE.Scene | null;
    lastTs:     number;
  }>({
    renderer: null, rafId: 0, frameIndex: 0,
    skeleton: null, mpData: null,
    mpPose: new ThreeMpPose(),
    camera: null, controls: null, scene: null, lastTs: 0,
  });

  const [status,   setStatus]   = useState<LoadStatus>('idle');
  const [loadMsg,  setLoadMsg]  = useState('');
  // const [debugLog, setDebugLog] = useState<string[]>([]);

  // const log = (msg: string) => {
  //   console.log('[AvatarStage]', msg);
  //   setDebugLog(prev => [...prev.slice(-8), msg]);
  // };

  const markReadyIfLoaded = () => {
    const s = stateRef.current;
    if (s.skeleton && s.mpData?.length) setStatus('ready');
  };

  // Apply animation frames when parent passes new data (after translate).
  useEffect(() => {
    const s = stateRef.current;
    if (!animationData?.animation_data?.length) return;

    s.mpData = animationData.animation_data;
    s.frameIndex = 0;
    markReadyIfLoaded();
  }, [animationData]);

  // ── main effect: Three.js lifecycle ────────────────────────────────────────
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const s = stateRef.current;
    setStatus('loading');
    setLoadMsg('Initialising renderer…');

    // ── scene ────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111318);
    s.scene = scene;

    // subtle fog for depth
    scene.fog = new THREE.FogExp2(0x111318, 0.035);

    // ── camera ───────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(
      55,
      mount.clientWidth / mount.clientHeight,
      0.01,   // near very small so skeleton always renders
      1000
    );
    camera.position.set(0, 2.5, 9);
    s.camera = camera;

    // ── renderer ─────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled  = true;
    renderer.shadowMap.type     = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace   = THREE.SRGBColorSpace;
    renderer.toneMapping        = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);
    s.renderer = renderer;

    // ── orbit controls ───────────────────────────────────────────────────────
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan     = false;
    controls.minDistance   = 0.5;
    controls.maxDistance   = 20;
    controls.target.set(0, 1.2, 0);
    controls.update();
    s.controls = controls;

    // ── lighting ─────────────────────────────────────────────────────────────
    // Key light
    const keyLight = new THREE.DirectionalLight(0xfff5e8, 2.5);
    keyLight.position.set(3, 6, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.setScalar(2048);
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far  = 30;
    scene.add(keyLight);

    // Fill
    const fillLight = new THREE.DirectionalLight(0xc8d8ff, 0.8);
    fillLight.position.set(-4, 3, -2);
    scene.add(fillLight);

    // Rim (back)
    const rimLight = new THREE.DirectionalLight(0x88aaff, 1.2);
    rimLight.position.set(0, 4, -5);
    scene.add(rimLight);

    // Ambient
    const ambLight = new THREE.HemisphereLight(0x8899bb, 0x332211, 0.6);
    scene.add(ambLight);

    // ── debug helpers ─────────────────────────────────────────────────────────
    const axes = new THREE.AxesHelper(1.5);
    scene.add(axes);

    const grid = new THREE.GridHelper(10, 20, 0x334466, 0x222233);
    (grid.material as THREE.Material).opacity = 0.4;
    (grid.material as THREE.Material).transparent = true;
    scene.add(grid);

    // ── ground plane (receives shadow) ────────────────────────────────────────
    const groundGeo = new THREE.PlaneGeometry(20, 20);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x141820,
      roughness: 0.9,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // ── load avatar ──────────────────────────────────────────────────────────
    setLoadMsg('Loading avatar…');
    const gltfLoader = new GLTFLoader();

    gltfLoader.load(
      avatarUrl,
      (gltf) => {
        // log(`GLB loaded — scene children: ${gltf.scene.children.length}`);

        // Enable shadows on every mesh
        gltf.scene.traverse((node) => {
          if ((node as THREE.Mesh).isMesh) {
            node.castShadow    = true;
            node.receiveShadow = true;
          }
          if ((node as THREE.SkinnedMesh).isSkinnedMesh) {
            s.skeleton = (node as THREE.SkinnedMesh).skeleton;
            // log(`Skeleton found on "${node.name}" — ${s.skeleton.bones.length} bones`);
            // Log bone names for debugging
            // const boneNames = s.skeleton.bones.map(b => b.name).join(', ');
            // log(`Bones: ${boneNames}`);
          }
        });

        scene.add(gltf.scene);

        // ── auto-frame camera ──────────────────────────────────────────────
        const box    = new THREE.Box3().setFromObject(gltf.scene);
        const size   = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);

        // log(`Avatar size: ${size.toArray().map(v => v.toFixed(2))} center: ${center.toArray().map(v => v.toFixed(2))}`);

        // Place the ground exactly under the avatar's feet
        ground.position.y = box.min.y;

        // Point controls at mid-torso and fit camera to avatar (overrides line-84 position).
        if (autoFrameCamera) {
          const torsoY = center.y * 0.65;
          controls.target.set(center.x, torsoY, center.z);

          const maxDim = Math.max(size.x, size.y, size.z);
          const fovRad = camera.fov * (Math.PI / 180);
          let dist    = Math.abs(maxDim / (2 * Math.tan(fovRad / 2)));
          dist        *= 1.8;

          camera.position.set(center.x, center.y + 1, center.z + dist);
          camera.lookAt(center.x, torsoY, center.z);
          controls.update();
        }

        markReadyIfLoaded();
      },
      (xhr) => {
        if (xhr.total) {
          const pct = Math.round((xhr.loaded / xhr.total) * 100);
          // setLoadMsg(`Avatar: ${pct}%`);
          if (pct == 100) setStatus('ready');
        }
      },
      (err) => {
        console.error('GLB load error', err);
        // log(`GLB error: ${String(err)}`);
        setStatus('error');
        setLoadMsg('Failed to load avatar');
      }
    );

    // ── animation loop ───────────────────────────────────────────────────────
    const frameDuration = fpsCap > 0 ? 1000 / fpsCap : 0;

    function animate(ts: number) {
      s.rafId = requestAnimationFrame(animate);

      // FPS cap
      if (frameDuration > 0 && ts - s.lastTs < frameDuration) return;
      s.lastTs = ts;

      if (s.skeleton && s.mpData && s.camera) {
        const mpFrame = s.mpData[s.frameIndex];

        s.mpPose.updateMpLandmarks(mpFrame);
        s.mpPose.transformToWorld(s.camera, mpDistFromCam, mpOffset);
        s.mpPose.add3dJointsForMixamo();
        s.mpPose.rigSolverForMixamo(s.skeleton);

        s.frameIndex = (s.frameIndex + 1) % s.mpData.length;

        if (s.frameIndex === 0) console.log('Animation looped');
      }

      controls.update();
      renderer.render(scene, camera);
    }

    s.rafId = requestAnimationFrame(animate);

    // ── resize handler ───────────────────────────────────────────────────────
    function onResize() {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    // ── cleanup ───────────────────────────────────────────────────────────────
    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(s.rafId);
      controls.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      // Dispose scene resources
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          (obj as THREE.Mesh).geometry?.dispose();
          const mat = (obj as THREE.Mesh).material;
          if (Array.isArray(mat)) mat.forEach(m => m.dispose());
          else mat?.dispose();
        }
      });
      s.renderer  = null;
      s.skeleton  = null;
      s.mpData    = null;
      s.camera    = null;
      s.controls  = null;
      s.scene     = null;
      s.frameIndex = 0;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatarUrl, autoFrameCamera]);

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#111318',
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      }}
    >
      {/* Three.js canvas mount */}
      <div
        ref={mountRef}
        style={{ width: '100%', height: '100%' }}
      />

      {/* Loading / Error overlay */}
      {(status === 'loading' || status === 'error') && (
        <div
          style={{
            position:      'absolute',
            inset:         0,
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'center',
            justifyContent:'center',
            background:    'rgba(10,11,16,0.82)',
            backdropFilter:'blur(6px)',
            color:         status === 'error' ? '#ff6b6b' : '#8ab4f8',
            gap:           '1rem',
            pointerEvents: 'none',
          }}
        >
          {status === 'loading' && (
            <svg width="40" height="40" viewBox="0 0 40 40" style={{ animation: 'spin 1s linear infinite' }}>
              <circle cx="20" cy="20" r="16" fill="none" stroke="#8ab4f8" strokeWidth="3" strokeDasharray="60 40" />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </svg>
          )}
          <span style={{ fontSize: '0.85rem', letterSpacing: '0.08em', opacity: 0.9 }}>
            {loadMsg || (status === 'error' ? 'Load failed' : 'Loading…')}
          </span>
        </div>
      )}

      {/* Debug log panel */}
      {/* <div
        style={{
          position:       'absolute',
          bottom:         12,
          left:           12,
          maxWidth:       420,
          background:     'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)',
          border:         '1px solid rgba(138,180,248,0.15)',
          borderRadius:   6,
          padding:        '8px 12px',
          color:          '#8ab4f8',
          fontSize:       '0.68rem',
          lineHeight:     1.5,
          letterSpacing:  '0.05em',
          pointerEvents:  'none',
        }}
      >
        <div style={{ marginBottom: 4, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.6rem' }}>
          debug log
        </div>
        {debugLog.length === 0
          ? <span style={{ opacity: 0.4 }}>—</span>
          : debugLog.map((line, i) => <div key={i}>{line}</div>)
        }
      </div> */}

      {/* Status badge */}
      <div
        style={{
          position:      'absolute',
          top:           12,
          left:         12,
          padding:       '4px 10px',
          borderRadius:  4,
          fontSize:      '0.65rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          background:    status === 'ready'   ? 'rgba(72,199,142,0.15)'
                       : status === 'error'   ? 'rgba(255,107,107,0.15)'
                       : 'rgba(138,180,248,0.1)',
          border: `1px solid ${
            status === 'ready' ? 'rgba(72,199,142,0.4)'
            : status === 'error' ? 'rgba(255,107,107,0.4)'
            : 'rgba(138,180,248,0.25)'
          }`,
          color: status === 'ready' ? '#48c78e' : status === 'error' ? '#ff6b6b' : '#8ab4f8',
        }}
      >
        {status}
      </div>

      {/* Controls hint */}
      {status === 'ready' && (
        <div
          style={{
            position:      'absolute',
            top:           12,
            right:          12,
            fontSize:      '0.65rem',
            letterSpacing: '0.08em',
            color:         'rgba(138,180,248,0.45)',
            lineHeight:    1.7,
          }}
        >
          <div>Drag — orbit</div>
          <div>Scroll — zoom</div>
        </div>
      )}
    </div>
  );
}
