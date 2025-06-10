// Supabase configuration - inline for now
const supabaseUrl = 'https://sfgjkagltcoqtevgswna.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZ2prYWdsdGNvcXRldmdzd25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODM1NzYsImV4cCI6MjA2NTE1OTU3Nn0.Y4Qg5KOI5FBZFMTS9U_p3tfeJjK4Ijg1Z-2SD367VLE'

// Wait for Supabase to load, then initialize
let supabase = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Supabase client
    if (window.supabase) {
        supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
        console.log('✅ Supabase initialized');
    } else {
        console.log('⚠️ Supabase not available, using localStorage only');
    }
    
    // Initialize portfolio
    initializePortfolio();
});

function initializePortfolio() {
    initializeTheme();
    loadAboutMe();
}

// Load About Me from Supabase or localStorage
async function loadAboutMe() {
    try {
        if (supabase) {
            console.log('🔍 Trying to load from Supabase...');
            const { data, error } = await supabase
                .from('about_me')
                .select('text')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error) {
                console.log('Supabase error:', error.message);
                // If it's just "no rows found", that's okay
                if (error.code !== 'PGRST116') {
                    throw error;
                }
            }

            if (data && data.text) {
                displayAboutText(data.text);
                toggleAboutMode(false);
                console.log('✅ Loaded from Supabase:', data.text);
                return;
            }
        }
    } catch (error) {
        console.log('Supabase not available, using localStorage:', error.message);
    }
    
    // Fallback to localStorage
    const savedAbout = localStorage.getItem('aboutMe');
    if (savedAbout) {
        displayAboutText(savedAbout);
        toggleAboutMode(false);
        console.log('📱 Loaded from localStorage:', savedAbout);
    }
}

// Save About Me to Supabase and localStorage
async function saveAbout() {
    const aboutInput = document.getElementById('aboutInput');
    const aboutText = aboutInput.value;
    
    if (aboutText.trim() === '') {
        showNotification('Yo, type something first! 💭', 'error');
        return;
    }
    
    try {
        // Show loading state
        const saveBtn = document.querySelector('button[onclick="saveAbout()"]');
        if (saveBtn) {
            saveBtn.textContent = 'Saving...';
            saveBtn.disabled = true;
        }

        // Always save locally first
        localStorage.setItem('aboutMe', aboutText);
        console.log('📱 Saved to localStorage');

        // Try to save to Supabase
        if (supabase) {
            console.log('💾 Trying to save to Supabase...');
            const { data, error } = await supabase
                .from('about_me')
                .insert([{ text: aboutText }]);

            if (error) {
                console.log('Supabase save error:', error.message);
                showNotification('Saved locally (database unavailable) 📱');
            } else {
                console.log('✅ Saved to Supabase successfully');
                showNotification('About me saved to database! 🎉');
            }
        } else {
            showNotification('Saved locally 📱');
        }
        
        displayAboutText(aboutText);
        toggleAboutMode(false);
        
    } catch (error) {
        console.error('Error saving:', error);
        showNotification('Saved locally only 😅', 'error');
    } finally {
        // Reset button state
        const saveBtn = document.querySelector('button[onclick="saveAbout()"]');
        if (saveBtn) {
            saveBtn.textContent = 'Save';
            saveBtn.disabled = false;
        }
    }
}

function editAbout() {
    const aboutText = document.getElementById('aboutText')?.textContent || '';
    const input = document.getElementById('aboutInput');
    if (input) {
        input.value = aboutText;
    }
    toggleAboutMode(true);
}

// Enhanced theme management
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    
    body.classList.toggle('dark-theme');
    
    const isDark = body.classList.contains('dark-theme');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Utility functions
function displayAboutText(text) {
    const aboutTextElement = document.getElementById('aboutText');
    if (aboutTextElement) {
        aboutTextElement.textContent = text;
    }
}

function toggleAboutMode(isEditing) {
    const input = document.getElementById('aboutInput');
    const saveBtn = document.querySelector('button[onclick="saveAbout()"]');
    const display = document.getElementById('aboutDisplay');
    
    if (isEditing) {
        input.style.display = 'block';
        saveBtn.style.display = 'inline-block';
        display.classList.add('hidden');
    } else {
        input.style.display = 'none';
        saveBtn.style.display = 'none';
        display.classList.remove('hidden');
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'error' ? '#ff4757' : '#2ed573'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        z-index: 1000;
        animation: slideDown 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeToggle = document.getElementById('themeToggle');
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        if (themeToggle) themeToggle.textContent = '☀️';
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
`;
document.head.appendChild(style);