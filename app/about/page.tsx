'use client';

import { useEffect } from 'react';

export default function AboutPage() {
  useEffect(() => {
    // 隐藏 Header、Sidebar 和 Footer，移除 main 内边距
    const hideLayoutElements = () => {
      // 隐藏所有 header 元素
      document.querySelectorAll('header').forEach(header => {
        (header as HTMLElement).style.display = 'none';
      });

      // 隐藏所有 footer 元素
      document.querySelectorAll('footer').forEach(footer => {
        (footer as HTMLElement).style.display = 'none';
      });

      // 隐藏侧边栏 (有 border-r 类的 div)
      document.querySelectorAll('div.border-r').forEach(sidebar => {
        (sidebar as HTMLElement).style.display = 'none';
      });

      // 移除 main 元素的内边距
      document.querySelectorAll('main.flex-1').forEach(main => {
        (main as HTMLElement).style.padding = '0';
      });
    };

    // 生成月光粒子
    const createParticles = () => {
      const container = document.getElementById('particles');
      if (!container) return;

      const particleCount = 30;

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'moon-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';
        container.appendChild(particle);
      }
    };

    // 滚动视差效果
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallax = document.querySelectorAll('.glass');
      parallax.forEach((el, index) => {
        const speed = 0.5 + (index * 0.1);
        (el as HTMLElement).style.transform = `translateY(${scrolled * speed * 0.1}px)`;
      });
    };

    // 鼠标跟随微光效果
    const handleMouseMove = (e: MouseEvent) => {
      const glow = document.querySelector('.fixed.rounded-full');
      if (glow) {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        (glow as HTMLElement).style.transform = `translate(${x * 20}px, ${y * 20}px)`;
      }
    };

    hideLayoutElements();
    createParticles();
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      {/* 自定义样式 */}
      <style jsx global>{`
        :root {
          --moon-glow: rgba(251, 243, 219, 0.6);
          --path-brown: #8b7355;
          --soft-gray: #6b7280;
          --warm-white: #fafaf9;
        }

        body {
          font-family: 'Noto Sans SC', sans-serif;
          background: linear-gradient(180deg, #fafaf9 0%, #f5f5f0 100%);
          overflow-x: hidden;
        }

        .serif {
          font-family: 'Noto Serif SC', serif;
        }

        /* 月光粒子效果 */
        .moon-particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: rgba(251, 243, 219, 0.8);
          border-radius: 50%;
          pointer-events: none;
          animation: float 15s infinite ease-in-out;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
        }

        /* 文字渐显动画 */
        .reveal-text {
          opacity: 0;
          transform: translateY(20px);
          animation: reveal 1s ease-out forwards;
        }

        @keyframes reveal {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* 悬停时的微妙光晕 */
        .hover-glow {
          transition: all 0.4s ease;
        }

        .hover-glow:hover {
          text-shadow: 0 0 20px rgba(251, 243, 219, 0.6);
          transform: translateY(-2px);
        }

        /* 分隔线动画 */
        .divider {
          width: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #d4c4b0, transparent);
          animation: expand 2s ease-out forwards;
          animation-delay: 0.5s;
        }

        @keyframes expand {
          to { width: 100%; }
        }

        /* 路径装饰线 */
        .path-line {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: draw 3s ease-out forwards;
        }

        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }

        /* 温柔的脉冲效果 */
        .gentle-pulse {
          animation: gentlePulse 4s infinite ease-in-out;
        }

        @keyframes gentlePulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        /* 玻璃态效果 */
        .glass {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }
      `}</style>

      {/* Google 字体链接 */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;500;600&family=Noto+Sans+SC:wght@300;400;500&display=swap" rel="stylesheet" />

      {/* 背景月光粒子容器 */}
      <div id="particles" className="fixed inset-0 pointer-events-none z-0"></div>

      {/* 顶部月亮装饰 */}
      <div className="fixed top-10 right-10 w-32 h-32 rounded-full bg-gradient-to-br from-amber-50 to-orange-100 opacity-40 blur-3xl gentle-pulse z-0"></div>
      <div className="fixed top-16 right-16 w-24 h-24 rounded-full bg-gradient-to-br from-yellow-50 to-amber-100 opacity-30 blur-2xl z-0"></div>

      {/* 主要内容 */}
      <main className="relative z-10 max-w-3xl mx-auto px-6 py-12 md:py-20">

        {/* 标题区 */}
        <header className="text-center mb-12">
          <div className="inline-block">
            <h1 className="serif text-4xl md:text-5xl font-light text-stone-800 mb-4 tracking-widest reveal-text" style={{animationDelay: '0.2s'}}>
              关于我们
            </h1>
            <div className="divider mx-auto mt-6"></div>
          </div>
        </header>

        {/* 核心引言 */}
        <section className="mb-12 text-center">
          <p className="serif text-xl md:text-2xl font-light text-stone-600 leading-relaxed reveal-text hover-glow cursor-default" style={{animationDelay: '0.4s'}}>
            我们这一代人，好像天生带着矛盾的气质——
          </p>
          <p className="serif text-2xl md:text-3xl font-medium text-stone-800 mt-4 leading-relaxed reveal-text" style={{animationDelay: '0.6s'}}>
            既<span className="text-amber-700/80">彷徨</span>，又<span className="text-stone-900">个性</span>；
            <br className="md:hidden" />
            既<span className="text-amber-700/80">胆怯</span>，又<span className="text-stone-900">勇敢</span>。
          </p>
        </section>

        {/* 场景描述 */}
        <section className="mb-12 space-y-6">
          {/* 年末场景 */}
          <div className="glass rounded-2xl p-6 md:p-8 reveal-text hover:shadow-lg transition-shadow duration-500 text-center" style={{animationDelay: '0.8s'}}>
            <div className="flex flex-col items-center space-y-3">
              <span className="serif text-2xl text-amber-600/60 font-light">年末</span>
              <div className="flex-1">
                <p className="text-stone-600 leading-relaxed text-base">
                  深夜，兴奋又胆怯地写下年度复盘。<br />
                  <span className="text-stone-400 text-sm mt-1 block">
                    兴奋的是，今年确实比往年好了一点；<br />
                    胆怯的是，不知道这一点，够不够好。
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* 年初场景 */}
          <div className="glass rounded-2xl p-6 md:p-8 reveal-text hover:shadow-lg transition-shadow duration-500 text-center" style={{animationDelay: '1s'}}>
            <div className="flex flex-col items-center space-y-3">
              <span className="serif text-3xl text-amber-600/60 font-light">年初</span>
              <div className="flex-1">
                <p className="text-stone-600 leading-relaxed text-base">
                  清晨，激情满满地立下年度目标，<br />
                  恨不得一年之内完成社会意义上的「逆袭」。<br />
                  <span className="text-stone-400 text-sm mt-1 block">
                    但我们心里清楚，逆天改命的故事，从不会在一瞬间发生。
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 核心理念 */}
        <section className="text-center mb-12 reveal-text" style={{animationDelay: '1.2s'}}>
          <div className="relative py-8">
            {/* 装饰路径线 SVG */}
            <svg className="absolute left-1/2 top-0 -translate-x-1/2 w-full h-full pointer-events-none opacity-30" viewBox="0 0 400 200" preserveAspectRatio="none">
              <path d="M 50 150 Q 200 50 350 150" fill="none" stroke="#d4c4b0" strokeWidth="1" className="path-line" />
            </svg>

            <p className="serif text-xl md:text-2xl font-light text-stone-700 mb-3">
              于是我们选择——
            </p>
            <p className="serif text-2xl md:text-3xl font-medium text-stone-800 tracking-wider leading-relaxed">
              <span className="text-amber-700/80">抬头望月</span>，
              <br className="md:hidden" />
              也<span className="text-stone-900">低头踏路</span>。
            </p>
          </div>
        </section>

        {/* 使命陈述 */}
        <section className="mb-12 text-center reveal-text" style={{animationDelay: '1.4s'}}>
          <p className="text-stone-600 leading-relaxed text-base max-w-2xl mx-auto">
            如何做一个<span className="text-stone-800 font-medium">长期主义者</span>？<br />
            如何让这段漫长的旅程更清晰、更笃定？<br />
            <span className="text-stone-400 mt-2 block">这是我们想和你一起探索的事。</span>
          </p>
        </section>

        {/* 祝福语 */}
        <section className="text-center pb-12 reveal-text" style={{animationDelay: '1.6s'}}>
          <div className="inline-block glass rounded-full px-8 py-5">
            <p className="serif text-lg text-stone-700 mb-1">愿你在人生搭子社区里</p>
            <p className="serif text-xl md:text-2xl font-medium text-stone-800">
              有所收获，<span className="text-amber-700/80 relative">
                举一反「三」
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-amber-600/30"></span>
              </span>
            </p>
            <p className="text-stone-400 text-xs mt-3 tracking-widest">
              举一反三，也举 AI 反三
            </p>
          </div>
        </section>

        {/* 底部装饰 */}
        <footer className="text-center text-stone-400 text-sm reveal-text" style={{animationDelay: '1.8s'}}>
          <div className="w-12 h-px bg-stone-300 mx-auto mb-3"></div>
          <p>人生搭子 · 与你同行</p>
        </footer>
      </main>
    </>
  );
}