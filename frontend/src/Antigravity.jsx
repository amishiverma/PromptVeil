import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const AntigravityParticles = ({
  count = 300,
  magnetRadius = 6,
  ringRadius = 7,
  waveSpeed = 0.4,
  waveAmplitude = 1,
  particleSize = 1.5,
  lerpSpeed = 0.05,
  color = "#5227FF",
  autoAnimate = true,
  particleVariance = 1,
  rotationSpeed = 0,
  depthFactor = 1,
  pulseSpeed = 3,
  particleShape = "capsule",
  fieldStrength = 10
}) => {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Generate initial particle properties based on provided props
  const particles = useMemo(() => {
    const p = [];
    for (let i = 0; i < count; i++) {
        // distribute along a ring
        const angle = (i / count) * Math.PI * 2;
        // Apply particleVariance to randomize radius slightly
        const radius = ringRadius + (Math.random() - 0.5) * particleVariance * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        // spread on the Z axis 
        const z = (Math.random() - 0.5) * depthFactor * 2;

        const size = particleSize * (0.5 + Math.random() * particleVariance * 0.5);

        p.push({
            angle,
            baseRadius: radius,
            x, y, z,
            cx: x, cy: y, cz: z, // current physics
            size,
            phase: Math.random() * Math.PI * 2, // for individual wave offsets
        });
    }
    return p;
  }, [count, ringRadius, particleVariance, particleSize, depthFactor]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    // Normalize mouse pointer coordinates relative to the canvas and scale by 10 for interactive distance
    const vec = new THREE.Vector3(state.pointer.x * 12, state.pointer.y * 12, 0);

    particles.forEach((p, i) => {
      // Calculate baseline targeted position based on ring and animations
      let targetX = Math.cos(p.angle) * p.baseRadius;
      let targetY = Math.sin(p.angle) * p.baseRadius;
      let targetZ = p.z;

      if (autoAnimate) {
        const currentAngle = p.angle + time * rotationSpeed;
        const waveOffset = Math.sin(p.phase + time * waveSpeed) * waveAmplitude;
        const currentRadius = p.baseRadius + waveOffset;

        targetX = Math.cos(currentAngle) * currentRadius;
        targetY = Math.sin(currentAngle) * currentRadius;
        targetZ = p.z + Math.cos(p.phase + time * pulseSpeed) * waveAmplitude * 0.3;
      }

      // Magnetic field reacting (Repel/Attract logic)
      const dx = targetX - vec.x;
      const dy = targetY - vec.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < magnetRadius) {
        // Strong repel logic based on fieldStrength prop
        const force = (magnetRadius - dist) / magnetRadius * fieldStrength;
        targetX += (dx / dist) * force;
        targetY += (dy / dist) * force;
        targetZ += fieldStrength * 0.5; // pushed outward (3D depth)
      }

      // Smooth interpolation to target coords using lerpSpeed
      p.cx += (targetX - p.cx) * lerpSpeed;
      p.cy += (targetY - p.cy) * lerpSpeed;
      p.cz += (targetZ - p.cz) * lerpSpeed;

      dummy.position.set(p.cx, p.cy, p.cz);
      
      // Rotate dynamically for visual interest
      dummy.rotation.x = time * p.phase * 0.2;
      dummy.rotation.y = time * p.phase * 0.2;
      dummy.scale.setScalar(p.size);
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Select geometry based on the `particleShape` prop
  const geometry = particleShape === "capsule" 
    ? <capsuleGeometry args={[0.05, 0.3, 4, 8]} />
    : <sphereGeometry args={[0.1, 8, 8]} />;

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      {geometry}
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={0.8} 
        transparent 
        opacity={0.8}
        roughness={0.2}
        metalness={0.8}
      />
    </instancedMesh>
  );
};

export default function Antigravity(props) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'auto' }}>
      <Canvas 
        camera={{ position: [0, 0, 15], fov: 60 }} 
        dpr={[1, 2]} 
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <AntigravityParticles {...props} />
      </Canvas>
    </div>
  );
}
