import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import ProductGrid from './components/ProductGrid';
import ProductDetail from './components/ProductDetail';
import AdminPanel from './components/AdminPanel';

// Custom cursor component with glow effect
// const CustomCursor = () => {
//   const cursorRef = useRef(null);
//   const cursorGlowRef = useRef(null);
//   const [isHovering, setIsHovering] = useState(false);

//   useEffect(() => {
//     const cursor = cursorRef.current;
//     const cursorGlow = cursorGlowRef.current;
    
//     const moveCursor = (e) => {
//       const x = e.clientX;
//       const y = e.clientY;
      
//       if (cursor) {
//         cursor.style.left = `${x}px`;
//         cursor.style.top = `${y}px`;
//       }
//       if (cursorGlow) {
//         cursorGlow.style.left = `${x}px`;
//         cursorGlow.style.top = `${y}px`;
//       }
//     };

//     const handleMouseOver = (e) => {
//       if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || 
//           e.target.closest('a') || e.target.closest('button')) {
//         setIsHovering(true);
//       } else {
//         setIsHovering(false);
//       }
//     };

//     window.addEventListener('mousemove', moveCursor);
//     window.addEventListener('mouseover', handleMouseOver);

//     return () => {
//       window.removeEventListener('mousemove', moveCursor);
//       window.removeEventListener('mouseover', handleMouseOver);
//     };
//   }, []);

//   return (
//     <>
//       <div 
//         ref={cursorGlowRef} 
//         className={`fixed w-24 h-24 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[9999] 
//           bg-gradient-radial from-cyan-500/40 to-transparent rounded-full blur-2xl
//           transition-all duration-200 ${isHovering ? 'scale-150 opacity-100' : 'opacity-60'}`}
//       />
//       <div 
//         ref={cursorRef} 
//         className={`fixed w-4 h-4 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[10000] 
//           rounded-full transition-all duration-150
//           ${isHovering 
//             ? 'w-10 h-10 bg-cyan-500/20 border-2 border-cyan-400' 
//             : 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.6)]'}`}
//       />
//     </>
//   );
// };

const CustomCursor = () => {
  const dotRef = useRef(null);
  const glowRef = useRef(null);

  const mouse = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const render = () => {
      pos.current.x += (mouse.current.x - pos.current.x) * 0.18;
      pos.current.y += (mouse.current.y - pos.current.y) * 0.18;

      const x = pos.current.x;
      const y = pos.current.y;

      dotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      glowRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;

      requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", onMouseMove);
    requestAnimationFrame(render);

    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  return (
    <>
      {/* Glow */}
      <div
        ref={glowRef}
        className="fixed top-0 left-0 w-32 h-32 -translate-x-1/2 -translate-y-1/2
          pointer-events-none z-[9998]
          bg-gradient-radial from-cyan-400/30 to-transparent
          blur-3xl"
      />

      {/* Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-3 h-3 -translate-x-1/2 -translate-y-1/2
          pointer-events-none z-[9999]
          rounded-full bg-cyan-400
          shadow-[0_0_12px_rgba(34,211,238,0.9)]"
      />
    </>
  );
};

const ParticleField = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 60;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.size = Math.random() * 2 + 0.5;
        this.opacity = Math.random() * 0.4 + 0.1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 200, 255, ${this.opacity})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[1] opacity-40" />;
};

const ScrollProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setProgress(scrollPercent);
    };

    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-[3px] z-[9998] bg-white/5">
      <div 
        className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

const PageTransition = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('fadeOut');
    }
  }, [location, displayLocation]);

  return (
    <div
      className={`transition-all duration-500 ${
        transitionStage === 'fadeOut' 
          ? 'opacity-0 blur-sm scale-95' 
          : 'opacity-100 blur-0 scale-100'
      }`}
      onTransitionEnd={() => {
        if (transitionStage === 'fadeOut') {
          setTransitionStage('fadeIn');
          setDisplayLocation(location);
        }
      }}
    >
      <Routes location={displayLocation}>
        <Route path="/" element={<ProductGrid />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </div>
  );
};

function App() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-[#0a0a0f] text-gray-200 overflow-x-hidden ">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div 
            className="absolute inset-0 opacity-100"
            style={{
              background: `
                radial-gradient(at 40% 20%, rgba(29, 78, 216, 0.3) 0px, transparent 50%),
                radial-gradient(at 80% 0%, rgba(6, 182, 212, 0.15) 0px, transparent 50%),
                radial-gradient(at 0% 50%, rgba(59, 130, 246, 0.2) 0px, transparent 50%),
                radial-gradient(at 80% 50%, rgba(6, 182, 212, 0.1) 0px, transparent 50%),
                radial-gradient(at 0% 100%, rgba(29, 78, 216, 0.2) 0px, transparent 50%)
              `
            }}
          />
          
          <div className="absolute inset-0 bg-gradient-radial from-blue-900/10 via-transparent to-transparent" />
          
          <div 
            className="absolute w-[600px] h-[600px] rounded-full opacity-100 transition-all duration-300 blur-3xl"
            style={{
              background: `radial-gradient(circle at center, rgba(29, 78, 216, 0.15), transparent 80%)`,
              left: `${mousePosition.x - 300}px`,
              top: `${mousePosition.y - 300}px`,
            }}
          />
          
          <div 
            className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
            }}
          />
          
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/70 opacity-60" />
        </div>

        <ParticleField />

        <CustomCursor />

        <ScrollProgress />

        <header className="sticky top-0 z-[1000] backdrop-blur-xl bg-[rgba(20,21,30,0.7)] border-b border-white/5 
          shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-slideDown">
          <div className="absolute w-[600px] h-[600px] bg-cyan-500 rounded-full blur-[150px] 
            opacity-15 -top-48 -left-48 animate-pulse-glow" />
          <div className="absolute w-[500px] h-[500px] bg-blue-700 rounded-full blur-[150px] 
            opacity-15 -top-36 -right-36 animate-pulse-glow-delayed" />
          
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex justify-between items-center">
              <Link 
                to="/" 
                className="flex flex-col gap-1 relative group transition-transform duration-[600ms] 
                  ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] hover:scale-105"
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                  w-[150%] h-[150%] bg-gradient-radial from-cyan-500/40 to-transparent 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-400 
                  bg-clip-text text-transparent tracking-tight">
                  Shop-Keep
                </h1>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium 
                  bg-gradient-to-r from-gray-400 via-cyan-400 to-gray-400 bg-[length:200%_auto] 
                  bg-clip-text text-transparent animate-shimmer">
                  E-Commerce
                </p>
              </Link>
              
              <nav className="flex gap-6">
                <Link 
                  to="/" 
                  className="relative px-6 py-2 text-gray-300 font-medium rounded-lg 
                    overflow-hidden group transition-all duration-300 hover:text-white 
                    hover:-translate-y-0.5"
                >
                  <span className="relative z-10">Store</span>
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                    w-0 h-full bg-gradient-to-r from-blue-600 to-cyan-400 opacity-0 
                    group-hover:w-full group-hover:opacity-15 transition-all duration-300 
                    rounded-lg" />
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 
                    bg-gradient-to-r from-blue-600 to-cyan-400 
                    group-hover:w-full transition-all duration-300 
                    shadow-[0_0_10px_rgba(34,211,238,0.6)]" />
                </Link>
                
                <Link 
                  to="/admin" 
                  className="relative px-6 py-2 text-gray-300 font-medium rounded-lg 
                    overflow-hidden group transition-all duration-300 hover:text-white 
                    hover:-translate-y-0.5"
                >
                  <span className="relative z-10">Admin</span>
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                    w-0 h-full bg-gradient-to-r from-blue-600 to-cyan-400 opacity-0 
                    group-hover:w-full group-hover:opacity-15 transition-all duration-300 
                    rounded-lg" />
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 
                    bg-gradient-to-r from-blue-600 to-cyan-400 
                    group-hover:w-full transition-all duration-300 
                    shadow-[0_0_10px_rgba(34,211,238,0.6)]" />
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="relative z-[2] min-h-[calc(100vh-200px)]">
          <PageTransition />
        </main>

        <footer className="relative z-[2] mt-20 backdrop-blur-xl bg-[rgba(20,21,30,0.7)] 
          border-t border-white/5 shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <p className="text-center text-gray-400 text-sm">
              
              <span className="mx-3 text-gray-600">•</span>
              <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]">
              
              </span>
              <span className="mx-3 text-gray-600">•</span>
              
              <span className="mx-3 text-gray-600">•</span>
              
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;