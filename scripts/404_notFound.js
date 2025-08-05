class AlAhly404Page {
    // 3mltha bdl ma n3mel php file w backend , htb2a klaha hena w hndle it hna 
    constructor() {
        this.errorTypes = {
            PAGE_NOT_FOUND: 'page',
            API_ERROR: 'api',
            DATABASE_ERROR: 'database',
            NETWORK_ERROR: 'network',
            SERVER_ERROR: 'server',
            TIMEOUT_ERROR: 'timeout',
            PERMISSION_ERROR: 'permission'
        };
        this.currentErrorType = this.detectErrorType();
        this.retryAttempts = 0;
        this.maxRetries = 3;
        this.init();
    }

    init() {
        this.handleLoading();
        this.setupUIEventListeners();
        this.handleAccessibility();
        this.addInteractiveEffects();
        this.setupErrorHandling();
        this.updateErrorMessage();
        this.setupRetryMechanism();
        this.monitorConnectivity();
    }
    // show the error w nshowf all no3 
    detectErrorType() {
        const urlParams = new URLSearchParams(window.location.search);
        const errorParam = urlParams.get('error');
        const statusCode = urlParams.get('status') || '404';

        if (errorParam) return errorParam;
        if (['500', '502', '503'].includes(statusCode)) return this.errorTypes.SERVER_ERROR;
        if (['408', '504'].includes(statusCode)) return this.errorTypes.TIMEOUT_ERROR;
        if (['403', '401'].includes(statusCode)) return this.errorTypes.PERMISSION_ERROR;
        if (window.location.pathname.includes('/api/')) return this.errorTypes.API_ERROR;
        return this.errorTypes.PAGE_NOT_FOUND;
    }

    updateErrorMessage() {
        const errorTitle = document.querySelector('.error-title');
        const errorMessage = document.querySelector('.error-message');

        const messages = {
            [this.errorTypes.PAGE_NOT_FOUND]: {
                title: 'Goal Missed!',
                message: 'Sorry, the page you\'re looking for seems to have gone off the pitch.'
            },
            [this.errorTypes.API_ERROR]: {
                title: 'API Timeout!',
                message: 'Our team\'s communication system is experiencing delays.'
            },
            [this.errorTypes.DATABASE_ERROR]: {
                title: 'Database Disconnected!',
                message: 'Our player database is temporarily unavailable.'
            },
            [this.errorTypes.NETWORK_ERROR]: {
                title: 'Connection Lost!',
                message: 'Check your network connection to support Al Ahly.'
            },
            [this.errorTypes.SERVER_ERROR]: {
                title: 'Server Injury!',
                message: 'Our server is taking a short break for medical attention.'
            },
            [this.errorTypes.TIMEOUT_ERROR]: {
                title: 'Match Delayed!',
                message: 'The response is taking longer than expected.'
            },
            [this.errorTypes.PERMISSION_ERROR]: {
                title: 'Access Denied!',
                message: 'You don\'t have permission to access this VIP section.'
            }
        };

        const current = messages[this.currentErrorType] || messages[this.errorTypes.PAGE_NOT_FOUND];
        errorTitle.textContent = current.title;
        errorMessage.textContent = current.message;
    }
    // mommken nmsa7ah 3ady w n8leha tro7 ela al page 
    handleLoading() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const overlay = document.getElementById('loadingOverlay');
                overlay.classList.add('hidden');
                setTimeout(() => overlay.remove(), 500);
            }, 1000);
        });
    }

    setupUIEventListeners() {
        const logo = document.querySelector('.club-logo');
        const errorCode = document.querySelector('.error-code');

        logo.addEventListener('click', this.handleLogoClick.bind(this));
        logo.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') this.handleLogoClick();
        });

        errorCode.addEventListener('click', this.createCelebration.bind(this));
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mouseenter', this.handleButtonHover);
            btn.addEventListener('mouseleave', this.handleButtonLeave);
        });


        window.addEventListener('resize', this.handleResize.bind(this));
    }

    handleLogoClick() {
        const logo = document.querySelector('.club-logo');
        logo.style.animation = 'none';
        logo.style.transform = 'scale(0.95)';

        setTimeout(() => {
            logo.style.transform = 'scale(1.05)';
            setTimeout(() => {
                logo.style.transform = '';
                logo.style.animation = '';
            }, 200);
        }, 100);

        this.createRippleEffect(logo);
    }

    createRippleEffect(element) {
        const ripple = document.createElement('div');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            animation: ripple 0.6s ease-out forwards;
        `;

        element.style.position = 'relative';
        element.appendChild(ripple);

        if (!document.querySelector('#ripple-style')) {
            const style = document.createElement('style');
            style.id = 'ripple-style';
            style.textContent = `
                @keyframes ripple {
                    to { transform: translate(-50%, -50%) scale(2); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => ripple.remove(), 600);
    }

    createCelebration() {
        const colors = ['#FFD700', '#DC143C', '#FFFFFF'];
        const particles = 50;

        for (let i = 0; i < particles; i++) {
            setTimeout(() => {
                this.createParticle(colors[Math.floor(Math.random() * colors.length)]);
            }, i * 20);
        }

        // Screen shake effect
        document.body.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => document.body.style.animation = '', 500);

        if (!document.querySelector('#shake-style')) {
            const style = document.createElement('style');
            style.id = 'shake-style';
            style.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-2px); }
                    75% { transform: translateX(2px); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    createParticle(color) {
        const particle = document.createElement('div');
        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * window.innerHeight * 0.5;

        particle.style.cssText = `
            position: fixed;
            width: ${Math.random() * 8 + 4}px;
            height: ${Math.random() * 8 + 4}px;
            background: ${color};
            left: ${startX}px;
            top: ${startY}px;
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            animation: particle-fall ${Math.random() * 2 + 2}s linear forwards;
        `;

        document.body.appendChild(particle);

        if (!document.querySelector('#particle-style')) {
            const style = document.createElement('style');
            style.id = 'particle-style';
            style.textContent = `
                @keyframes particle-fall {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => particle.remove(), 4000);
    }

    handleButtonHover(e) {
        e.target.style.transform = 'translateY(-3px) scale(1.02)';
    }

    handleButtonLeave(e) {
        e.target.style.transform = '';
    }

    handleAccessibility() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.setProperty('--animation-duration', '0.01ms');
        }
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') document.body.classList.add('keyboard-navigation');
        });
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    addInteractiveEffects() {
        document.documentElement.style.scrollBehavior = 'smooth';

        document.querySelectorAll('.stat-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'translateY(-5px) scale(1.05)';
            });
            item.addEventListener('mouseleave', () => {
                item.style.transform = '';
            });
        });

        const field = document.querySelector('.field-container');
        field.addEventListener('click', () => {
            const ball = document.querySelector('.ball');
            ball.style.animationDuration = '0.5s';
            setTimeout(() => ball.style.animationDuration = '2s', 2000);
        });
    }

    handleResize() {
        const container = document.querySelector('.container');
        container.style.padding = window.innerWidth < 768
            ? '20px 15px'
            : '40px 20px';
    }

    setupErrorHandling() {
        window.addEventListener('error', this.handleGlobalError.bind(this));
        window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
        this.setupAPIErrorHandling();
        this.setupDatabaseMonitoring();
        this.setupNetworkMonitoring();
    }

    handleGlobalError(event) {
        console.error('Global Error:', event.error);
        this.logError('GLOBAL_ERROR', event.error?.message, event.error?.stack);
        if (!window.location.pathname.includes('404')) {
            this.showErrorNotification('An unexpected error occurred');
        }
    }

    handlePromiseRejection(event) {
        console.error('Unhandled Promise Rejection:', event.reason);
        this.logError('PROMISE_REJECTION', event.reason?.message);
        if (event.reason?.name === 'NetworkError') {
            this.currentErrorType = this.errorTypes.NETWORK_ERROR;
            this.updateErrorMessage();
        }
    }

    setupAPIErrorHandling() {
        // Fetch interception
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);
                if (!response.ok) this.handleAPIError(response, args[0]);
                return response;
            } catch (error) {
                this.handleFetchError(error, args[0]);
                throw error;
            }
        };

        // XMLHttpRequest interception
        const originalXHROpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function (...args) {
            this.addEventListener('error', () => this.handleXHRError(this, args[1]));
            this.addEventListener('timeout', () => this.handleXHRTimeout(this, args[1]));
            return originalXHROpen.apply(this, args);
        }.bind(this);
    }

    handleAPIError(response, url) {
        const status = response.status;
        let errorType = this.errorTypes.API_ERROR;

        if ([500, 502, 503].includes(status)) errorType = this.errorTypes.SERVER_ERROR;
        if ([408, 504].includes(status)) errorType = this.errorTypes.TIMEOUT_ERROR;
        if ([403, 401].includes(status)) errorType = this.errorTypes.PERMISSION_ERROR;

        this.logError('API_ERROR', `${status} - ${url}`, response.statusText);
        if (status >= 500) this.showRetryOption(url);
    }


    setupRetryMechanism() {
        if (!document.querySelector('.retry-btn')) this.addRetryButton();
    }

    addRetryButton() {
        const actionButtons = document.querySelector('.action-buttons');
        const retryBtn = document.createElement('a');
        retryBtn.href = '#';
        retryBtn.className = 'btn btn-secondary retry-btn';
        retryBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            Try Again
        `;
        retryBtn.addEventListener('click', this.handleRetry.bind(this));
        actionButtons.appendChild(retryBtn);
    }

    async handleRetry(event) {
        event.preventDefault();
        if (this.retryAttempts >= this.maxRetries) {
            this.showErrorNotification('Maximum retry attempts reached');
            return;
        }

        this.retryAttempts++;
        this.showLoadingState();

        try {
            switch (this.currentErrorType) {
                case this.errorTypes.API_ERROR: await this.retryAPICall(); break;
                case this.errorTypes.DATABASE_ERROR: await this.retryDatabaseConnection(); break;
                case this.errorTypes.NETWORK_ERROR: await this.retryNetworkConnection(); break;
                default: window.location.reload();
            }
        } catch (error) {
            this.hideLoadingState();
            this.showErrorNotification(`Retry failed: ${error.message}`);
        }
    }

    showErrorNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-red);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            max-width: 350px;
            transform: translateX(400px);
            transition: transform 0.3s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.style.transform = 'translateX(0)', 100);
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    logError(type, message, stack) {
        const errorLog = {
            type,
            message,
            stack,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        // Error storage and reporting logic
        try {
            const existingLogs = JSON.parse(sessionStorage.getItem('al_ahly_error_logs') || '[]');
            existingLogs.push(errorLog);
            if (existingLogs.length > 50) existingLogs.shift();
            sessionStorage.setItem('al_ahly_error_logs', JSON.stringify(existingLogs));
        } catch (e) {
            console.warn('Error logging failed:', e);
        }

        this.sendErrorToServer(errorLog);
    }

}

document.addEventListener('DOMContentLoaded', () => {
    window.alAhly404 = new AlAhly404Page();
});

// Page visibility handling
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.body.style.animationPlayState = 'paused';
    } else {
        document.body.style.animationPlayState = 'running';
        if (window.alAhly404) window.alAhly404.performConnectivityTest();
    }
});

// Error monitoring
window.addEventListener('error', (e) => {
    console.error('404 Page Error:', e.error);
    if (window.alAhly404) {
        window.alAhly404.logError('WINDOW_ERROR', e.error?.message, e.error?.stack);
    }
});

// Feature detection
const featureTests = {
    localStorage: () => {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch (e) { return false; }
    },
    fetch: () => typeof fetch !== 'undefined',
    serviceWorker: () => 'serviceWorker' in navigator,
    webGL: () => {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (e) { return false; }
    }
};

// Apply feature detection
Object.keys(featureTests).forEach(feature => {
    if (!featureTests[feature]()) {
        document.body.classList.add(`no-${feature}`);
        if (window.alAhly404) {
            window.alAhly404.logError('FEATURE_MISSING', `${feature} not supported`, 'Feature detection');
        }
    }
});

// Service Worker registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .catch(error => {
            if (window.alAhly404) {
                window.alAhly404.logError('SERVICE_WORKER_REGISTRATION', error?.message, error?.stack);
            }
        });
}

// Export error utilities
window.alAhlyErrorUtils = {
    announceError: (message) => { /* ... */ },
    dispatchErrorEvent: (type, details) => { /* ... */ },
    trackError: (type, message, metadata) => { /* ... */ },
    featureTests
};