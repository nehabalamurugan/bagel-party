"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

export function fireConfetti() {
  const colors = ["#c4302b", "#ffe87a", "#5b8a45", "#2a5fb3", "#0e1730"];
  confetti({
    particleCount: 80,
    spread: 70,
    startVelocity: 35,
    origin: { y: 0.6 },
    colors,
    ticks: 120,
    scalar: 0.9,
  });
}

export function ConfettiOnMount() {
  useEffect(() => {
    fireConfetti();
  }, []);
  return null;
}
