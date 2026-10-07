document.addEventListener('DOMContentLoaded', ()=>{
    const yearEl = document.getElementById('year');
    if(yearEl) yearEl.textContent = new Date().getFullYear();

    // Smooth scroll for internal navigation
    try{document.documentElement.style.scrollBehavior = 'smooth'}catch(e){}

    const btn = document.getElementById('menuBtn');
    const nav = document.querySelector('nav');
    if(btn && nav){
        btn.setAttribute('aria-expanded','false');
        btn.addEventListener('click', ()=>{
            const open = nav.getAttribute('data-open') === 'true';
            if(open){
                nav.style.display = '';
                nav.setAttribute('data-open','false');
                btn.textContent = '☰';
                btn.setAttribute('aria-expanded','false');
                return;
            }
            nav.style.display = 'flex';
            nav.style.flexDirection = 'column';
            nav.style.position = 'absolute';
            nav.style.right = '1rem';
            nav.style.top = '64px';
            nav.style.background = 'white';
            nav.style.padding = '1rem';
            nav.style.borderRadius = '10px';
            nav.style.boxShadow = '0 10px 30px rgba(2,6,23,.08)';
            nav.setAttribute('data-open','true');
            btn.textContent = '✕';
            btn.setAttribute('aria-expanded','true');
        });

        // Close mobile menu when clicking a link
        document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click', ()=>{
            if(window.innerWidth<=640){nav.style.display='none';nav.setAttribute('data-open','false');btn.textContent='☰';btn.setAttribute('aria-expanded','false')}
        }));

        // Reset nav styles when resizing to desktop
        window.addEventListener('resize', ()=>{
            if(window.innerWidth>640){nav.style.display='flex';nav.style.position='static';nav.style.flexDirection='row';nav.style.background='transparent';nav.style.padding='0';nav.style.boxShadow='none';nav.setAttribute('data-open','false');btn.textContent='☰';btn.setAttribute('aria-expanded','false')}
        });
    }

    // Contact form: compose mailto with form data
    const contactForm = document.getElementById('contactForm');
    if(contactForm){
        contactForm.addEventListener('submit', (e)=>{
            e.preventDefault();
            const form = e.currentTarget;
            const name = (form.querySelector('[name="name"]')||{}).value || '';
            const email = (form.querySelector('[name="email"]')||{}).value || '';
            const message = (form.querySelector('[name="message"]')||{}).value || '';
            const subject = encodeURIComponent(`Website inquiry from ${name || email}`);
            const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
            // Open user's mail client
            window.location.href = `mailto:nwaghadivine0@gmail.com?subject=${subject}&body=${body}`;
        });
    }

    // Project thumbnail picker: preview selected image and persist to localStorage
    const thumbInputs = document.querySelectorAll('.thumb-input');
    thumbInputs.forEach(input=>{
        const id = input.getAttribute('data-for');
        // load persisted thumbnail if present
        const saved = localStorage.getItem(`thumb-${id}`);
        if(saved){
            const card = document.querySelector(`.project[data-project-id="${id}"]`);
            if(card){
                const thumbImg = card.querySelector('.thumb img.thumb-img');
                const thumb = card.querySelector('.thumb');
                if(thumbImg) thumbImg.src = saved;
                else if(thumb) thumb.style.backgroundImage = `url(${saved})`;
            }
        }

        input.addEventListener('change', (e)=>{
            const file = e.target.files && e.target.files[0];
            if(!file) return;
            if(!file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = function(ev){
                const dataUrl = ev.target.result;
                const card = document.querySelector(`.project[data-project-id="${id}"]`);
                if(card){
                    const thumbImg = card.querySelector('.thumb img.thumb-img');
                    const thumb = card.querySelector('.thumb');
                    if(thumbImg) thumbImg.src = dataUrl;
                    else if(thumb) thumb.style.backgroundImage = `url(${dataUrl})`;
                }
                try{localStorage.setItem(`thumb-${id}`, dataUrl)}catch(err){console.warn('Could not persist thumbnail', err)}
            };
            reader.readAsDataURL(file);
        });
    });

    // Ensure CV download works reliably: fetch the CV and trigger a forced download
    try{
        const cvLink = document.querySelector('a[href="cv.pdf"][download]');
        if(cvLink){
            cvLink.addEventListener('click', async (e)=>{
                // only intercept simple left-clicks without modifiers
                if(e.button!==0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                e.preventDefault();
                try{
                    const resp = await fetch('cv.pdf');
                    if(!resp.ok) throw new Error('Network response was not ok');
                    const blob = await resp.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = cvLink.getAttribute('download') || 'Nwagha-Divine-CV.html';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                }catch(err){
                    console.error('CV download failed, opening CV instead', err);
                    window.location.href = 'cv.pdf';
                }
            });
        }
    }catch(err){console.warn('CV download handler error', err)}

        // Per-project CV download: fetch the canonical `cv.pdf` and save with a project-specific filename
        try{
            document.querySelectorAll('.download-cv-project').forEach(btn=>{
                btn.addEventListener('click', async (e)=>{
                    // allow normal modifier clicks to work
                    if(e.button!==0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                    e.preventDefault();
                    const project = (btn.getAttribute('data-project')||'project').replace(/[^a-z0-9_-]/ig,'');
                    try{
                        const resp = await fetch('cv.pdf');
                        if(!resp.ok) throw new Error('Network response was not ok');
                        const blob = await resp.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Nwagha-Divine-CV-${project}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        URL.revokeObjectURL(url);
                    }catch(err){
                        console.error('Project CV download failed, opening CV instead', err);
                        window.location.href = 'cv.pdf';
                    }
                });
            });
        }catch(err){console.warn('Per-project CV download handler error', err)}
});
    
