// Import Supabase
import { supabase } from './supabase-config.js'

class PortfolioManager {
    constructor() {
        this.initializeTheme();
        this.loadAboutMe();
    }

    // Load About Me from Supabase
    async loadAboutMe() {
        try {
            const { data, error } = await supabase
                .from('about_me')
                .select('text')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
                console.error('Error loading about me:', error);
                return;
            }

            if (data && data.text) {
                this.displayAboutText(data.text);
                this.toggleAboutMode(false);
                console.log('✅ Loaded from Supabase:', data.text);
            }
        } catch (error) {
            console.error('Error loading about me:', error);
            // Fallback to localStorage
            const savedAbout = localStorage.getItem('aboutMe');
            if (savedAbout) {
                this.displayAboutText(savedAbout);
                this.toggleAboutMode(false);
            }
        }
    }

    // Save About Me to Supabase
    async saveAbout() {
        const aboutInput = document.getElementById('aboutInput');
        const aboutText = aboutInput.value;
        
        if (aboutText.trim() === '') {
            this.showNotification('Yo, type something first! 💭', 'error');
            return;
        }
        
        try {
            // Show loading state
            const saveBtn = document.querySelector('button[onclick="portfolio.saveAbout()"]');
            if (saveBtn) {
                saveBtn.textContent = 'Saving...';
                saveBtn.disabled = true;
            }

            // Save to Supabase
            const { data, error } = await supabase
                .from('about_me')
                .insert([{ text: aboutText }]);

            if (error) {
                throw error;
            }

            // Save locally as backup
            localStorage.setItem('aboutMe', aboutText);
            
            this.displayAboutText(aboutText);
            this.toggleAboutMode(false);
            
            console.log('✅ Saved to Supabase:', aboutText);
            this.showNotification('About me saved to database! 🎉');
            
        } catch (error) {
            console.error('Error saving to Supabase:', error);
            
            // Fallback to localStorage
            localStorage.setItem('aboutMe', aboutText);
            this.displayAboutText(aboutText);
            this.toggleAboutMode(false);
            
            this.showNotification('Saved locally (database error) 😅', 'error');
        } finally {
            // Reset button state
            const saveBtn = document.querySelector('button[onclick="portfolio.saveAbout()"]');
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
    // Load current text from Supabase for editing
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