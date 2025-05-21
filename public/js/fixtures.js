/**
 * Fixtures Management Module
 * Handles loading, displaying, and managing football fixtures and match results
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if "Add Fixture" action was requested via URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'add') {
        openAddFixtureModal();
    }

    // Initialize fixtures display
    loadFixtures();

    // Set up UI event listeners
    initializeEventListeners();

    /**
     * Initialize all event listeners for the fixture management UI
     */
    function initializeEventListeners() {
        // Add Fixture button
        const addFixtureBtn = document.getElementById('add-fixture-btn');
        if (addFixtureBtn) {
            addFixtureBtn.addEventListener('click', openAddFixtureModal);
        }

        // Fixture form submission
        const fixtureForm = document.getElementById('fixture-form');
        if (fixtureForm) {
            fixtureForm.addEventListener('submit', handleFixtureFormSubmit);
        }

        // Modal close buttons
        const cancelFixtureBtn = document.getElementById('cancel-fixture');
        const modalClose = document.querySelector('.modal-close');
        [cancelFixtureBtn, modalClose].forEach(btn => {
            if (btn) btn.addEventListener('click', closeFixtureModal);
        });
    }

    /**
     * Fetch and display both upcoming fixtures and recent results
     */
    function loadFixtures() {
        // Load upcoming fixtures
        fetch('/api/fixtures/upcoming', { 
            method: 'GET', 
            credentials: 'include' 
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayUpcomingFixtures(data.data);
            }
        })
        .catch(error => {
            const errorMsg = 'Error loading upcoming fixtures: ' + error.message;
            console.error(errorMsg);
            displayError('upcoming-fixtures', errorMsg);
        });

        // Load recent results
        fetch('/api/fixtures/results', { 
            method: 'GET', 
            credentials: 'include' 
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayRecentResults(data.data);
            }
        })
        .catch(error => {
            const errorMsg = 'Error loading recent results: ' + error.message;
            console.error(errorMsg);
            displayError('recent-results', errorMsg);
        });
    }

    /**
     * Display error message in the specified container
     * @param {string} containerId - ID of container to show error in
     * @param {string} message - Error message to display
     */
    function displayError(containerId, message) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `<div class="error-message">${message}</div>`;
        }
    }

    // Render upcoming fixtures in the UI 
    function displayUpcomingFixtures(fixtures) {
        const fixturesContainer = document.getElementById('upcoming-fixtures');
        if (!fixturesContainer) return;
        const now = new Date();
        const upcomingFixtures = fixtures.filter(fixture => fixture.date && new Date(fixture.date) >= now);
        fixturesContainer.innerHTML = '';
        if (!upcomingFixtures.length) {
            fixturesContainer.innerHTML = '<div class="no-fixtures">No upcoming fixtures</div>';
            return;
        }
        upcomingFixtures.forEach(fixture => {
            const date = fixture.date ? new Date(fixture.date) : null;
            const formattedDate = date ? date.toLocaleDateString() : 'TBD';
            const formattedTime = date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
            const home = fixture.homeTeam ? fixture.homeTeam.name : 'Home';
            const away = fixture.awayTeam ? fixture.awayTeam.name : 'Away';
            const competition = fixture.competition || '';
            const status = fixture.status || fixture.result?.status || 'upcoming';
            const card = document.createElement('div');
            card.className = 'fixture-card';
            card.innerHTML = `
                <div class="fixture-date">${formattedDate} ${formattedTime}</div>
                <div class="fixture-teams">
                    <div class="team home-team">${home}</div>
                    <div class="fixture-vs">vs</div>
                    <div class="team">${away}</div>
                </div>
                <div class="fixture-details">
                    <div class="fixture-competition">${competition}</div>
                    <div class="fixture-status">${status.charAt(0).toUpperCase() + status.slice(1)}</div>
                </div>
            `;
            fixturesContainer.appendChild(card);
        });
    }

    // Render recent results in the UI and setup result update buttons 
    function displayRecentResults(fixtures) {
        const resultsContainer = document.getElementById('recent-results');
        if (!resultsContainer) return;
        resultsContainer.innerHTML = '';
        if (!fixtures.length) {
            resultsContainer.innerHTML = '<div class="no-fixtures">No recent results</div>';
            return;
        }
        fixtures.forEach(fixture => {
            const date = fixture.date ? new Date(fixture.date) : null;
            const formattedDate = date ? date.toLocaleDateString() : 'TBD';
            const home = fixture.homeTeam ? fixture.homeTeam.name : 'Home';
            const away = fixture.awayTeam ? fixture.awayTeam.name : 'Away';
            const competition = fixture.competition || '';
            const result = fixture.result || {};
            const homeScore = typeof result.homeScore === 'number' ? result.homeScore : '-';
            const awayScore = typeof result.awayScore === 'number' ? result.awayScore : '-';
            let resultClass = '';
            if (homeScore !== '-' && awayScore !== '-') {
                if (homeScore > awayScore) resultClass = 'win';
                else if (homeScore < awayScore) resultClass = 'loss';
                else resultClass = 'draw';
            }
            const card = document.createElement('div');
            card.className = 'fixture-card';
            card.innerHTML = `
                <div class="fixture-date">${formattedDate}</div>
                <div class="fixture-teams">
                    <div class="team home-team">${home}</div>
                    <div class="fixture-score"><span>${homeScore}</span> - <span>${awayScore}</span></div>
                    <div class="team">${away}</div>
                </div>
                <div class="fixture-details">
                    <div class="fixture-competition">${competition}</div>
                    <div class="fixture-result ${resultClass}">
                        ${resultClass === 'win' ? 'Win' : resultClass === 'loss' ? 'Loss' : resultClass === 'draw' ? 'Draw' : ''}
                    </div>
                </div>
                <div class="fixture-actions">
                    <button class="btn-update-result" data-id="${fixture._id}">Add/Update Result</button>
                </div>
            `;
            resultsContainer.appendChild(card);
        });
        document.querySelectorAll('.btn-update-result').forEach(button => {
            button.addEventListener('click', function() {
                const fixtureId = button.getAttribute('data-id');
                openResultModal(fixtureId);
            });
        });
    }

    // Open modal to update result for a fixture 
    function openResultModal(fixtureId) {
        fetch(`/api/fixtures/${fixtureId}`, { method: 'GET', credentials: 'include' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const fixture = data.data;
                    document.getElementById('home-team-label').textContent = fixture.homeTeam?.name || 'Home Team';
                    document.getElementById('away-team-label').textContent = fixture.awayTeam?.name || 'Away Team';
                    document.getElementById('home-score').value = typeof fixture.result?.homeScore === 'number' ? fixture.result.homeScore : '';
                    document.getElementById('away-score').value = typeof fixture.result?.awayScore === 'number' ? fixture.result.awayScore : '';
                    document.getElementById('fixture-status').value = fixture.result?.status || 'completed';
                    const resultForm = document.getElementById('result-form');
                    resultForm.setAttribute('data-id', fixtureId);
                    document.getElementById('result-modal').style.display = 'block';
                } else {
                    alert('Could not load fixture details.');
                }
            })
            .catch(() => alert('Could not load fixture details.'));
    }

    // Modal close/cancel for result modal 
    document.querySelectorAll('#result-modal .modal-close, #cancel-result').forEach(btn => {
        btn.addEventListener('click', function() {
            document.getElementById('result-modal').style.display = 'none';
        });
    });

    // Handle result form submission from modal 
    const resultForm = document.getElementById('result-form');
    if (resultForm) {
        resultForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const fixtureId = resultForm.getAttribute('data-id');
            const homeScore = parseInt(document.getElementById('home-score').value, 10);
            const awayScore = parseInt(document.getElementById('away-score').value, 10);
            const status = document.getElementById('fixture-status').value;
            if (isNaN(homeScore) || isNaN(awayScore)) {
                alert('Please enter valid scores.');
                return;
            }
            fetch(`/api/fixtures/${fixtureId}/result`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ result: { homeScore, awayScore, status } })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        document.getElementById('result-modal').style.display = 'none';
                        loadFixtures();
                    } else {
                        alert('Failed to update result: ' + (data.message || 'Unknown error'));
                    }
                })
                .catch(() => alert('Failed to update result.'));
        });
    }

    // Open modal for adding a new fixture 
    function openAddFixtureModal() {
        const modal = document.getElementById('fixture-modal');
        if (!modal) return;
        const fixtureForm = document.getElementById('fixture-form');
        if (fixtureForm) fixtureForm.reset();
        const modalTitle = modal.querySelector('.modal-header h3');
        if (modalTitle) modalTitle.textContent = 'Add Fixture';
        fixtureForm.setAttribute('data-mode', 'add');
        fixtureForm.removeAttribute('data-id');
        modal.style.display = 'block';
    }

    // Close fixture or result modal 
    function closeFixtureModal() {
        const modal = document.getElementById('fixture-modal');
        if (modal) modal.style.display = 'none';
        const resultModal = document.getElementById('result-modal');
        if (resultModal) resultModal.style.display = 'none';
    }

    // Handle add/edit fixture form submission 
    function handleFixtureFormSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const mode = form.getAttribute('data-mode') || 'add';
        const fixtureId = form.getAttribute('data-id');
        const opponent = document.getElementById('fixture-opponent').value;
        const location = document.getElementById('fixture-location').value;
        const dateInput = document.getElementById('fixture-date').value;
        const time = document.getElementById('fixture-time').value;
        const competition = document.getElementById('fixture-competition').value;
        const ticketsAvailable = document.getElementById('fixture-tickets-available').checked;
        const ticketsUrl = document.getElementById('fixture-tickets-url').value;
        if (!opponent || !location || !dateInput || !time || !competition) {
            alert('Please fill in all required fields');
            return;
        }
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const timeRegex = /^\d{2}:\d{2}$/;
        if (!dateRegex.test(dateInput)) {
            alert('Date must be in YYYY-MM-DD format.');
            return;
        }
        if (!timeRegex.test(time)) {
            alert('Time must be in HH:mm format.');
            return;
        }
        const isoDateTime = `${dateInput}T${time}`;
        const date = new Date(isoDateTime);
        if (isNaN(date.getTime())) {
            alert('Invalid date or time.');
            return;
        }
        const fixtureData = {
            opponent,
            location,
            date: dateInput,
            time,
            competition,
            tickets: {
                available: ticketsAvailable,
                url: ticketsUrl || ''
            },
            result: {
                homeScore: null,
                awayScore: null,
                status: 'upcoming'
            }
        };
        let apiUrl = '/api/fixtures';
        let method = 'POST';
        if (mode === 'edit' && fixtureId) {
            apiUrl = `/api/fixtures/${fixtureId}`;
            method = 'PUT';
        }
        fetch(apiUrl, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fixtureData),
            credentials: 'include'
        })
            .then(async response => {
                if (!response.ok) {
                    let errorMsg = `HTTP ${response.status}`;
                    try {
                        const errData = await response.json();
                        if (errData && errData.message) errorMsg = errData.message;
                    } catch {}
                    throw new Error(errorMsg);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    closeFixtureModal();
                    alert(`Fixture ${mode === 'add' ? 'created' : 'updated'} successfully`);
                    loadFixtures();
                } else {
                    alert(`Failed to ${mode} fixture: ${data.message}`);
                }
            })
            .catch(error => {
                alert(`Failed to ${mode} fixture: ${error.message}`);
                console.error(`Error ${mode === 'add' ? 'creating' : 'updating'} fixture:`, error);
            });
    }

    // Open modal for editing a fixture and populate form 
    function editFixture(fixtureId) {
        fetch(`/api/fixtures/${fixtureId}`, { method: 'GET', credentials: 'include' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const fixture = data.data;
                    const modal = document.getElementById('fixture-modal');
                    if (!modal) return;
                    const modalTitle = modal.querySelector('.modal-header h3');
                    if (modalTitle) modalTitle.textContent = 'Edit Fixture';
                    const fixtureForm = document.getElementById('fixture-form');
                    if (fixtureForm) {
                        fixtureForm.setAttribute('data-mode', 'edit');
                        fixtureForm.setAttribute('data-id', fixtureId);
                        const fixtureDate = new Date(fixture.date);
                        const formattedDate = fixtureDate.toISOString().split('T')[0];
                        document.getElementById('fixture-opponent').value = fixture.opponent;
                        document.getElementById('fixture-location').value = fixture.location;
                        document.getElementById('fixture-date').value = formattedDate;
                        document.getElementById('fixture-time').value = fixture.time;
                        document.getElementById('fixture-competition').value = fixture.competition;
                        document.getElementById('fixture-tickets-available').checked = fixture.tickets.available;
                        document.getElementById('fixture-tickets-url').value = fixture.tickets.url || '';
                    }
                    modal.style.display = 'block';
                } else {
                    alert('Failed to load fixture: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error loading fixture:', error);
                alert('Error loading fixture');
            });
    }

    // Open modal to update fixture result and populate form 
    function updateFixtureResult(fixtureId) {
        fetch(`/api/fixtures/${fixtureId}`, { method: 'GET', credentials: 'include' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const fixture = data.data;
                    const modal = document.getElementById('result-modal');
                    if (!modal) return;
                    const modalTitle = modal.querySelector('.modal-header h3');
                    if (modalTitle) modalTitle.textContent = 'Update Fixture Result';
                    const homeTeamLabel = document.getElementById('home-team-label');
                    const awayTeamLabel = document.getElementById('away-team-label');
                    if (homeTeamLabel && awayTeamLabel) {
                        if (fixture.location === 'home') {
                            homeTeamLabel.textContent = 'Fennec FC';
                            awayTeamLabel.textContent = fixture.opponent;
                        } else {
                            homeTeamLabel.textContent = fixture.opponent;
                            awayTeamLabel.textContent = 'Fennec FC';
                        }
                    }
                    const resultForm = document.getElementById('result-form');
                    if (resultForm) {
                        const newResultForm = resultForm.cloneNode(true);
                        resultForm.parentNode.replaceChild(newResultForm, resultForm);
                        newResultForm.setAttribute('data-id', fixtureId);
                        document.getElementById('home-score').value = fixture.result.homeScore !== null ? fixture.result.homeScore : '';
                        document.getElementById('away-score').value = fixture.result.awayScore !== null ? fixture.result.awayScore : '';
                        const statusSelect = document.getElementById('fixture-status');
                        if (statusSelect) statusSelect.value = fixture.result.status;
                        newResultForm.addEventListener('submit', handleResultFormSubmit);
                        const cancelResultBtn = document.getElementById('cancel-result');
                        if (cancelResultBtn) cancelResultBtn.addEventListener('click', closeFixtureModal);
                    }
                    modal.style.display = 'block';
                } else {
                    alert('Failed to load fixture: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error loading fixture:', error);
                alert('Error loading fixture');
            });
    }

    // Handle result form submission for update modal 
    function handleResultFormSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const fixtureId = form.getAttribute('data-id');
        const homeScore = parseInt(document.getElementById('home-score').value);
        const awayScore = parseInt(document.getElementById('away-score').value);
        const status = document.getElementById('fixture-status').value;
        if (!Number.isInteger(homeScore) || homeScore < 0 || !Number.isInteger(awayScore) || awayScore < 0) {
            alert('Please enter valid non-negative integer scores');
            return;
        }
        const resultData = { result: { homeScore, awayScore, status } };
        fetch(`/api/fixtures/${fixtureId}/result`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resultData),
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    closeFixtureModal();
                    alert('Fixture result updated successfully');
                    loadFixtures();
                } else {
                    alert('Failed to update fixture result: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error updating fixture result:', error);
                alert('Error updating fixture result');
            });
    }

    // Delete a fixture and refresh UI 
    function deleteFixture(fixtureId) {
        if (!confirm('Are you sure you want to delete this fixture?')) return;
        fetch(`/api/fixtures/${fixtureId}`, { method: 'DELETE', credentials: 'include' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Fixture deleted successfully');
                    loadFixtures();
                } else {
                    alert('Failed to delete fixture: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error deleting fixture:', error);
                alert('Error deleting fixture');
            });
    }
});
