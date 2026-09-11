import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function NetworkMesh3D({ className = '', count = 45, maxDistance = 3.5 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 500;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Particle nodes
    const particlePositions = new Float32Array(count * 3);
    const particleVelocities = [];

    for (let i = 0; i < count; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 18;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 8;

      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.008,
        y: (Math.random() - 0.5) * 0.008,
        z: (Math.random() - 0.5) * 0.005
      });
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xd4af37,
      size: 0.26,
      transparent: true,
      opacity: 0.75
    });

    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);

    // Lines connecting nearby nodes
    const maxLines = (count * (count - 1)) / 2;
    const linePositions = new Float32Array(maxLines * 6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x78716c,
      transparent: true,
      opacity: 0.22
    });

    const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineSegments);

    // Mouse movement parallax
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const onMouseMove = (event) => {
      const rect = container.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      targetMouseX = x * 2.5;
      targetMouseY = -y * 2.5;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // Resize listener
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', onResize);

    // Animation loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!prefersReducedMotion) {
        // Smooth camera drift towards mouse
        currentMouseX += (targetMouseX - currentMouseX) * 0.05;
        currentMouseY += (targetMouseY - currentMouseY) * 0.05;
        camera.position.x = currentMouseX;
        camera.position.y = currentMouseY;
        camera.lookAt(0, 0, 0);

        // Update positions of particles
        const pos = particlesGeometry.attributes.position.array;
        let lineVertexCount = 0;

        for (let i = 0; i < count; i++) {
          pos[i * 3] += particleVelocities[i].x;
          pos[i * 3 + 1] += particleVelocities[i].y;
          pos[i * 3 + 2] += particleVelocities[i].z;

          // Bounce back from boundaries
          if (pos[i * 3] < -10 || pos[i * 3] > 10) particleVelocities[i].x *= -1;
          if (pos[i * 3 + 1] < -7 || pos[i * 3 + 1] > 7) particleVelocities[i].y *= -1;
          if (pos[i * 3 + 2] < -5 || pos[i * 3 + 2] > 5) particleVelocities[i].z *= -1;

          // Connect nearby nodes
          for (let j = i + 1; j < count; j++) {
            const dx = pos[i * 3] - pos[j * 3];
            const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
            const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < maxDistance) {
              const linePos = lineGeometry.attributes.position.array;
              linePos[lineVertexCount * 3] = pos[i * 3];
              linePos[lineVertexCount * 3 + 1] = pos[i * 3 + 1];
              linePos[lineVertexCount * 3 + 2] = pos[i * 3 + 2];

              linePos[lineVertexCount * 3 + 3] = pos[j * 3];
              linePos[lineVertexCount * 3 + 4] = pos[j * 3 + 1];
              linePos[lineVertexCount * 3 + 5] = pos[j * 3 + 2];

              lineVertexCount += 2;
            }
          }
        }

        particlesGeometry.attributes.position.needsUpdate = true;
        lineGeometry.setDrawRange(0, lineVertexCount);
        lineGeometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
    };
  }, [count, maxDistance]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
    />
  );
}
