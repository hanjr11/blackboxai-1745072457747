document.addEventListener('DOMContentLoaded', () => {
  const createForm = document.getElementById('create-form');
  const campaignInput = document.getElementById('campaignName');
  const resultDiv = document.getElementById('result');
  const viewDataForm = document.getElementById('view-data-form');
  const trackingIdInput = document.getElementById('trackingId');
  const mapContainer = document.getElementById('map');
  const visitsList = document.getElementById('visits-list');
  const linksList = document.getElementById('links-list');
  const refreshLinksBtn = document.getElementById('refresh-links');
  let map;
  let markersLayer;

  // Initialize Leaflet map
  function initMap() {
    if (map) {
      map.remove();
    }
    map = L.map('map').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    markersLayer = L.layerGroup().addTo(map);
  }

  // Add markers to map
  function addMarkers(visits) {
    markersLayer.clearLayers();
    visits.forEach((visit) => {
      if (visit.latitude && visit.longitude) {
        const marker = L.marker([visit.latitude, visit.longitude]);
        const popupContent = `
          <b>IP:</b> ${visit.ip}<br/>
          <b>Time:</b> ${new Date(visit.timestamp).toLocaleString()}<br/>
          <b>Location:</b> ${visit.city}, ${visit.region}, ${visit.country}
        `;
        marker.bindPopup(popupContent);
        markersLayer.addLayer(marker);
      }
    });
  }

  // Display visits list
  function displayVisits(visits) {
    visitsList.innerHTML = '';
    if (visits.length === 0) {
      visitsList.innerHTML = '<p>No visits recorded yet.</p>';
      return;
    }
    const table = document.createElement('table');
    table.className = 'min-w-full divide-y divide-gray-200';
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
      </tr>
    `;
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    tbody.className = 'bg-white divide-y divide-gray-200';
    visits.forEach((visit) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${new Date(visit.timestamp).toLocaleString()}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${visit.ip}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${visit.city}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${visit.region}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${visit.country}</td>
      `;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    visitsList.appendChild(table);
  }

  // Copy text to clipboard
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard');
    }).catch(() => {
      alert('Failed to copy');
    });
  }

  // Generate QR code for a given element and text
  function generateQRCode(element, text) {
    element.innerHTML = '';
    QRCode.toCanvas(text, { width: 100 }, (error, canvas) => {
      if (error) {
        console.error(error);
        element.textContent = 'QR code error';
        return;
      }
      element.appendChild(canvas);
    });
  }

  // Render tracking links dashboard
  async function renderLinks() {
    linksList.innerHTML = 'Loading...';
    try {
      const response = await fetch('/api/links');
      if (!response.ok) {
        throw new Error('Failed to fetch tracking links');
      }
      const links = await response.json();
      if (links.length === 0) {
        linksList.innerHTML = '<p>No tracking links created yet.</p>';
        return;
      }
      linksList.innerHTML = '';
      links.forEach(link => {
        const div = document.createElement('div');
        div.className = 'border border-gray-300 rounded p-3 flex flex-col space-y-2 bg-gray-50';

        const campaign = link.campaignName ? link.campaignName : 'No name';
        const createdAt = new Date(link.createdAt).toLocaleString();

        div.innerHTML = `
          <div class="flex justify-between items-center">
            <div>
              <p class="font-semibold">${campaign}</p>
              <p class="text-xs text-gray-600">Created: ${createdAt}</p>
              <p class="text-xs text-gray-600">Visits: ${link.visitCount}</p>
            </div>
            <div class="flex flex-col items-center space-y-1">
              <button class="copy-btn bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 focus:outline-none" title="Copy Link">Copy</button>
              <div class="qr-code"></div>
            </div>
          </div>
          <p class="text-xs break-all text-blue-700 underline cursor-pointer view-data" title="View Data">${link.trackingUrl}</p>
        `;

        // Copy button event
        div.querySelector('.copy-btn').addEventListener('click', () => {
          copyToClipboard(link.trackingUrl);
        });

        // Generate QR code
        const qrCodeDiv = div.querySelector('.qr-code');
        generateQRCode(qrCodeDiv, link.trackingUrl);

        // View data click event
        div.querySelector('.view-data').addEventListener('click', () => {
          trackingIdInput.value = link.id;
          viewDataForm.dispatchEvent(new Event('submit'));
        });

        linksList.appendChild(div);
      });
    } catch (error) {
      linksList.innerHTML = `<p class="text-red-600">${error.message}</p>`;
    }
  }

  // Handle create form submission
  createForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    resultDiv.textContent = 'Generating tracking link...';
    try {
      const response = await fetch('/api/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignName: campaignInput.value.trim() }),
      });
      if (!response.ok) {
        throw new Error('Failed to create tracking link');
      }
      const data = await response.json();
      resultDiv.innerHTML = `
        <p class="text-green-600">Tracking link created:</p>
        <a href="${data.trackingUrl}" target="_blank" class="text-blue-600 underline break-all">${data.trackingUrl}</a>
        <button id="copy-new-link" class="mt-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 focus:outline-none">Copy Link</button>
      `;
      document.getElementById('copy-new-link').addEventListener('click', () => {
        copyToClipboard(data.trackingUrl);
      });
      campaignInput.value = '';
      await renderLinks();
    } catch (error) {
      resultDiv.textContent = error.message;
      resultDiv.classList.add('text-red-600');
    }
  });

  // Handle view data form submission
  viewDataForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = trackingIdInput.value.trim();
    if (!id) {
      alert('Please enter a tracking ID');
      return;
    }
    visitsList.innerHTML = 'Loading tracking data...';
    initMap();
    try {
      const response = await fetch(`/api/data/${id}`);
      if (!response.ok) {
        throw new Error('Tracking data not found');
      }
      const data = await response.json();
      if (data.visits.length === 0) {
        visitsList.innerHTML = '<p>No visits recorded yet.</p>';
        return;
      }
      addMarkers(data.visits);
      displayVisits(data.visits);
    } catch (error) {
      visitsList.innerHTML = `<p class="text-red-600">${error.message}</p>`;
    }
  });

  // Refresh links button
  refreshLinksBtn.addEventListener('click', () => {
    renderLinks();
  });

  // Initialize map and render links on page load
  initMap();
  renderLinks();
});
