// Supabase configuration - inline for now
const supabaseUrl = 'https://sfgjkagltcoqtevgswna.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZ2prYWdsdGNvcXRldmdzd25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODM1NzYsImV4cCI6MjA2NTE1OTU3Nn0.Y4Qg5KOI5FBZFMTS9U_p3tfeJjK4Ijg1Z-2SD367VLE'

// Initialize Supabase client
const supabase = window.supabase?.createClient(supabaseUrl, supabaseAnonKey)

class PortfolioManager {
    constructor() {
        this.initializeTheme();
        this.loadAboutMe();
    }

    // Load About Me from Supabase or localStorage
    async loadAboutMe() {
        try {
            if (supabase) {
                const { data, error } = await supabase
                    .from('about_me')
                    .select('text')
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (data && data.text) {
                    this.displayAboutText(data.text);
                    this.toggleAboutMode(false);
                    console.log('✅ Loaded from Supabase:', data.text);
                    return;
                }
            }
        } catch (error) {
            console.log('Supabase not available, using localStorage');
        }
        
        // Fallback to localStorage
        const savedAbout = localStorage.getItem('aboutMe');
        if (savedAbout) {
            this.displayAboutText(savedAbout);
            this.toggleAboutMode(false);
        }
    }

    // Save About Me to Supabase and localStorage
    async saveAbout() {
        const aboutInput = document.getElementById('aboutInput');
        const aboutText = aboutInput.value;
        
        if (aboutText.trim() === '') {
            this.showNotification('Yo, type something first! 💭', 'error');
            return;
        }
        
        try {
            // Show loading state
            const saveBtn = document.querySelector('button[onclick="saveAbout()"]');
            if (saveBtn) {
                saveBtn.textContent = 'Saving...';
                saveBtn.disabled = true;
            }

            // Try to save to Supabase
            if (supabase) {
                const { data, error } = await supabase
                    .from('about_me')
                    .insert([{ text: aboutText }]);

                if (!error) {
                    console.log('✅ Saved to Supabase:', aboutText);
                    this.showNotification('About me saved to database! 🎉');
                } else {
                    console.log('Supabase error, saving locally:', error);
                    this.showNotification('Saved locally 📱');
                }
            } else {
                this.showNotification('Saved locally 📱');
            }

            // Always save locally as backup
            localStorage.setItem('aboutMe', aboutText);
            
            this.displayAboutText(aboutText);
            this.toggleAboutMode(false);
            
        } catch (error) {
            console.error('Error saving:', error);
            
            // Fallback to localStorage
            localStorage.setItem('aboutMe', aboutText);
            this.displayAboutText(aboutText);
            this.toggleAboutMode(false);
            
            this.showNotification('Saved locally (database error) 😅', 'error');
        } finally {
            // Reset button state
            const saveBtn = document.querySelector('button[onclick="saveAbout()"]');
            if (saveBtn) {
                saveBtn.textContent = 'Save';
                saveBtn.disabled = false;
            }
        }
    }

    // Enhanced theme management
    toggleTheme() {
        const body = document.body;
        const themeToggle = document.getElementById('themeToggle');
        
        body.classList.toggle('dark-theme');
        
        const isDark = body.classList.contains('dark-theme');
        themeToggle.textContent = isDark ? '☀️' : '🌙';
        
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    // Utility methods
    displayAboutText(text) {
        const aboutTextElement = document.getElementById('aboutText');
        if (aboutTextElement) {
            aboutTextElement.textContent = text;
        }
    }

    toggleAboutMode(isEditing) {
        const input = document.getElementById('aboutInput');
        const saveBtn = document.querySelector('button[onclick="portfolio.saveAbout()"]');
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

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('theme');
        const themeToggle = document.getElementById('themeToggle');
        
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            if (themeToggle) themeToggle.textContent = '☀️';
        }
        
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }
}

// Initialize the portfolio manager
const portfolio = new PortfolioManager();

// Global functions for onclick handlers
function saveAbout() {
    portfolio.saveAbout();
}

function editAbout() {
    const aboutText = document.getElementById('aboutText')?.textContent || '';
    const input = document.getElementById('aboutInput');
    if (input) {
        input.value = aboutText;
    }
    portfolio.toggleAboutMode(true);
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
    
    .project-links {
        margin-top: 1rem;
    }
    
    .project-links .project-link {
        margin-right: 1rem;
    }
`;
document.head.appendChild(style);