// Dashboard page logic: loads data, updates UI, handles navigation and actions
document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
    setupActionButtons();
    setupNavigation();

    // Loads dashboard data from API or fallback
    function loadDashboardData() {
        fetch('/api/dashboard/stats', { method: 'GET', credentials: 'include' })
        .then(r => r.json())
        .then(d => {
            if (d.success) {
                updateDashboardStats(d.data.counts);
                updateRecentActivity(d.data.recent);
            } else {
                loadSampleDashboardData();
            }
        })
        .catch(() => loadSampleDashboardData());
    }

    // Loads sample data if API fails
    function loadSampleDashboardData() {
        const sampleData = {
            counts: { articles: 12, upcomingFixtures: 8, playerProfiles: 24, merchandise: 18 },
            recent: {
                articles: [
                    { title: 'Team Signs New Forward', author: 'Admin', status: 'published', createdAt: Date.now() - 2 * 60 * 60 * 1000 },
                    { title: 'Match Report: Fennec FC vs. City Rovers', author: 'Admin', status: 'published', createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000 },
                    { title: 'Coach Interview: Season Preview', author: 'Admin', status: 'draft', createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000 },
                    { title: 'Community Day Event Announced', author: 'Marketing', status: 'published', createdAt: Date.now() - 8 * 24 * 60 * 60 * 1000 }
                ]
            }
        };
        updateDashboardStats(sampleData.counts);
        updateRecentActivity(sampleData.recent);
    }

    // Updates dashboard statistic cards
    function updateDashboardStats(stats) {
        const statCards = document.querySelectorAll('.stat-card .stat-details h3');
        if (statCards[0]) statCards[0].textContent = stats.articles || 0;
        if (statCards[1]) statCards[1].textContent = stats.upcomingFixtures || 0;
        if (statCards[2]) statCards[2].textContent = stats.merchandise || 0;
    }

    // Updates recent activity section with articles and fixtures
    function updateRecentActivity(recentData) {
        const activityList = document.querySelector('.activity-list');
        if (!activityList) return;
        activityList.innerHTML = '';

        if (recentData.articles?.length) {
            recentData.articles.forEach(article => {
                const timeAgo = getTimeAgo(new Date(article.createdAt));
                const activityItem = document.createElement('div');
                activityItem.className = 'activity-item';
                activityItem.innerHTML = `
                    <div class="activity-time">${timeAgo}</div>
                    <div class="activity-details">
                        <strong>${article.author}</strong> ${article.status === 'published' ? 'published' : 'created'} a new news article: <a href="news-detail.html?id=${article._id || ''}">${article.title}</a>
                    </div>
                `;
                activityList.appendChild(activityItem);
            });
        }

        if (recentData.upcomingFixtures?.length) {
            recentData.upcomingFixtures.slice(0, 2).forEach(fixture => {
                const fixtureDate = new Date(fixture.date);
                const formattedDate = fixtureDate.toLocaleDateString();
                let opponent = fixture.homeTeam?.name !== 'Fennec FC' ? fixture.homeTeam?.name : fixture.awayTeam?.name !== 'Fennec FC' ? fixture.awayTeam?.name : 'TBD';
                const formattedTime = fixtureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const activityItem = document.createElement('div');
                activityItem.className = 'activity-item';
                activityItem.innerHTML = `
                    <div class="activity-time">Upcoming</div>
                    <div class="activity-details">
                        <strong>Fixture</strong> scheduled: <a href="fixtures.html">Fennec FC vs. ${opponent}</a> on ${formattedDate} at ${formattedTime}
                    </div>
                `;
                activityList.appendChild(activityItem);
            });
        }

        if (!activityList.children.length) {
            activityList.innerHTML = '<div class="activity-item">No recent activity</div>';
        }
    }

    // Returns human-readable time difference
    function getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays > 0) return diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
        if (diffHours > 0) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
        if (diffMinutes > 0) return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
        return 'Just now';
    }

    // Handles dashboard action buttons
    function setupActionButtons() {
        document.querySelectorAll('.btn-action').forEach(button => {
            button.addEventListener('click', function() {
                const action = button.textContent.trim();
                if (action === 'Add News Article') {
                    window.location.href = 'news.html?action=add';
                } else if (action === 'Add Fixture') {
                    window.location.href = 'fixtures.html?action=add';
                } else if (action === 'Add Merchandise') {
                    window.location.href = 'merchandise.html?action=add';
                }
            });
        });
    }

    // Handles dashboard navigation and mobile menu
    function setupNavigation() {
        const navLinks = document.querySelectorAll('.dashboard-nav a');
        const path = window.location.pathname;
        const currentPage = path.substring(path.lastIndexOf('/') + 1) || 'dashboard.html';
        navLinks.forEach(link => {
            const hrefPage = link.getAttribute('href').split('/').pop();
            link.parentElement.classList.toggle('active', currentPage === hrefPage);
            link.addEventListener('click', function() {
                if (window.innerWidth <= 900) {
                    document.querySelector('.dashboard-sidebar')?.classList.remove('show-mobile');
                }
            });
        });
        document.querySelector('.mobile-menu-toggle')?.addEventListener('click', function() {
            document.querySelector('.dashboard-sidebar')?.classList.toggle('show-mobile');
        });
    }
});
