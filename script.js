function saveAbout() {
    const aboutInput = document.getElementById('aboutInput');
    const aboutText = aboutInput.value;
    
    if (aboutText.trim() === '') {
        alert('Yo, type something first! 💭');
        return;
    }
    
    // Save to localStorage
    localStorage.setItem('aboutMe', aboutText);
    
    // Display the saved text
    displayAboutText(aboutText);
    
    // Hide input, show display
    document.getElementById('aboutInput').style.display = 'none';
    document.querySelector('button[onclick="saveAbout()"]').style.display = 'none';
    document.getElementById('aboutDisplay').classList.remove('hidden');
    
    console.log('✅ Saved:', aboutText);
}

function editAbout() {
    // Show input, hide display
    document.getElementById('aboutInput').style.display = 'block';
    document.querySelector('button[onclick="saveAbout()"]').style.display = 'inline-block';
    document.getElementById('aboutDisplay').classList.add('hidden');
    
    // Load current text into input
    const currentText = localStorage.getItem('aboutMe');
    if (currentText) {
        document.getElementById('aboutInput').value = currentText;
    }
}

function displayAboutText(text) {
    document.getElementById('aboutText').textContent = text;
}

// Theme switcher
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    
    body.classList.toggle('dark-theme');
    
    if (body.classList.contains('dark-theme')) {
        themeToggle.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    } else {
        themeToggle.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    }
}

// Load saved content and theme when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Load saved about text
    const savedAbout = localStorage.getItem('aboutMe');
    if (savedAbout) {
        displayAboutText(savedAbout);
        document.getElementById('aboutInput').style.display = 'none';
        document.querySelector('button[onclick="saveAbout()"]').style.display = 'none';
        document.getElementById('aboutDisplay').classList.remove('hidden');
    }
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    const themeToggle = document.getElementById('themeToggle');
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.textContent = '☀️';
    }
    
    // Add theme toggle event listener
    themeToggle.addEventListener('click', toggleTheme);
    
    // Add smooth scroll to project cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
});