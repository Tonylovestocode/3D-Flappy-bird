import * as THREE from 'https://unpkg.com/three@0.163.0/build/three.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 12, 52);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 2.5, 8);
camera.lookAt(0, 2.5, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x5a7f6b, 0.8);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
dirLight.position.set(6, 14, 10);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(1024, 1024);
dirLight.shadow.camera.left = -20;
dirLight.shadow.camera.right = 20;
dirLight.shadow.camera.top = 20;
dirLight.shadow.camera.bottom = -20;
scene.add(dirLight);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(220, 20),
  new THREE.MeshStandardMaterial({ color: 0x67a85f })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -2;
ground.receiveShadow = true;
scene.add(ground);

const bird = new THREE.Group();
const body = new THREE.Mesh(
  new THREE.SphereGeometry(0.45, 24, 20),
  new THREE.MeshStandardMaterial({ color: 0xffdf42, roughness: 0.4, metalness: 0.1 })
);
body.castShadow = true;
bird.add(body);

const beak = new THREE.Mesh(
  new THREE.ConeGeometry(0.14, 0.45, 10),
  new THREE.MeshStandardMaterial({ color: 0xff8a00 })
);
beak.rotation.z = -Math.PI / 2;
beak.position.set(0.5, 0, 0);
beak.castShadow = true;
bird.add(beak);

const wingGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.24);
const wingMat = new THREE.MeshStandardMaterial({ color: 0xf2c938 });
const leftWing = new THREE.Mesh(wingGeometry, wingMat);
const rightWing = new THREE.Mesh(wingGeometry, wingMat);
leftWing.position.set(-0.1, 0, 0.45);
rightWing.position.set(-0.1, 0, -0.45);
leftWing.castShadow = true;
rightWing.castShadow = true;
bird.add(leftWing);
bird.add(rightWing);

bird.position.set(-2, 2.2, 0);
scene.add(bird);

const pipeMaterial = new THREE.MeshStandardMaterial({ color: 0x2d8f3d, roughness: 0.55 });
const pipeGeometry = new THREE.CylinderGeometry(0.65, 0.65, 1, 16);

const pipes = [];
const state = {
  started: false,
  gameOver: false,
  velocityY: 0,
  gravity: -16,
  flapStrength: 7,
  pipeSpeed: 7,
  spawnTimer: 0,
  spawnEvery: 1.7,
  score: 0,
};

const scoreEl = document.getElementById('score');
const messageEl = document.getElementById('message');

function createPipePair() {
  const gapCenter = THREE.MathUtils.randFloat(-0.2, 3.3);
  const gapSize = 2.5;
  const x = 18;

  const bottomHeight = Math.max(0.8, gapCenter - gapSize / 2 + 2);
  const topHeight = Math.max(0.8, 8 - (gapCenter + gapSize / 2));

  const bottomPipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
  bottomPipe.scale.y = bottomHeight;
  bottomPipe.position.set(x, -2 + bottomHeight / 2, 0);
  bottomPipe.castShadow = true;

  const topPipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
  topPipe.scale.y = topHeight;
  topPipe.position.set(x, gapCenter + gapSize / 2 + topHeight / 2, 0);
  topPipe.castShadow = true;

  scene.add(bottomPipe, topPipe);
  pipes.push({ bottomPipe, topPipe, x, gapCenter, gapSize, scored: false });
}

function flap() {
  if (state.gameOver) {
    restart();
    return;
  }

  if (!state.started) {
    state.started = true;
    messageEl.textContent = '';
  }

  state.velocityY = state.flapStrength;
}

function restart() {
  pipes.forEach((pipePair) => {
    scene.remove(pipePair.bottomPipe, pipePair.topPipe);
    pipePair.bottomPipe.geometry.dispose();
    pipePair.topPipe.geometry.dispose();
  });

  pipes.length = 0;
  state.started = false;
  state.gameOver = false;
  state.velocityY = 0;
  state.spawnTimer = 0;
  state.score = 0;

  bird.position.y = 2.2;
  bird.rotation.z = 0;

  scoreEl.textContent = 'Score: 0';
  messageEl.textContent = 'Press Space / Click to Start';
}

function triggerGameOver() {
  state.gameOver = true;
  state.started = false;
  messageEl.textContent = `Game Over\nScore: ${state.score}\nPress Space / Click to Restart`;
}

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    flap();
  }
});
window.addEventListener('pointerdown', flap);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();

function intersectsPipe(pipePair) {
  const birdRadius = 0.43;
  const birdX = bird.position.x;
  const birdY = bird.position.y;
  const halfPipeWidth = 0.7;

  const nearInX = Math.abs(pipePair.x - birdX) < halfPipeWidth + birdRadius;
  const lowerGap = pipePair.gapCenter - pipePair.gapSize / 2;
  const upperGap = pipePair.gapCenter + pipePair.gapSize / 2;
  const inGap = birdY - birdRadius > lowerGap && birdY + birdRadius < upperGap;

  return nearInX && !inGap;
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.033);

  if (!state.gameOver) {
    if (state.started) {
      state.velocityY += state.gravity * dt;
      bird.position.y += state.velocityY * dt;
      bird.rotation.z = THREE.MathUtils.clamp(-state.velocityY * 0.06, -0.7, 0.6);

      state.spawnTimer += dt;
      if (state.spawnTimer >= state.spawnEvery) {
        state.spawnTimer = 0;
        createPipePair();
      }

      for (let i = pipes.length - 1; i >= 0; i -= 1) {
        const pair = pipes[i];
        pair.x -= state.pipeSpeed * dt;
        pair.bottomPipe.position.x = pair.x;
        pair.topPipe.position.x = pair.x;

        if (!pair.scored && pair.x < bird.position.x) {
          pair.scored = true;
          state.score += 1;
          scoreEl.textContent = `Score: ${state.score}`;
        }

        if (intersectsPipe(pair)) {
          triggerGameOver();
        }

        if (pair.x < -18) {
          scene.remove(pair.bottomPipe, pair.topPipe);
          pipes.splice(i, 1);
        }
      }

      if (bird.position.y < -1.55 || bird.position.y > 8) {
        triggerGameOver();
      }
    } else {
      bird.position.y = 2.2 + Math.sin(performance.now() * 0.004) * 0.15;
      bird.rotation.z = 0;
    }

    const wing = Math.sin(performance.now() * 0.03) * 0.4;
    leftWing.rotation.y = wing;
    rightWing.rotation.y = -wing;
  }

  camera.position.y = THREE.MathUtils.lerp(camera.position.y, bird.position.y + 0.35, 0.07);
  camera.lookAt(0, camera.position.y - 0.2, 0);
  renderer.render(scene, camera);
}

animate();
