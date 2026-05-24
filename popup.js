const themeToggle = document.getElementById('theme-toggle');

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');

    themeToggle.textContent = isDark ? '☀️' : '🌙';

    chrome.storage.local.set({darkMode: isDark});
});

document.getElementById('add').addEventListener('click', () => {
    const domain = document.getElementById('domain').value.toLowerCase();
    const limit = parseInt(document.getElementById('limit').value, 10);
    
    if(domain && limit) {
        chrome.storage.local.get(['trackedSites'], (result) => {
            const sites = result.trackedSites || {};
            sites[domain] = {limit: limit, spent: 0};
            
            chrome.storage.local.set({trackedSites: sites}, () => {
                updateList(sites);
            });
        });
    }
});

function updateList(sites) {
    const listBody = document.getElementById('list');
    listBody.innerHTML = '';

    for(const [domain, data] of Object.entries(sites)) {
        listBody.innerHTML += `
        <tr>
            <td> ${domain} </td>
            <td> ${data.spent} / ${data.limit} </td>
            <td><button class = "remove-btn" data-domain = "${domain}"> Remove </button></td>
        </tr>`;
    }

    const removeButtons = document.querySelectorAll('.remove-btn');
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const domainToRemove = this.getAttribute('data-domain');
            removeSite(domainToRemove);
        });
    });
}

function removeSite(domain) {
    chrome.storage.local.get(['trackedSites'], (result) => {
        const sites = result.trackedSites || {};
        delete sites[domain];

        chrome.storage.local.set({trackedSites: sites}, () => {
            updateList(sites);
        });
    });
}

chrome.storage.local.get(['trackedSites', 'darkMode'], (result) => {
    if(result.darkMode) {
        document.body.classList.add("dark-mode");
        document.getElementById('theme-toggle').textContent = '☀️';
    }
    
    if(result.trackedSites) updateList(result.trackedSites);
});