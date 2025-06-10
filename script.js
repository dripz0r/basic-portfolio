// Supabase configuration - inline for now
const supabaseUrl = 'https://sfgjkagltcoqtevgswna.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZ2prYWdsdGNvcXRldmdzd25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODM1NzYsImV4cCI6MjA2NTE1OTU3Nn0.Y4Qg5KOI5FBZFMTS9U_p3tfeJjK4Ijg1Z-2SD367VLE'

// Wait for Supabase to load, then initialize
let supabase = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Portfolio initialized');
    initializePortfolio();
});

function initializePortfolio() {
    initializeTheme();
    loadAboutMe();
    loadComments();
}

// Load About Me from localStorage
function loadAboutMe() {
    const savedAbout = localStorage.getItem('aboutMe');
    if (savedAbout) {
        displayAboutText(savedAbout);
        toggleAboutMode(false);
        console.log('📱 Loaded from localStorage:', savedAbout);
    }
}

// Save About Me to localStorage (and try Supabase later)
async function saveAbout() {
    const aboutInput = document.getElementById('aboutInput');
    const aboutText = aboutInput.value;
    
    if (aboutText.trim() === '') {
        showNotification('Yo, type something first! 💭', 'error');
        return;
    }
    
    // Show loading state
    const saveBtn = document.querySelector('button[onclick="saveAbout()"]');
    if (saveBtn) {
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;
    }

    try {
        // Save locally
        localStorage.setItem('aboutMe', aboutText);
        console.log('📱 Saved to localStorage');
        
        displayAboutText(aboutText);
        toggleAboutMode(false);
        showNotification('About me saved! 🎉');
        
    } catch (error) {
        console.error('Error saving:', error);
        showNotification('Error saving! 😅', 'error');
    } finally {
        // Reset button state
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

// Comment System Functions
function submitComment() {
    const nameInput = document.getElementById('commenterName');
    const commentInput = document.getElementById('commentInput');
    const name = nameInput.value.trim() || 'Anonymous';
    const commentText = commentInput.value.trim();
    
    if (!commentText) {
        showNotification('Please write a comment first! 💬', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('button[onclick="submitComment()"]');
    if (submitBtn) {
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
    }
    
    try {
        // Create comment object
        const comment = {
            id: Date.now(),
            author: name,
            text: commentText,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };
        
        // Save to localStorage
        let comments = JSON.parse(localStorage.getItem('portfolioComments') || '[]');
        comments.unshift(comment); // Add to beginning
        
        // Keep only last 20 comments
        if (comments.length > 20) {
            comments = comments.slice(0, 20);
        }
        
        localStorage.setItem('portfolioComments', JSON.stringify(comments));
        
        // Clear form
        nameInput.value = '';
        commentInput.value = '';
        
        // Reload comments
        loadComments();
        
        showNotification('Thanks for your comment! 🎉');
        
    } catch (error) {
        console.error('Error saving comment:', error);
        showNotification('Error saving comment! 😅', 'error');
    } finally {
        // Reset button
        if (submitBtn) {
            submitBtn.textContent = 'Send Message 🚀';
            submitBtn.disabled = false;
        }
    }
}

function loadComments() {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;
    
    try {
        const comments = JSON.parse(localStorage.getItem('portfolioComments') || '[]');
        
        if (comments.length === 0) {
            commentsList.innerHTML = `
                <div class="empty-comments">
                    <p>No comments yet! Be the first to leave a message 😊</p>
                </div>
            `;
            return;
        }
        
        // Add comment count
        const commentsSection = document.querySelector('.comments-section h3');
        if (commentsSection) {
            commentsSection.innerHTML = `📝 Recent Comments <span class="comment-count">(${comments.length})</span>`;
        }
        
        // Render comments
        commentsList.innerHTML = comments.map(comment => `
            <div class="comment-item">
                <div class="comment-header">
                    <span class="comment-author">${escapeHtml(comment.author)}</span>
                    <span class="comment-date">${comment.date}</span>
                </div>
                <p class="comment-text">${escapeHtml(comment.text)}</p>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading comments:', error);
        commentsList.innerHTML = `
            <div class="empty-comments">
                <p>Error loading comments 😅</p>
            </div>
        `;
    }
}

// Utility function to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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