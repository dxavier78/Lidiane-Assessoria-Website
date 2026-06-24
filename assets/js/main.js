        document.addEventListener("DOMContentLoaded", () => {
            gsap.registerPlugin(ScrollTrigger, Flip);

            // 1. Lenis Smooth Scrolling (Crucial para o efeito Apple do vídeo)
            const lenis = new Lenis({
                duration: 1.5,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                direction: 'vertical',
                gestureDirection: 'vertical',
                smooth: true,
                smoothTouch: false, // Deixa nativo no mobile para melhor performance
            });

            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
            lenis.on('scroll', ScrollTrigger.update);
            // Update header theme based on visible section (light/dark)
            const header = document.getElementById('main-header');
            const sections = document.querySelectorAll('[data-theme]');
            const themeObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const theme = entry.target.getAttribute('data-theme');
                        header.classList.toggle('header-light', theme === 'light');
                        header.classList.toggle('header-dark', theme === 'dark');
                    }
                });
            }, { root: null, threshold: 0.5 });
            sections.forEach(sec => themeObserver.observe(sec));
            gsap.ticker.add((time) => { lenis.raf(time * 1000); });
            gsap.ticker.lagSmoothing(0, 0);

            // 2. Animação de Entrada
            const splitText = new SplitType('.split-text', { types: 'words' });
            const splitAccent = new SplitType('.split-accent', { types: 'words' });
            
            // Video Element setup
            const heroVideo = document.getElementById('hero-video');
            
            // Prevenir dupla inicialização do GSAP se os eventos dispararem duas vezes
            let heroGSAPInitialized = false;

            // Garantir que o video.duration esteja disponível antes de criar a timeline
            if (heroVideo) {
                heroVideo.addEventListener('loadedmetadata', initHeroGSAP);
                if (heroVideo.readyState >= 1) {
                    initHeroGSAP();
                }
            } else {
                initHeroGSAP();
            }

            function initHeroGSAP() {
                if (heroGSAPInitialized) return;
                heroGSAPInitialized = true;

                // A master timeline que vai durar por toda a seção do hero
                const masterTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: "#hero-container",
                        start: "top top",
                        end: "+=300%", // Cria 300vh de distância de scroll controlada
                        scrub: 1.5,
                        pin: ".hero-pin" // Pin manual na div interna
                    }
                });

                // --- GLOW (0% a 100%) ---
                masterTl.to('.hero-glow', {
                    opacity: 0.8,
                    duration: 0.35, // Fase 1
                    ease: "power2.inOut"
                }, 0)
                .to('.hero-glow', {
                    opacity: 0.8,
                    duration: 0.3, // Fase 2
                }, 0.35)
                .to('.hero-glow', {
                    opacity: 0,
                    duration: 0.35, // Fase 3
                    ease: "power2.inOut"
                }, 0.65);

                // --- FASE 1: ENTRADA DOS TEXTOS (0% a 35%) ---
                masterTl.fromTo('.hero-text-wrapper', {
                    opacity: 0,
                    filter: "blur(30px)",
                    scale: 0.85,
                    y: 100,
                    rotationX: -10
                }, {
                    opacity: 1,
                    filter: "blur(0px)",
                    scale: 1,
                    y: 0,
                    rotationX: 0,
                    duration: 0.35,
                    ease: "power2.out"
                }, 0);
                
                // Words stagger anim (com fallback de array vazio caso o DOM não crie as words)
                const wordsArray = [...(splitText.words || []), ...(splitAccent.words || [])];
                if(wordsArray.length > 0) {
                    masterTl.fromTo(wordsArray, {
                        opacity: 0,
                        filter: "blur(20px)",
                        y: 100
                    }, {
                        opacity: 1,
                        filter: "blur(0px)",
                        y: 0,
                        duration: 0.25,
                        stagger: 0.05,
                        ease: "power3.out"
                    }, 0);
                }

                // --- PARALLAX CONTÍNUO EM MÚLTIPLAS CAMADAS (0% a 100%) ---
                // Camada 1: Vídeo (Lento - 0.8x)
                masterTl.to('.layer-video', {
                    y: "15%",
                    scale: 1.05,
                    duration: 1,
                    ease: "none"
                }, 0);
                
                // Camada 2: Gradientes (Médio - 1.2x)
                masterTl.to('.layer-gradients', {
                    y: "30%",
                    duration: 1,
                    ease: "none"
                }, 0);
                
                // Camada 3: Conteúdo (Rápido - 1.5x)
                masterTl.to('.layer-content', {
                    y: "-25%",
                    duration: 1,
                    ease: "none"
                }, 0);

                // --- FASE 2: MANUTENÇÃO / LEITURA (35% a 65%) ---
                masterTl.to('.hero-text-wrapper', {
                    scale: 1.02, // Sutil aumento
                    duration: 0.3,
                    ease: "none"
                }, 0.35);

                // --- FASE 3: SAÍDA DOS TEXTOS (65% a 100%) ---
                masterTl.to('.hero-text-wrapper', {
                    opacity: 0,
                    filter: "blur(40px)",
                    scale: 1.15,
                    rotationX: 10, // Leve efeito 3D ao afastar
                    duration: 0.35,
                    ease: "power2.in"
                }, 0.65);

                if(wordsArray.length > 0) {
                    masterTl.to(wordsArray, {
                        opacity: 0,
                        filter: "blur(20px)",
                        y: -100,
                        duration: 0.25,
                        stagger: 0.02,
                        ease: "power3.in"
                    }, 0.65);
                }
            }

            // 5. Animação Stagger da Seção Processo (Aparecer ao rolar)
            gsap.from('.process-step', {
                scrollTrigger: {
                    trigger: '#processo',
                    start: 'top 80%',
                },
                y: 50,
                opacity: 0,
                duration: 1,
                stagger: 0.2,
                ease: 'power3.out'
            });

            // 6. Animação Seção 3 (Serviços)
            // Fade-up com Blur dos Cards
            gsap.from('.service-card', {
                scrollTrigger: {
                    trigger: '#servicos',
                    start: 'top 70%',
                },
                y: 60,
                opacity: 0,
                filter: "blur(20px)",
                duration: 1,
                stagger: 0.15,
                ease: 'power3.out'
            });

            // Parallax das partículas decorativas (Serviços e Galeria)
            gsap.utils.toArray('.particle, .parallax-gallery-bg iconify-icon').forEach(particle => {
                const speed = parseFloat(particle.getAttribute('data-speed')) || 0.5;
                gsap.to(particle, {
                    yPercent: -100 * speed,
                    ease: "none",
                    scrollTrigger: {
                        trigger: particle.closest('section'),
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true
                    }
                });
            });

            // 7. Galeria de Sonhos (Entrada e Parallax)
            let galleryData = [];
            let currentIndex = 0;
            const galleryContainer = document.querySelector('.gallery-grid');

            fetch('./assets/data/gallery-data.json')
                .then(response => response.json())
                .then(data => {
                    galleryData = data;
                    renderGallery();
                });

            function renderGallery() {
                galleryContainer.innerHTML = galleryData.map((item, index) => `
                    <div class="gallery-item cursor-pointer group" data-index="${index}" data-theme="${item.title}" data-desc="${item.desc}">
                        <img src="${item.src}" alt="${item.title}" class="w-full object-cover aspect-auto transform transition-transform duration-1000 group-hover:scale-[1.08] group-hover:brightness-110">
                        <div class="overlay flex flex-col items-center justify-center p-4 text-center">
                            <h3 class="text-xl font-bold mb-2">${item.title}</h3>
                            <p class="text-sm">${item.desc}</p>
                        </div>
                    </div>
                `).join('');
                initGalleryInteractions();
            }

            function navigateGallery(direction) {
                currentIndex = (currentIndex + direction + galleryData.length) % galleryData.length;
                updateLightboxContent();
            }

            function updateLightboxContent() {
                const item = galleryData[currentIndex];
                lightboxTitle.textContent = item.title;
                lightboxDesc.textContent = item.desc;
                // Update image source
                const img = lightboxImgContainer.querySelector('img');
                if (img) {
                    img.src = item.src;
                } else {
                    // If no img yet, create one
                    const newImg = document.createElement('img');
                    newImg.src = item.src;
                    newImg.className = "w-full h-full object-cover rounded-3xl";
                    lightboxImgContainer.appendChild(newImg);
                }
            }

            function initGalleryInteractions() {
                gsap.from('.gallery-item', {
                    scrollTrigger: {
                        trigger: '#galeria',
                        start: 'top 80%',
                    },
                    y: 100,
                    opacity: 0,
                    filter: "blur(10px)",
                    duration: 1.2,
                    stagger: 0.1,
                    ease: 'power3.out'
                });

                // Parallax discreto na rolagem da galeria
                gsap.utils.toArray('.gallery-item').forEach(item => {
                    const speed = parseFloat(item.getAttribute('data-speed'));
                    gsap.to(item, {
                        yPercent: -15 * speed, // Move suavemente o card em relação ao scroll
                        ease: "none",
                        scrollTrigger: {
                            trigger: "#galeria",
                            start: "top bottom",
                            end: "bottom top",
                            scrub: true
                        }
                    });
                });

                // Tilt suave com mouse
                document.querySelectorAll('.gallery-item').forEach(item => {
                    item.addEventListener('mousemove', (e) => {
                        const rect = item.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        const xPercent = x / rect.width - 0.5;
                        const yPercent = y / rect.height - 0.5;
                        
                        gsap.to(item.querySelector('img'), {
                            rotationY: xPercent * 5,
                            rotationX: -yPercent * 5,
                            duration: 0.5,
                            ease: "power2.out"
                        });
                    });
                    item.addEventListener('mouseleave', () => {
                        gsap.to(item.querySelector('img'), {
                            rotationY: 0,
                            rotationX: 0,
                            duration: 0.5,
                            ease: "power2.out"
                        });
                    });
                });
            }

            // 8. GSAP FLIP Lightbox
            const lightbox = document.getElementById('lightbox');
            const lightboxImgContainer = document.getElementById('lightbox-img-container');
            const lightboxTitle = document.getElementById('lightbox-title');
            const lightboxDesc = document.getElementById('lightbox-desc');
            const lightboxClose = document.getElementById('lightbox-close');
            const lightboxInfo = document.getElementById('lightbox-info');
            let activeImage = null;
            let activePlaceholder = null;

            if (lightbox) {
                document.querySelectorAll('.gallery-item').forEach(item => {
                    item.addEventListener('click', () => {
                        if (activeImage) return; // Previne cliques múltiplos
                        
                        currentIndex = parseInt(item.getAttribute('data-index'));
                        const img = item.querySelector('img');
                        activeImage = img;
                        activePlaceholder = item;
                        
                        // Preenche infos
                        lightboxTitle.textContent = item.getAttribute('data-theme');
                        lightboxDesc.textContent = item.getAttribute('data-desc');

                        // Mostra Lightbox Background
                        lightbox.classList.remove('hidden');
                        lightbox.classList.add('flex');
                        gsap.to(lightbox, { opacity: 1, duration: 0.4 });

                        // Pega estado inicial (na galeria)
                        const state = Flip.getState(img);

                        // Move a imagem fisicamente no DOM para o Lightbox
                        lightboxImgContainer.appendChild(img);
                        
                        // Altera as classes para preencher o lightbox perfeitamente
                        img.className = "w-full h-full object-cover rounded-3xl";

                        // FLIP! Animação cinematográfica
                        Flip.from(state, {
                            duration: 0.8,
                            ease: "power3.inOut",
                            absolute: true, // Crucial para não quebrar o layout original durante o voo
                            onComplete: () => {
                                // Anima entrada do texto lateral
                                gsap.to(lightboxInfo, { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" });
                            }
                        });
                    });
                });

                // Lógica de fechamento
                lightboxClose.addEventListener('click', closeLightbox);
                lightbox.addEventListener('click', (e) => {
                    if (e.target === lightbox) closeLightbox();
                });
            }

            function closeLightbox() {
                if (!activeImage) return;

                // Esconde info text primeiro
                gsap.to(lightboxInfo, { opacity: 0, x: 32, duration: 0.3 });

                // Pega estado gigante no lightbox
                const state = Flip.getState(activeImage);

                // Devolve a imagem pro container original na galeria
                activePlaceholder.insertBefore(activeImage, activePlaceholder.firstChild);
                
                // Restaura classes do hover/grid original
                activeImage.className = "w-full object-cover aspect-auto transform transition-transform duration-1000 group-hover:scale-[1.08] group-hover:brightness-110";
                // Usa altura 100% para se adaptar à proporção que o CSS Masonry exige do card
                activeImage.style.height = "100%";
                
                // FLIP de volta
                Flip.from(state, {
                    duration: 0.8,
                    ease: "power3.inOut",
                    absolute: true,
                    onComplete: () => {
                        activeImage.style.height = ""; // Limpa inline
                        gsap.to(lightbox, { opacity: 0, duration: 0.3, onComplete: () => {
                            lightbox.classList.add('hidden');
                            lightbox.classList.remove('flex');
                            activeImage = null;
                            activePlaceholder = null;
                        }});
                    }
                });
            }

            // Scroll Reveal do título da seção de depoimentos
            gsap.from('.scroll-reveal', {
                scrollTrigger: {
                    trigger: '#depoimentos',
                    start: 'top 80%'
                },
                y: 60,
                opacity: 0,
                duration: 1.2,
                ease: 'power3.out'
            });

            // 11. GSAP CTA Final (Seção 7)
            try {
                // Timeline Principal do CTA
                const ctaTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '#cta',
                        start: "top 60%", 
                    }
                });

                // Esfera Luminosa crescendo e ascendendo
                ctaTl.to('.cta-sphere', {
                    opacity: 1,
                    scale: 1.2,
                    duration: 3,
                    ease: "power2.out"
                })
                // Textos Reveal
                .fromTo('.cta-text', 
                    { opacity: 0, y: 50, filter: "blur(15px)" },
                    { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.5, stagger: 0.2, ease: "power3.out" },
                    "-=2.5"
                )
                // Pulsação contínua na palavra "inesquecível"
                .to('.cta-word-glow', {
                    opacity: 1,
                    scale: 1.1,
                    duration: 2,
                    ease: "power1.inOut",
                    yoyo: true,
                    repeat: -1
                }, "-=1")
                // Botão "Boing" Reveal
                .fromTo('.cta-button-wrapper', 
                    { scale: 0.8, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 1.2, ease: "elastic.out(1, 0.4)" },
                    "-=1.5"
                );

                // 3 Camadas de Parallax Contínuo para profundidade
                gsap.to('.cta-layer-1', {
                    yPercent: 30,
                    ease: "none",
                    scrollTrigger: { trigger: '#cta', start: "top bottom", end: "bottom top", scrub: true }
                });
                gsap.to('.cta-layer-2', {
                    yPercent: -15, // Texto sobe um pouco mais rápido
                    ease: "none",
                    scrollTrigger: { trigger: '#cta', start: "top bottom", end: "bottom top", scrub: true }
                });
                gsap.to('.cta-layer-3', {
                    yPercent: -40, // Partículas sobem bem mais rápido (mais próximas à câmera)
                    ease: "none",
                    scrollTrigger: { trigger: '#cta', start: "top bottom", end: "bottom top", scrub: true }
                });

                // Animações Constantes Flutuantes (Partículas e Estrelas)
                gsap.to('.cta-star', {
                    y: "random(-20, 20)",
                    x: "random(-10, 10)",
                    rotation: "random(-15, 15)",
                    opacity: "random(0.4, 1)",
                    duration: "random(2, 4)",
                    ease: "sine.inOut",
                    yoyo: true,
                    repeat: -1,
                    stagger: { each: 0.5, from: "random" }
                });
                gsap.to('.cta-particle', {
                    y: "-=40",
                    opacity: 0,
                    scale: "random(0.5, 1.5)",
                    duration: "random(2, 5)",
                    ease: "power1.in",
                    repeat: -1,
                    stagger: { each: 0.3, random: true }
                });

                // Magnetic Button Effect
                const btnWrapper = document.querySelector('.cta-button-wrapper');
                const btn = document.querySelector('.cta-btn');
                const btnGlow = document.querySelector('.cta-button-glow');
                
                if(btnWrapper && btn && window.innerWidth > 768) { // Apenas Desktop/Tablet p/ Magnetic
                    btnWrapper.addEventListener('mousemove', (e) => {
                        const rect = btnWrapper.getBoundingClientRect();
                        const x = e.clientX - rect.left - rect.width / 2;
                        const y = e.clientY - rect.top - rect.height / 2;
                        
                        // Move o botão um pouco na direção do mouse
                        gsap.to(btn, { x: x * 0.4, y: y * 0.4, duration: 0.3, ease: "power2.out" });
                        // Move o Glow intensamente embaixo do botão
                        gsap.to(btnGlow, { opacity: 1, x: x * 0.6, y: y * 0.6, scale: 1.1, duration: 0.3 });
                    });
                    
                    btnWrapper.addEventListener('mouseleave', () => {
                        // Solta o ímã
                        gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.3)" });
                        gsap.to(btnGlow, { opacity: 0, x: 0, y: 0, scale: 1, duration: 0.5 });
                    });
                }

            } catch (err) {
                console.error("Erro na animação do CTA Final: ", err);
            }

        });
