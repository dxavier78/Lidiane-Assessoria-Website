// Multi-State Search Bar Logic
function switchSearchTab(tab) {
    const buyRentForm = document.getElementById('form-buy-rent');
    const sellForm = document.getElementById('form-sell');

    const tabBuy = document.getElementById('tab-buy');
    const tabRent = document.getElementById('tab-rent');
    const tabSell = document.getElementById('tab-sell');

    // Reset all tabs to inactive state
    [tabBuy, tabRent, tabSell].forEach(t => {
        t.classList.remove('bg-white/20', 'text-white');
        t.classList.add('bg-transparent', 'text-white/70', 'hover:bg-white/10');
    });

    // Set active tab
    const activeTab = document.getElementById(`tab-${tab}`);
    activeTab.classList.remove('bg-transparent', 'text-white/70', 'hover:bg-white/10');
    activeTab.classList.add('bg-white/20', 'text-white');

    // Toggle dynamic forms based on selection
    if (tab === 'sell') {
        buyRentForm.classList.add('hidden');
        buyRentForm.classList.remove('flex');
        sellForm.classList.remove('hidden');
        sellForm.classList.add('flex');
    } else {
        sellForm.classList.add('hidden');
        sellForm.classList.remove('flex');
        buyRentForm.classList.remove('hidden');
        buyRentForm.classList.add('flex');
    }
}

// GSAP Animations
document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);

    // Navbar Glassmorphism effect on scroll
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('navbar');
        if (window.scrollY > 50) {
            nav.classList.add('shadow-sm', 'bg-white/95');
            nav.classList.remove('bg-white/90');
        } else {
            nav.classList.remove('shadow-sm', 'bg-white/95');
            nav.classList.add('bg-white/90');
        }
    });

    // Hero Entrance Animation Timeline
    const heroTl = gsap.timeline({delay: 0.2});
    heroTl.to(".hero-search-bar", {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.2,
        ease: "power3.out"
    });

    // ScrollTrigger Animations for sections
    gsap.utils.toArray('.gsap-section').forEach(section => {
        gsap.fromTo(section,
            { opacity: 0, y: 40 },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: section,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });
});
