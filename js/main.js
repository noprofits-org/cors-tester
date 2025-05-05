function updateRequestUrl() {
    const proxyUrl = document.getElementById('proxyUrl').value;
    const targetUrl = document.getElementById('targetUrl').value;
    const url = `${proxyUrl}?url=${encodeURIComponent(targetUrl)}`;
    document.getElementById('requestUrlCode').textContent = url;
}

function copyToClipboard(elementId) {
    const text = document.getElementById(elementId).textContent;
    navigator.clipboard.writeText(text).then(
        () => {
            const btn = document.querySelector('.copy-btn');
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 1500);
        },
        (err) => {
            console.error('Failed to copy: ', err);
        }
    );
}

function clearResponse() {
    document.getElementById('statusContainer').innerHTML = '';
    document.getElementById('responseData').innerText = 'No data yet. Send a request to see results.';
    document.getElementById('responseHeaders').innerText = 'No headers yet. Send a request to see results.';
    document.getElementById('rawResponse').innerText = 'No raw response yet. Send a request to see results.';
    document.getElementById('requestDetails').innerText = 'No request details yet. Send a request to see results.';
}

document.addEventListener('DOMContentLoaded', () => {
    updateRequestUrl();

    // Tab switching functionality
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            document.getElementById('dataContainer').style.display = 'none';
            document.getElementById('headersContainer').style.display = 'none';
            document.getElementById('rawContainer').style.display = 'none';
            document.getElementById('requestContainer').style.display = 'none';

            const tabName = tab.getAttribute('data-tab');
            if (tabName === 'data') {
                document.getElementById('dataContainer').style.display = 'block';
            } else if (tabName === 'headers') {
                document.getElementById('headersContainer').style.display = 'block';
            } else if (tabName === 'raw') {
                document.getElementById('rawContainer').style.display = 'block';
            } else if (tabName === 'request') {
                document.getElementById('requestContainer').style.display = 'block';
            }
        });
    });

    // Update request URL preview when inputs change
    document.getElementById('proxyUrl').addEventListener('input', updateRequestUrl);
    document.getElementById('targetUrl').addEventListener('input', updateRequestUrl);

    // Send request
    document.getElementById('sendBtn').addEventListener('click', async function () {
        const proxyUrl = document.getElementById('proxyUrl').value;
        const targetUrl = document.getElementById('targetUrl').value;
        const method = document.getElementById('method').value;

        // Clear previous responses
        document.getElementById('statusContainer').innerHTML = '';
        document.getElementById('responseData').innerText = 'Loading...';
        document.getElementById('responseHeaders').innerText = 'Loading...';
        document.getElementById('rawResponse').innerText = 'Loading...';
        document.getElementById('requestDetails').innerText = 'Loading...';

        // Parse headers
        let headers = {};
        try {
            const headerText = document.getElementById('headers').value.trim();
            if (headerText) {
                headers = JSON.parse(headerText);
            }
        } catch (e) {
            showError('Invalid JSON in headers: ' + e.message);
            return;
        }

        // Parse body for applicable methods
        let body = null;
        if (['POST', 'PUT', 'PATCH'].includes(method)) {
            try {
                const bodyText = document.getElementById('body').value.trim();
                if (bodyText) {
                    if (headers['Content-Type'] === 'application/json') {
                        body = JSON.stringify(JSON.parse(bodyText));
                    } else {
                        body = bodyText;
                    }
                }
            } catch (e) {
                showError('Invalid JSON in body: ' + e.message);
                return;
            }
        }

        // Construct URL
        const url = `${proxyUrl}?url=${encodeURIComponent(targetUrl)}`;

        try {
            // Prepare fetch options
            const fetchOptions = {
                method: method,
                headers: headers,
                mode: 'cors'
            };

            if (body) {
                fetchOptions.body = body;
            }

            // Record request details for display
            const requestDetails = {
                url: url,
                method: method,
                headers: headers,
                body: body
            };
            
            document.getElementById('requestDetails').innerText = JSON.stringify(requestDetails, null, 2);

            // Make the request
            const start = Date.now();
            const response = await fetch(url, fetchOptions);
            const elapsed = Date.now() - start;

            // Display status
            const statusClass = response.ok ? 'success' : 'error';
            document.getElementById('statusContainer').innerHTML = `
                <div class="status ${statusClass}">
                    <p><strong>Status:</strong> ${response.status} ${response.statusText}</p>
                    <p><strong>Time:</strong> ${elapsed}ms</p>
                </div>
            `;

            // Display headers
            const headerObj = {};
            response.headers.forEach((value, key) => {
                headerObj[key] = value;
            });
            document.getElementById('responseHeaders').innerText = JSON.stringify(headerObj, null, 2);

            // Clone the response for multiple reads
            const clonedResponse = response.clone();

            // Get content type
            const contentType = response.headers.get('content-type') || '';

            // Handle different content types
            if (contentType.includes('application/json')) {
                try {
                    const jsonData = await response.json();
                    document.getElementById('responseData').innerText = JSON.stringify(jsonData, null, 2);
                    document.getElementById('rawResponse').innerText = JSON.stringify(jsonData);
                } catch (e) {
                    const text = await clonedResponse.text();
                    document.getElementById('responseData').innerText = text;
                    document.getElementById('rawResponse').innerText = text;
                }
            } else if (contentType.includes('image/')) {
                const blob = await response.blob();
                const imageUrl = URL.createObjectURL(blob);
                document.getElementById('responseData').innerHTML = `<img src="${imageUrl}" alt="Image Response" style="max-width:100%">`;
                document.getElementById('rawResponse').innerText = '[Binary Image Data]';
            } else if (contentType.includes('text/')) {
                const text = await response.text();
                document.getElementById('responseData').innerText = text;
                document.getElementById('rawResponse').innerText = text;
            } else {
                const text = await response.text();
                document.getElementById('responseData').innerText = '[Binary Data]';
                document.getElementById('rawResponse').innerText = text.length > 1000 ?
                    text.substring(0, 1000) + '... [truncated]' : text;
            }

        } catch (error) {
            showError('Error: ' + error.message);
            console.error(error);
        }
    });

    function showError(message) {
        document.getElementById('statusContainer').innerHTML = `
            <div class="status error">
                <p><strong>Error:</strong> ${message}</p>
            </div>
        `;
        document.getElementById('responseData').innerText = 'Request failed. See error above.';
        document.getElementById('responseHeaders').innerText = 'No headers available due to error.';
        document.getElementById('rawResponse').innerText = 'No raw response available due to error.';
    }
});