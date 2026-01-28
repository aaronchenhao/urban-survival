/**
 * © 2024 City Survival Line. All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Activity } from 'lucide-react';

const AmbientSound: React.FC = () => {
  const [isMuted, setIsMuted] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  
  // Simple lock to prevent rapid-fire clicking from breaking AudioContext state
  const isTogglingRef = useRef(false);

  // 初始化音频引擎
  const initAudio = () => {
    if (audioContextRef.current) return;

    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();
    audioContextRef.current = ctx;

    // 主音量控制
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0; // Initialize at 0 for fade in
    masterGain.connect(ctx.destination);
    gainNodeRef.current = masterGain;

    // --- 层级 1: 城市低频轰鸣 (Brown Noise) ---
    const bufferSize = ctx.sampleRate * 2; // 2秒循环
    const brownBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = brownBuffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // 增益补偿
    }

    const brownNoise = ctx.createBufferSource();
    brownNoise.buffer = brownBuffer;
    brownNoise.loop = true;
    
    // 低通滤波器 - 让声音听起来像远处的城市/机械声
    const lowPass = ctx.createBiquadFilter();
    lowPass.type = 'lowpass';
    lowPass.frequency.value = 120; // 仅保留低频

    brownNoise.connect(lowPass);
    lowPass.connect(masterGain);
    brownNoise.start(0);

    // --- 层级 2: 工业电流嗡鸣 (Oscillator Drone) ---
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 55; // A1 (低频)
    
    // 稍微失谐，制造不稳定性
    const osc2 = ctx.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.value = 55.5;

    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.05; // 非常微弱

    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 400;

    // LFO 调制滤波器，让声音有呼吸感
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1; // 10秒一个周期
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 100; // 调制深度
    lfo.connect(lfoGain);
    lfoGain.connect(droneFilter.frequency);
    lfo.start();

    osc.connect(droneFilter);
    osc2.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(masterGain);
    
    osc.start();
    osc2.start();
  };

  const toggleSound = async () => {
    // Prevent overlapping actions
    if (isTogglingRef.current) return;
    isTogglingRef.current = true;

    try {
      if (!audioContextRef.current) {
        initAudio();
        // Allow init to settle slightly
        await new Promise(r => setTimeout(r, 50));
        setIsMuted(false);
        if (audioContextRef.current?.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        // Fade in
        if (gainNodeRef.current && audioContextRef.current) {
            gainNodeRef.current.gain.cancelScheduledValues(audioContextRef.current.currentTime);
            gainNodeRef.current.gain.setValueAtTime(0, audioContextRef.current.currentTime);
            gainNodeRef.current.gain.linearRampToValueAtTime(0.15, audioContextRef.current.currentTime + 0.5);
        }
      } else {
        if (isMuted) {
          // Unmute: Resume -> Fade In
          if (audioContextRef.current.state === 'suspended') {
             await audioContextRef.current.resume();
          }
          if (gainNodeRef.current && audioContextRef.current) {
             gainNodeRef.current.gain.cancelScheduledValues(audioContextRef.current.currentTime);
             gainNodeRef.current.gain.setValueAtTime(0, audioContextRef.current.currentTime);
             gainNodeRef.current.gain.linearRampToValueAtTime(0.15, audioContextRef.current.currentTime + 0.5);
          }
          setIsMuted(false);
        } else {
          // Mute: Fade Out -> Suspend
          if (gainNodeRef.current && audioContextRef.current) {
             gainNodeRef.current.gain.cancelScheduledValues(audioContextRef.current.currentTime);
             gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, audioContextRef.current.currentTime);
             gainNodeRef.current.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 0.3);
          }
          // Wait for fade out then suspend
          await new Promise(r => setTimeout(r, 350));
          if (audioContextRef.current.state === 'running') {
             await audioContextRef.current.suspend();
          }
          setIsMuted(true);
        }
      }
    } catch (e) {
      console.error("Audio Context Error:", e);
    } finally {
      isTogglingRef.current = false;
    }
  };

  return (
    <button
      onClick={toggleSound}
      className={`fixed bottom-4 right-4 z-50 p-2.5 rounded-full border backdrop-blur-md transition-all duration-300 group shadow-xl
        ${!isMuted 
          ? 'bg-cyan-900/80 border-cyan-500/50 text-cyan-400 hover:bg-cyan-900 hover:scale-110 shadow-[0_0_20px_rgba(6,182,212,0.4)]' 
          : 'bg-zinc-900/80 border-zinc-700/50 text-zinc-500 hover:bg-zinc-800 hover:scale-110 hover:text-zinc-300'
        }
      `}
      title={isMuted ? "启用环境音效" : "静音"}
    >
      <div className="relative flex items-center justify-center">
         {!isMuted ? <Volume2 size={20} /> : <VolumeX size={20} />}
         {!isMuted && (
             <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
             </span>
         )}
      </div>
      
      {/* Visualizer bars simulation - Scaled down */}
      {!isMuted && (
        <div className="absolute bottom-1 left-0 w-full flex justify-center gap-0.5 h-full opacity-30 pointer-events-none overflow-hidden rounded-full">
           <div className="w-0.5 bg-cyan-400 animate-[pulse_1s_ease-in-out_infinite] h-1/2 self-end"></div>
           <div className="w-0.5 bg-cyan-400 animate-[pulse_1.5s_ease-in-out_infinite] h-3/4 self-end"></div>
           <div className="w-0.5 bg-cyan-400 animate-[pulse_1.2s_ease-in-out_infinite] h-2/3 self-end"></div>
        </div>
      )}
    </button>
  );
};

export default AmbientSound;