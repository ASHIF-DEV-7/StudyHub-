// ===== MILLENNIUM APP - GLOBAL SETTINGS SCRIPT =====
// Har HTML page mein include karo: <script src="script.js"></script>

class MillenniumSettings {
    // Default settings 
    static defaults = {
        theme: 'light',          
        fontSize: 'medium',      
        fontFamily: 'sans',      
        textColor: '',           // Empty = use original page colors
        bgColor: '',             // Empty = use original background
        layout: 'grid',          
        language: 'en',          
        sound: true              
    };

    // Storage key
    static storageKey = 'millennium_app_settings_v2';

    // Settings load karo localStorage se
    static load() {
        try {
            const saved = localStorage.getItem(MillenniumSettings.storageKey);
            if (saved) {
                const settings = JSON.parse(saved);
                console.log('🔄 Settings loaded from storage:', settings);
                // Merge with defaults to ensure all keys exist
                return { ...MillenniumSettings.defaults, ...settings };
            }
        } catch (error) {
            console.warn('⚠️ Settings load failed:', error);
        }
        
        console.log('🆕 Using default settings');
        return { ...MillenniumSettings.defaults };
    }

    // Settings save karo localStorage mein
    static save(settings) {
        try {
            // Clean settings object
            const cleanSettings = { ...settings };
            localStorage.setItem(MillenniumSettings.storageKey, JSON.stringify(cleanSettings));
            console.log('✅ Settings saved successfully:', cleanSettings);
            
            // Broadcast to other tabs/windows
            window.dispatchEvent(new CustomEvent('millennium-settings-changed', {
                detail: cleanSettings
            }));
            
            return true;
        } catch (error) {
            console.error('❌ Settings save failed:', error);
            return false;
        }
    }

    // Current page pe settings apply karo
    static apply(settings = null) {
        if (!settings) {
            settings = MillenniumSettings.load();
        }

        const body = document.body;
        const html = document.documentElement;

        if (!body) {
            console.warn('⚠️ Body element not found');
            return settings;
        }

        console.log('🎨 Applying settings:', settings);

        // === FONT SIZE ===
        const fontSizes = {
            'small': '14px',
            'medium': '16px', 
            'large': '18px'
        };
        const selectedFontSize = fontSizes[settings.fontSize] || fontSizes['medium'];
        body.style.fontSize = selectedFontSize;
        html.style.setProperty('--app-font-size', selectedFontSize);

        // === FONT FAMILY ===
        const fontFamilies = {
            'sans': 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            'serif': 'Georgia, "Times New Roman", Times, serif',
            'mono': 'Monaco, Menlo, Consolas, "Courier New", monospace'
        };
        const selectedFontFamily = fontFamilies[settings.fontFamily] || fontFamilies['sans'];
        body.style.fontFamily = selectedFontFamily;
        html.style.setProperty('--app-font-family', selectedFontFamily);

        // === THEME & COLORS ===
        // Remove existing theme classes
        body.classList.remove('light-theme', 'dark-theme');
        
        if (settings.theme === 'dark') {
            // Dark mode - apply dark theme
            body.classList.add('dark-theme');
            body.setAttribute('data-theme', 'dark');
            
            const darkTextColor = settings.textColor || '#ffffff';
            const darkBgColor = settings.bgColor || '#0a0a0a';
            
            body.style.color = darkTextColor;
            body.style.background = `linear-gradient(135deg, ${darkBgColor} 0%, #1a1a2e 50%, #16213e 100%)`;
            body.style.minHeight = '100vh';
            
            html.style.setProperty('--app-text-color', darkTextColor);
            html.style.setProperty('--app-bg-color', darkBgColor);
        } else {
            // Light mode - use ORIGINAL page colors (no override)
            body.classList.add('light-theme');
            body.setAttribute('data-theme', 'light');
            
            // REMOVE any color/background overrides - let original CSS show
            body.style.color = '';
            body.style.background = '';
            body.style.backgroundColor = '';
            
            // Clear CSS properties so original styles work
            html.style.removeProperty('--app-text-color');
            html.style.removeProperty('--app-bg-color');
        }

        // === LAYOUT ===
        body.setAttribute('data-layout', settings.layout);
        html.style.setProperty('--app-layout', settings.layout);

        // === SMOOTH TRANSITIONS ===
        if (!body.style.transition || !body.style.transition.includes('all')) {
            body.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        }

        console.log('✨ Settings applied successfully to page');
        return settings;
    }

    // Settings update aur save karo
    static update(newSettings) {
        const current = MillenniumSettings.load();
        const updated = { ...current, ...newSettings };
        
        console.log('🔄 Updating settings:', { current, newSettings, updated });
        
        if (MillenniumSettings.save(updated)) {
            MillenniumSettings.apply(updated);
            return updated;
        }
        return current;
    }

    // Reset to defaults
    static reset() {
        const defaults = { ...MillenniumSettings.defaults };
        console.log('🔄 Resetting to defaults:', defaults);
        
        if (MillenniumSettings.save(defaults)) {
            MillenniumSettings.apply(defaults);
            return defaults;
        }
        return MillenniumSettings.load();
    }

    // Get current settings
    static get() {
        return MillenniumSettings.load();
    }

    // Clear all settings
    static clear() {
        try {
            localStorage.removeItem(MillenniumSettings.storageKey);
            console.log('🗑️ Settings cleared');
            return true;
        } catch (error) {
            console.error('❌ Settings clear failed:', error);
            return false;
        }
    }

    // Notification sound
    static playSound() {
        const settings = MillenniumSettings.get();
        if (!settings.sound) {
            console.log('🔇 Sound disabled');
            return;
        }

        try {
            // Modern Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Futuristic beep sound
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.15);
            
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.15);
            
            console.log('🔊 Notification sound played');
        } catch (error) {
            console.warn('🔇 Audio not supported or blocked:', error);
        }
    }

    // Quick toggle functions
    static toggleTheme() {
        const current = MillenniumSettings.get();
        const newTheme = current.theme === 'dark' ? 'light' : 'dark';
        
        let updateData = { theme: newTheme };
        
        // Only set colors for dark mode, light mode uses original colors
        if (newTheme === 'dark') {
            updateData.textColor = '#ffffff';
            updateData.bgColor = '#0a0a0a';
        } else {
            // Light mode - clear custom colors to use original page colors
            updateData.textColor = '';
            updateData.bgColor = '';
        }
        
        console.log('🌙 Toggling theme:', current.theme, '->', newTheme);
        return MillenniumSettings.update(updateData);
    }

    static cycleFontSize() {
        const current = MillenniumSettings.get();
        const sizes = ['small', 'medium', 'large'];
        const currentIndex = sizes.indexOf(current.fontSize);
        const nextIndex = (currentIndex + 1) % sizes.length;
        const newSize = sizes[nextIndex];
        
        console.log('📝 Cycling font size:', current.fontSize, '->', newSize);
        return MillenniumSettings.update({ fontSize: newSize });
    }

    static cycleFontFamily() {
        const current = MillenniumSettings.get();
        const families = ['sans', 'serif', 'mono'];
        const currentIndex = families.indexOf(current.fontFamily);
        const nextIndex = (currentIndex + 1) % families.length;
        const newFamily = families[nextIndex];
        
        console.log('🔤 Cycling font family:', current.fontFamily, '->', newFamily);
        return MillenniumSettings.update({ fontFamily: newFamily });
    }

    static toggleLayout() {
        const current = MillenniumSettings.get();
        const newLayout = current.layout === 'grid' ? 'list' : 'grid';
        
        console.log('📊 Toggling layout:', current.layout, '->', newLayout);
        return MillenniumSettings.update({ layout: newLayout });
    }

    // Debug helper
    static debug() {
        const settings = MillenniumSettings.get();
        console.table(settings);
        return settings;
    }
}

// ===== AUTO INITIALIZATION =====
let isInitialized = false;

function initializeSettings() {
    if (isInitialized) return;
    
    try {
        const settings = MillenniumSettings.apply();
        console.log('🚀 Millennium Settings initialized:', settings);
        isInitialized = true;
    } catch (error) {
        console.error('❌ Settings initialization failed:', error);
    }
}

// Multiple initialization methods for reliability
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSettings);
} else {
    // DOM already loaded
    setTimeout(initializeSettings, 100);
}

// Backup initialization
window.addEventListener('load', () => {
    setTimeout(initializeSettings, 200);
});

// ===== EVENT HANDLERS =====

// Page visibility change
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && isInitialized) {
        console.log('👁️ Page visible - refreshing settings');
        MillenniumSettings.apply();
    }
});

// Storage change from other tabs
window.addEventListener('storage', function(e) {
    if (e.key === MillenniumSettings.storageKey && isInitialized) {
        console.log('🔄 Settings changed in another tab - syncing');
        MillenniumSettings.apply();
    }
});

// Custom event listener for settings changes
window.addEventListener('millennium-settings-changed', function(e) {
    if (isInitialized && e.detail) {
        console.log('📡 Settings broadcast received:', e.detail);
        MillenniumSettings.apply(e.detail);
    }
});

// ===== GLOBAL ACCESS =====
if (typeof window !== 'undefined') {
    // Main class
    window.MillenniumSettings = MillenniumSettings;
    window.MS = MillenniumSettings;  // Short alias
    
    // Quick functions
    window.toggleTheme = () => {
        const result = MillenniumSettings.toggleTheme();
        MillenniumSettings.playSound();
        return result;
    };
    
    window.cycleFontSize = () => {
        const result = MillenniumSettings.cycleFontSize();
        MillenniumSettings.playSound();
        return result;
    };
    
    window.cycleFontFamily = () => {
        const result = MillenniumSettings.cycleFontFamily();
        MillenniumSettings.playSound();
        return result;
    };
    
    window.toggleLayout = () => {
        const result = MillenniumSettings.toggleLayout();
        MillenniumSettings.playSound();
        return result;
    };
}

// ===== DYNAMIC STYLES INJECTION =====
function injectDynamicStyles() {
    if (document.getElementById('millennium-global-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'millennium-global-styles';
    style.textContent = `
        /* Global transitions */
        * {
            transition: color 0.3s ease, background-color 0.3s ease, background 0.3s ease, font-size 0.3s ease, font-family 0.3s ease !important;
        }
        
        /* Dark theme global overrides */
        body.dark-theme {
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%) !important;
            color: #ffffff !important;
            min-height: 100vh !important;
        }
        
        /* Dark theme for form elements */
        body.dark-theme input:not([type="color"]),
        body.dark-theme textarea,
        body.dark-theme select {
            background: rgba(255, 255, 255, 0.1) !important;
            color: #ffffff !important;
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
        }
        
        body.dark-theme button:not(.no-dark-override) {
            background: rgba(255, 255, 255, 0.1) !important;
            color: #ffffff !important;
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
        }
        
        body.dark-theme a:not(.no-dark-override) {
            color: #60a5fa !important;
        }
        
        body.dark-theme h1, 
        body.dark-theme h2, 
        body.dark-theme h3, 
        body.dark-theme h4, 
        body.dark-theme h5, 
        body.dark-theme h6 {
            color: #ffffff !important;
        }
        
        /* Light theme - NO OVERRIDES, use original page styles */
        body.light-theme {
            /* Intentionally empty - let original CSS work */
        }
        
        body.light-theme input:not([type="color"]),
        body.light-theme textarea,
        body.light-theme select,
        body.light-theme button,
        body.light-theme a {
            /* NO overrides - let original page styles show */
        }
        
        /* Layout helpers */
        [data-layout="grid"] .content-grid,
        [data-layout="grid"] .grid-container,
        [data-layout="grid"] .notes-grid {
            display: grid !important;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)) !important;
            gap: 1rem !important;
        }
        
        [data-layout="list"] .content-grid,
        [data-layout="list"] .grid-container,
        [data-layout="list"] .notes-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 1rem !important;
        }
        
        /* Font size classes */
        body[data-font-size="small"] { font-size: 14px !important; }
        body[data-font-size="medium"] { font-size: 16px !important; }
        body[data-font-size="large"] { font-size: 18px !important; }
        
        /* Responsive font scaling */
        @media (max-width: 768px) {
            body[data-font-size="small"] { font-size: 13px !important; }
            body[data-font-size="medium"] { font-size: 15px !important; }
            body[data-font-size="large"] { font-size: 17px !important; }
        }
        
        /* Smooth scrolling */
        html {
            scroll-behavior: smooth;
        }
        
        /* Focus indicators for accessibility */
        body.dark-theme *:focus {
            outline: 2px solid #60a5fa;
            outline-offset: 2px;
        }
        
        body.light-theme *:focus {
            outline: 2px solid #2563eb;
            outline-offset: 2px;
        }
    `;
    
    document.head.appendChild(style);
    console.log('🎨 Dynamic styles injected');
}

// Inject styles
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectDynamicStyles);
} else {
    injectDynamicStyles();
}

// ===== CONSOLE HELPERS =====
if (typeof console !== 'undefined') {
    setTimeout(() => {
        console.log(`
🌟 MILLENNIUM SETTINGS LOADED v2.0
====================================
Quick Commands:
• MS.get() - View current settings
• MS.debug() - Debug table view
• toggleTheme() - Switch theme
• cycleFontSize() - Change font size  
• cycleFontFamily() - Change font
• toggleLayout() - Grid/List toggle
• MS.reset() - Reset to defaults
• MS.clear() - Clear all settings
====================================
Settings will auto-apply on page load!
`);
    }, 1000);
}