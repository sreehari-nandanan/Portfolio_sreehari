import { useEffect, useRef, useState } from 'react';
import './HiddenGame.css';

export default function HiddenGame({ onClose }) {
    const canvasRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [showCountdown, setShowCountdown] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const [score, setScore] = useState(0);

    const startWithCountdown = () => {
        setGameOver(false);
        setScore(0);
        setShowCountdown(true);
        setCountdown(3);

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setShowCountdown(false);
                    setIsPlaying(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 800);
    };

    useEffect(() => {
        if (!isPlaying) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let animationId;
        let frameCount = 0;

        const drone = {
            x: canvas.width / 2,
            y: canvas.height - 80,
            width: 40,
            height: 40,
            speed: 7,
            dx: 0
        };

        const obstacles = [];
        const particles = [];
        let currentScore = 0;

        // Drone rendering (A futuristic quadcopter top-down view)
        const drawDrone = (x, y) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.fillStyle = '#FF5A00'; // Primary brand color
            // Central body
            ctx.fillRect(-10, -10, 20, 20);
            ctx.fillStyle = '#fff';
            // Arms
            ctx.fillRect(-20, -20, 10, 10);
            ctx.fillRect(10, -20, 10, 10);
            ctx.fillRect(-20, 10, 10, 10);
            ctx.fillRect(10, 10, 10, 10);
            // Props spinning
            const spin = (frameCount * 0.5) % Math.PI;
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.beginPath();
            ctx.arc(-15, -15, 8, spin, spin + Math.PI);
            ctx.arc(15, -15, 8, -spin, -spin + Math.PI);
            ctx.arc(-15, 15, 8, -spin, -spin + Math.PI);
            ctx.arc(15, 15, 8, spin, spin + Math.PI);
            ctx.stroke();
            ctx.restore();
        };

        const keydownHandler = (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') drone.dx = -drone.speed;
            if (e.key === 'ArrowRight' || e.key === 'd') drone.dx = drone.speed;
        };

        const keyupHandler = (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') { if (drone.dx < 0) drone.dx = 0; }
            if (e.key === 'ArrowRight' || e.key === 'd') { if (drone.dx > 0) drone.dx = 0; }
        };

        window.addEventListener('keydown', keydownHandler);
        window.addEventListener('keyup', keyupHandler);

        const loop = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            frameCount++;

            // Starfield background vertical scroll
            ctx.fillStyle = '#FFF';
            if (frameCount % 3 === 0) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: -10,
                    size: Math.random() * 2,
                    speed: Math.random() * 5 + 2
                });
            }

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.y += p.speed;
                ctx.globalAlpha = 0.5;
                ctx.fillRect(p.x, p.y, p.size, p.size);
                ctx.globalAlpha = 1;
                if (p.y > canvas.height) particles.splice(i, 1);
            }

            // Update Drone
            drone.x += drone.dx;
            if (drone.x < 20) drone.x = 20;
            if (drone.x > canvas.width - 20) drone.x = canvas.width - 20;

            drawDrone(drone.x, drone.y);

            // Obstacles logic
            // Increase difficulty smoothly
            const spawnRate = Math.max(20, 60 - Math.floor(currentScore / 100));
            if (frameCount % spawnRate === 0) {
                obstacles.push({
                    x: Math.random() * (canvas.width - 40) + 20,
                    y: -30,
                    width: Math.random() * 40 + 20,
                    height: 20,
                    speed: Math.random() * 3 + 4 + (currentScore / 500)
                });
            }

            currentScore++;
            setScore(currentScore);

            for (let i = obstacles.length - 1; i >= 0; i--) {
                const obs = obstacles[i];
                obs.y += obs.speed;

                ctx.fillStyle = '#e74c3c';
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#e74c3c';
                ctx.fillRect(obs.x - obs.width / 2, obs.y - obs.height / 2, obs.width, obs.height);
                ctx.shadowBlur = 0; // reset

                // Collision detection
                if (
                    drone.x < obs.x + obs.width / 2 &&
                    drone.x + 20 > obs.x - obs.width / 2 &&
                    drone.y < obs.y + obs.height / 2 &&
                    drone.y + 20 > obs.y - obs.height / 2
                ) {
                    setIsPlaying(false);
                    setGameOver(true);
                }

                if (obs.y > canvas.height + 30) {
                    obstacles.splice(i, 1);
                }
            }

            // Score HUD
            ctx.fillStyle = 'white';
            ctx.font = '20px Oswald';
            ctx.fillText(`SCORE: ${currentScore}`, 20, 40);

            animationId = requestAnimationFrame(loop);
        };

        animationId = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('keydown', keydownHandler);
            window.removeEventListener('keyup', keyupHandler);
            cancelAnimationFrame(animationId);
        };
    }, [isPlaying]);

    return (
        <div className="hidden-game-overlay">
            <div className="hidden-game-container">
                <button className="close-game-btn" onClick={onClose}>&times;</button>

                {showCountdown && (
                    <div className="game-countdown-overlay">
                        <div className="countdown-number">{countdown}</div>
                        <div className="countdown-text">PREPARING FOR TAKEOFF...</div>
                    </div>
                )}

                {!isPlaying && !gameOver && !showCountdown && (
                    <div className="game-menu glass-card">
                        <h1 className="game-title glow-on-hover">DRONE SIMULATOR</h1>
                        <p className="game-inst">Use LEFT/RIGHT arrow keys or A/D to dodge obstacles.</p>
                        <button className="btn-primary" onClick={startWithCountdown} style={{ marginTop: '2rem' }}>
                            START GAME
                        </button>
                    </div>
                )}

                {gameOver && !showCountdown && (
                    <div className="game-menu glass-card">
                        <h1 className="game-title" style={{ color: '#e74c3c' }}>DRONE CRASHED</h1>
                        <h2 style={{ color: 'white', marginBottom: '1.5rem', fontFamily: 'var(--ff-display)', fontSize: '2.2rem' }}>SCORE: {score}</h2>
                        <button className="btn-primary" onClick={startWithCountdown}>
                            RETRY
                        </button>
                    </div>
                )}

                <canvas
                    ref={canvasRef}
                    width={600}
                    height={700}
                    className="game-canvas"
                    style={{ display: isPlaying ? 'block' : 'none' }}
                />
            </div>
        </div>
    );
}
