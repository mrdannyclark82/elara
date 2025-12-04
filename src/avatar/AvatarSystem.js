/**
 * Elara Avatar System
 * Creates and manages the 3D avatar with distinctive features:
 * - Long, flowing curly red hair
 * - Emerald-green eyes
 * - Elegant features conveying warmth, intelligence, and approachability
 */

import * as THREE from 'three';

/**
 * Avatar character configuration
 */
export const AVATAR_CONFIG = {
    // Elara's distinctive appearance
    appearance: {
        hair: {
            color: 0xC04000, // Rich auburn/red color
            highlightColor: 0xE85C0D,
            style: 'long-curly',
            length: 0.8, // Shoulder length
            curlIntensity: 0.6
        },
        eyes: {
            color: 0x50C878, // Emerald green
            irisColor: 0x2E8B57,
            pupilColor: 0x1A1A1A,
            size: 0.04,
            sparkle: true
        },
        skin: {
            color: 0xFFE4C4, // Warm, natural skin tone
            freckles: false
        },
        lips: {
            color: 0xCC6666,
            thickness: 0.02
        },
        features: {
            faceShape: 'oval',
            noseType: 'elegant',
            cheekbones: 'defined',
            jawline: 'soft'
        }
    },
    // Animation settings
    animation: {
        blinkInterval: [3000, 6000], // Random blink interval range
        breathingSpeed: 0.5,
        idleMovement: true
    }
};

/**
 * Main Avatar System Class
 */
export class AvatarSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.avatar = null;
        this.morphTargets = {};
        this.bones = {};
        this.currentExpression = 'neutral';
        this.isInitialized = false;
    }

    /**
     * Initialize the 3D scene and avatar
     */
    async init() {
        console.log('🎭 Initializing Avatar System...');

        // Setup Three.js scene
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLighting();

        // Create the avatar
        await this.createAvatar();

        // Setup resize handler
        this.setupResizeHandler();

        // Start idle animations
        this.startIdleAnimations();

        this.isInitialized = true;
        console.log('✅ Avatar System initialized');
    }

    /**
     * Setup the 3D scene
     */
    setupScene() {
        this.scene = new THREE.Scene();
        
        // Create gradient background
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        const texture = new THREE.CanvasTexture(canvas);
        this.scene.background = texture;
    }

    /**
     * Setup the camera
     */
    setupCamera() {
        const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        this.camera.position.set(0, 0.2, 2);
        this.camera.lookAt(0, 0, 0);
    }

    /**
     * Setup the WebGL renderer
     */
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
    }

    /**
     * Setup scene lighting for warm, flattering appearance
     */
    setupLighting() {
        // Main key light (warm)
        const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
        keyLight.position.set(2, 2, 3);
        keyLight.castShadow = true;
        this.scene.add(keyLight);

        // Fill light (cool, softer)
        const fillLight = new THREE.DirectionalLight(0xe6f0ff, 0.6);
        fillLight.position.set(-2, 1, 2);
        this.scene.add(fillLight);

        // Rim light (for hair shine)
        const rimLight = new THREE.DirectionalLight(0xffccaa, 0.8);
        rimLight.position.set(0, 1, -2);
        this.scene.add(rimLight);

        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404050, 0.4);
        this.scene.add(ambientLight);

        // Eye lights (for sparkle)
        const eyeLight = new THREE.PointLight(0xffffff, 0.3, 3);
        eyeLight.position.set(0, 0.2, 1.5);
        this.scene.add(eyeLight);
    }

    /**
     * Create the Elara avatar with all features
     */
    async createAvatar() {
        // Create avatar group
        this.avatar = new THREE.Group();
        this.avatar.name = 'Elara';

        // Create body parts
        this.createHead();
        this.createHair();
        this.createEyes();
        this.createEyebrows();
        this.createNose();
        this.createMouth();
        this.createNeck();
        this.createShoulders();

        // Position the avatar
        this.avatar.position.y = -0.3;

        this.scene.add(this.avatar);
    }

    /**
     * Create the head/face
     */
    createHead() {
        // Elegant oval face shape
        const headGeometry = new THREE.SphereGeometry(0.25, 64, 48);
        
        // Modify geometry for oval face shape
        const positions = headGeometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const y = positions.getY(i);
            const z = positions.getZ(i);
            
            // Scale for oval shape
            positions.setX(i, positions.getX(i) * 0.85);
            positions.setY(i, y * 1.1);
            
            // Soften jawline
            if (y < -0.1) {
                positions.setX(i, positions.getX(i) * (1 - Math.abs(y + 0.1) * 0.3));
            }
            
            // Define cheekbones
            if (y > -0.05 && y < 0.1 && Math.abs(positions.getX(i)) > 0.15) {
                positions.setZ(i, z + 0.02);
            }
        }
        headGeometry.computeVertexNormals();

        // Skin material with subsurface scattering effect
        const skinMaterial = new THREE.MeshStandardMaterial({
            color: AVATAR_CONFIG.appearance.skin.color,
            roughness: 0.6,
            metalness: 0.0,
            flatShading: false
        });

        const head = new THREE.Mesh(headGeometry, skinMaterial);
        head.name = 'head';
        head.castShadow = true;
        head.receiveShadow = true;

        this.avatar.add(head);
        this.bones.head = head;
    }

    /**
     * Create long, flowing curly red hair
     */
    createHair() {
        const hairGroup = new THREE.Group();
        hairGroup.name = 'hair';

        const hairColor = AVATAR_CONFIG.appearance.hair.color;
        const highlightColor = AVATAR_CONFIG.appearance.hair.highlightColor;

        // Hair material with shine
        const hairMaterial = new THREE.MeshStandardMaterial({
            color: hairColor,
            roughness: 0.3,
            metalness: 0.1,
            side: THREE.DoubleSide
        });

        const hairHighlightMaterial = new THREE.MeshStandardMaterial({
            color: highlightColor,
            roughness: 0.25,
            metalness: 0.15,
            side: THREE.DoubleSide
        });

        // Top of head hair (volume)
        const topHairGeometry = new THREE.SphereGeometry(0.27, 32, 24);
        topHairGeometry.scale(0.9, 0.7, 0.95);
        const topHair = new THREE.Mesh(topHairGeometry, hairMaterial);
        topHair.position.y = 0.12;
        topHair.position.z = 0.02;
        hairGroup.add(topHair);

        // Create flowing curly strands
        this.createHairStrands(hairGroup, hairMaterial, hairHighlightMaterial);

        // Bangs/fringe
        this.createBangs(hairGroup, hairMaterial);

        this.avatar.add(hairGroup);
        this.bones.hair = hairGroup;
    }

    /**
     * Create individual hair strands with curls
     */
    createHairStrands(hairGroup, mainMaterial, highlightMaterial) {
        const strandCount = 80;
        const hairLength = AVATAR_CONFIG.appearance.hair.length;
        const curlIntensity = AVATAR_CONFIG.appearance.hair.curlIntensity;

        for (let i = 0; i < strandCount; i++) {
            const angle = (i / strandCount) * Math.PI * 2;
            const isHighlight = i % 5 === 0;
            const material = isHighlight ? highlightMaterial : mainMaterial;

            // Create curved strand using tube geometry
            const curve = this.createCurlyHairCurve(angle, hairLength, curlIntensity);
            const strandGeometry = new THREE.TubeGeometry(curve, 20, 0.012 + Math.random() * 0.008, 6, false);
            const strand = new THREE.Mesh(strandGeometry, material);
            strand.castShadow = true;

            hairGroup.add(strand);
        }
    }

    /**
     * Create a curly hair strand curve
     */
    createCurlyHairCurve(angle, length, curlIntensity) {
        const points = [];
        const segments = 15;

        // Starting position on head
        const startRadius = 0.26;
        const startX = Math.sin(angle) * startRadius;
        const startZ = Math.cos(angle) * startRadius * 0.95;
        const startY = 0.1 + Math.cos(angle * 2) * 0.05;

        for (let j = 0; j <= segments; j++) {
            const t = j / segments;
            
            // Add curl wave
            const curlWave = Math.sin(t * Math.PI * 3) * curlIntensity * 0.08;
            const curlWaveZ = Math.cos(t * Math.PI * 3) * curlIntensity * 0.05;

            const x = startX + curlWave + (Math.sin(angle) * t * 0.1);
            const y = startY - t * length;
            const z = startZ + curlWaveZ - (t * 0.15);

            points.push(new THREE.Vector3(x, y, z));
        }

        return new THREE.CatmullRomCurve3(points);
    }

    /**
     * Create bangs/fringe
     */
    createBangs(hairGroup, material) {
        for (let i = 0; i < 20; i++) {
            const angle = -Math.PI / 3 + (i / 20) * (Math.PI * 2 / 3);
            const points = [];
            
            const startX = Math.sin(angle) * 0.22;
            const startZ = Math.cos(angle) * 0.22 + 0.08;
            const startY = 0.15;

            for (let j = 0; j <= 8; j++) {
                const t = j / 8;
                const wave = Math.sin(t * Math.PI * 2) * 0.01;
                points.push(new THREE.Vector3(
                    startX + wave,
                    startY - t * 0.12,
                    startZ + t * 0.05 + Math.sin(i + t * 2) * 0.02
                ));
            }

            const curve = new THREE.CatmullRomCurve3(points);
            const bangGeometry = new THREE.TubeGeometry(curve, 10, 0.01, 6, false);
            const bang = new THREE.Mesh(bangGeometry, material);
            bang.castShadow = true;
            hairGroup.add(bang);
        }
    }

    /**
     * Create emerald-green eyes
     */
    createEyes() {
        const eyeGroup = new THREE.Group();
        eyeGroup.name = 'eyes';

        const eyeConfig = AVATAR_CONFIG.appearance.eyes;
        const eyeSpacing = 0.07;
        const eyeY = 0.05;
        const eyeZ = 0.22;

        // Create left and right eyes
        [-1, 1].forEach(side => {
            const eye = this.createSingleEye(eyeConfig, side);
            eye.position.set(side * eyeSpacing, eyeY, eyeZ);
            eyeGroup.add(eye);
        });

        this.avatar.add(eyeGroup);
        this.bones.eyes = eyeGroup;
    }

    /**
     * Create a single eye with iris, pupil, and highlights
     */
    createSingleEye(config, side) {
        const eyeGroup = new THREE.Group();

        // Eyeball (sclera)
        const scleraGeometry = new THREE.SphereGeometry(config.size, 32, 24);
        scleraGeometry.scale(1, 0.7, 0.6);
        const scleraMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.1,
            metalness: 0
        });
        const sclera = new THREE.Mesh(scleraGeometry, scleraMaterial);
        eyeGroup.add(sclera);

        // Iris (emerald green)
        const irisGeometry = new THREE.CircleGeometry(config.size * 0.45, 32);
        const irisMaterial = new THREE.MeshStandardMaterial({
            color: config.color,
            roughness: 0.2,
            metalness: 0.1
        });
        const iris = new THREE.Mesh(irisGeometry, irisMaterial);
        iris.position.z = config.size * 0.55;
        eyeGroup.add(iris);

        // Inner iris ring (darker green)
        const innerIrisGeometry = new THREE.RingGeometry(config.size * 0.15, config.size * 0.35, 32);
        const innerIrisMaterial = new THREE.MeshBasicMaterial({
            color: config.irisColor,
            transparent: true,
            opacity: 0.6
        });
        const innerIris = new THREE.Mesh(innerIrisGeometry, innerIrisMaterial);
        innerIris.position.z = config.size * 0.56;
        eyeGroup.add(innerIris);

        // Pupil
        const pupilGeometry = new THREE.CircleGeometry(config.size * 0.15, 32);
        const pupilMaterial = new THREE.MeshBasicMaterial({
            color: config.pupilColor
        });
        const pupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        pupil.position.z = config.size * 0.57;
        pupil.name = `pupil_${side > 0 ? 'right' : 'left'}`;
        eyeGroup.add(pupil);

        // Eye highlight (sparkle)
        if (config.sparkle) {
            const highlightGeometry = new THREE.CircleGeometry(config.size * 0.08, 16);
            const highlightMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.9
            });
            const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
            highlight.position.set(config.size * 0.15, config.size * 0.12, config.size * 0.58);
            eyeGroup.add(highlight);

            // Secondary smaller highlight
            const highlight2 = highlight.clone();
            highlight2.scale.setScalar(0.4);
            highlight2.position.set(-config.size * 0.1, -config.size * 0.05, config.size * 0.58);
            eyeGroup.add(highlight2);
        }

        // Eyelids
        this.createEyelids(eyeGroup, config, side);

        return eyeGroup;
    }

    /**
     * Create eyelids for blinking
     */
    createEyelids(eyeGroup, config, side) {
        // Upper eyelid
        const upperLidGeometry = new THREE.SphereGeometry(config.size * 1.1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        upperLidGeometry.scale(1.1, 0.6, 0.5);
        const lidMaterial = new THREE.MeshStandardMaterial({
            color: AVATAR_CONFIG.appearance.skin.color,
            roughness: 0.6
        });
        const upperLid = new THREE.Mesh(upperLidGeometry, lidMaterial);
        upperLid.rotation.x = Math.PI;
        upperLid.position.z = config.size * 0.3;
        upperLid.visible = false; // Hidden when open
        upperLid.name = `upperLid_${side > 0 ? 'right' : 'left'}`;
        eyeGroup.add(upperLid);

        // Lower eyelid
        const lowerLidGeometry = new THREE.SphereGeometry(config.size * 1.1, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 4);
        lowerLidGeometry.scale(1.1, 0.4, 0.4);
        const lowerLid = new THREE.Mesh(lowerLidGeometry, lidMaterial);
        lowerLid.position.y = -config.size * 0.3;
        lowerLid.position.z = config.size * 0.2;
        lowerLid.name = `lowerLid_${side > 0 ? 'right' : 'left'}`;
        eyeGroup.add(lowerLid);

        // Eyelashes
        this.createEyelashes(eyeGroup, config, side);
    }

    /**
     * Create eyelashes
     */
    createEyelashes(eyeGroup, config, side) {
        const lashMaterial = new THREE.MeshBasicMaterial({ color: 0x2a1a0a });

        for (let i = 0; i < 12; i++) {
            const angle = -Math.PI / 4 + (i / 11) * (Math.PI / 2);
            const x = Math.sin(angle) * config.size * 0.9;
            const y = Math.cos(angle) * config.size * 0.5 + config.size * 0.2;

            const lashPoints = [
                new THREE.Vector3(x, y, config.size * 0.5),
                new THREE.Vector3(x * 1.1, y + 0.01 + Math.random() * 0.01, config.size * 0.55),
                new THREE.Vector3(x * 1.15, y + 0.015 + Math.random() * 0.01, config.size * 0.5)
            ];

            const lashCurve = new THREE.CatmullRomCurve3(lashPoints);
            const lashGeometry = new THREE.TubeGeometry(lashCurve, 5, 0.002, 4, false);
            const lash = new THREE.Mesh(lashGeometry, lashMaterial);
            eyeGroup.add(lash);
        }
    }

    /**
     * Create eyebrows
     */
    createEyebrows() {
        const browGroup = new THREE.Group();
        browGroup.name = 'eyebrows';

        const browMaterial = new THREE.MeshStandardMaterial({
            color: AVATAR_CONFIG.appearance.hair.color,
            roughness: 0.5
        });

        [-1, 1].forEach(side => {
            const browPoints = [];
            for (let i = 0; i <= 10; i++) {
                const t = i / 10;
                const x = side * (0.04 + t * 0.06);
                const y = 0.12 + Math.sin(t * Math.PI) * 0.015;
                const z = 0.22 + t * 0.01;
                browPoints.push(new THREE.Vector3(x, y, z));
            }

            const browCurve = new THREE.CatmullRomCurve3(browPoints);
            const browGeometry = new THREE.TubeGeometry(browCurve, 12, 0.008, 6, false);
            const brow = new THREE.Mesh(browGeometry, browMaterial);
            brow.name = `brow_${side > 0 ? 'right' : 'left'}`;
            browGroup.add(brow);
        });

        this.avatar.add(browGroup);
        this.bones.eyebrows = browGroup;
    }

    /**
     * Create elegant nose
     */
    createNose() {
        const noseGroup = new THREE.Group();
        noseGroup.name = 'nose';

        const noseMaterial = new THREE.MeshStandardMaterial({
            color: AVATAR_CONFIG.appearance.skin.color,
            roughness: 0.6
        });

        // Nose bridge
        const bridgePoints = [
            new THREE.Vector3(0, 0.08, 0.22),
            new THREE.Vector3(0, 0.02, 0.26),
            new THREE.Vector3(0, -0.03, 0.28),
            new THREE.Vector3(0, -0.06, 0.27)
        ];
        const bridgeCurve = new THREE.CatmullRomCurve3(bridgePoints);
        const bridgeGeometry = new THREE.TubeGeometry(bridgeCurve, 10, 0.015, 8, false);
        const bridge = new THREE.Mesh(bridgeGeometry, noseMaterial);
        noseGroup.add(bridge);

        // Nose tip
        const tipGeometry = new THREE.SphereGeometry(0.025, 16, 12);
        tipGeometry.scale(1, 0.8, 0.9);
        const tip = new THREE.Mesh(tipGeometry, noseMaterial);
        tip.position.set(0, -0.06, 0.27);
        noseGroup.add(tip);

        // Nostrils
        [-1, 1].forEach(side => {
            const nostrilGeometry = new THREE.SphereGeometry(0.012, 8, 6);
            const nostril = new THREE.Mesh(nostrilGeometry, noseMaterial);
            nostril.position.set(side * 0.018, -0.07, 0.25);
            noseGroup.add(nostril);
        });

        this.avatar.add(noseGroup);
        this.bones.nose = noseGroup;
    }

    /**
     * Create mouth with lips
     */
    createMouth() {
        const mouthGroup = new THREE.Group();
        mouthGroup.name = 'mouth';

        const lipColor = AVATAR_CONFIG.appearance.lips.color;
        const lipMaterial = new THREE.MeshStandardMaterial({
            color: lipColor,
            roughness: 0.3,
            metalness: 0.1
        });

        // Upper lip
        const upperLipPoints = [];
        for (let i = 0; i <= 12; i++) {
            const t = (i / 12) * 2 - 1; // -1 to 1
            const x = t * 0.055;
            const y = -0.1 + Math.pow(Math.abs(t), 2) * 0.01 - Math.pow(1 - Math.abs(t), 2) * 0.008;
            const z = 0.24 + (1 - Math.abs(t)) * 0.01;
            upperLipPoints.push(new THREE.Vector3(x, y, z));
        }
        const upperLipCurve = new THREE.CatmullRomCurve3(upperLipPoints);
        const upperLipGeometry = new THREE.TubeGeometry(upperLipCurve, 16, 0.01, 8, false);
        const upperLip = new THREE.Mesh(upperLipGeometry, lipMaterial);
        upperLip.name = 'upperLip';
        mouthGroup.add(upperLip);

        // Lower lip
        const lowerLipPoints = [];
        for (let i = 0; i <= 12; i++) {
            const t = (i / 12) * 2 - 1;
            const x = t * 0.05;
            const y = -0.115 - (1 - Math.pow(Math.abs(t), 1.5)) * 0.015;
            const z = 0.235 + (1 - Math.abs(t)) * 0.015;
            lowerLipPoints.push(new THREE.Vector3(x, y, z));
        }
        const lowerLipCurve = new THREE.CatmullRomCurve3(lowerLipPoints);
        const lowerLipGeometry = new THREE.TubeGeometry(lowerLipCurve, 16, 0.012, 8, false);
        const lowerLip = new THREE.Mesh(lowerLipGeometry, lipMaterial);
        lowerLip.name = 'lowerLip';
        mouthGroup.add(lowerLip);

        // Mouth interior (for open mouth states)
        const mouthInteriorGeometry = new THREE.CircleGeometry(0.04, 16);
        const mouthInteriorMaterial = new THREE.MeshBasicMaterial({
            color: 0x331111,
            visible: false
        });
        const mouthInterior = new THREE.Mesh(mouthInteriorGeometry, mouthInteriorMaterial);
        mouthInterior.position.set(0, -0.105, 0.22);
        mouthInterior.name = 'mouthInterior';
        mouthGroup.add(mouthInterior);

        this.avatar.add(mouthGroup);
        this.bones.mouth = mouthGroup;
    }

    /**
     * Create neck
     */
    createNeck() {
        const neckGeometry = new THREE.CylinderGeometry(0.08, 0.1, 0.15, 16);
        const neckMaterial = new THREE.MeshStandardMaterial({
            color: AVATAR_CONFIG.appearance.skin.color,
            roughness: 0.6
        });
        const neck = new THREE.Mesh(neckGeometry, neckMaterial);
        neck.position.y = -0.32;
        neck.name = 'neck';
        neck.castShadow = true;

        this.avatar.add(neck);
        this.bones.neck = neck;
    }

    /**
     * Create shoulders/upper body hint
     */
    createShoulders() {
        const shoulderGeometry = new THREE.SphereGeometry(0.3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        shoulderGeometry.scale(1.5, 0.5, 0.8);
        
        // Elegant clothing material
        const clothingMaterial = new THREE.MeshStandardMaterial({
            color: 0x2e8b57, // Emerald green to match eyes
            roughness: 0.5,
            metalness: 0.1
        });
        
        const shoulders = new THREE.Mesh(shoulderGeometry, clothingMaterial);
        shoulders.position.y = -0.45;
        shoulders.rotation.x = Math.PI;
        shoulders.name = 'shoulders';
        shoulders.castShadow = true;

        this.avatar.add(shoulders);
        this.bones.shoulders = shoulders;
    }

    /**
     * Setup window resize handler
     */
    setupResizeHandler() {
        const handleResize = () => {
            const width = this.canvas.clientWidth;
            const height = this.canvas.clientHeight;

            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);
        handleResize();
    }

    /**
     * Start idle animations (blinking, breathing, subtle movement)
     */
    startIdleAnimations() {
        // Blinking
        this.startBlinking();

        // Breathing animation
        this.startBreathing();

        // Subtle head movement
        this.startIdleMovement();
    }

    /**
     * Start automatic blinking
     */
    startBlinking() {
        const blink = () => {
            this.playBlink();
            
            // Random interval between blinks
            const [min, max] = AVATAR_CONFIG.animation.blinkInterval;
            const nextBlink = min + Math.random() * (max - min);
            setTimeout(blink, nextBlink);
        };

        setTimeout(blink, 2000);
    }

    /**
     * Play a blink animation
     */
    playBlink() {
        // This would animate the eyelids in a full implementation
        // For now, we'll toggle visibility briefly
        console.log('👁️ Blink');
    }

    /**
     * Start breathing animation
     */
    startBreathing() {
        const breathe = () => {
            const time = Date.now() * 0.001 * AVATAR_CONFIG.animation.breathingSpeed;
            const breathScale = 1 + Math.sin(time) * 0.02;
            
            if (this.bones.shoulders) {
                this.bones.shoulders.scale.y = breathScale;
            }
            if (this.bones.neck) {
                this.bones.neck.scale.y = breathScale;
            }

            requestAnimationFrame(breathe);
        };

        breathe();
    }

    /**
     * Start subtle idle head movement
     */
    startIdleMovement() {
        if (!AVATAR_CONFIG.animation.idleMovement) return;

        const idleMove = () => {
            const time = Date.now() * 0.0005;
            
            if (this.avatar) {
                this.avatar.rotation.y = Math.sin(time) * 0.05;
                this.avatar.rotation.x = Math.sin(time * 0.7) * 0.02;
            }

            requestAnimationFrame(idleMove);
        };

        idleMove();
    }

    /**
     * Render the scene
     */
    render() {
        if (!this.isInitialized) return;
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Get a bone/part by name
     */
    getBone(name) {
        return this.bones[name];
    }

    /**
     * Get the avatar group
     */
    getAvatar() {
        return this.avatar;
    }
}
