function loadExample(type) {
    switch (type) {
        case 'jsonplaceholder':
            document.getElementById('targetUrl').value = 'https://jsonplaceholder.typicode.com/posts/1';
            document.getElementById('method').value = 'GET';
            document.getElementById('headers').value = '{\n  "Content-Type": "application/json",\n  "Accept": "application/json"\n}';
            document.getElementById('body').value = '';
            break;
        case 'post':
            document.getElementById('targetUrl').value = 'https://jsonplaceholder.typicode.com/posts';
            document.getElementById('method').value = 'POST';
            document.getElementById('headers').value = '{\n  "Content-Type": "application/json",\n  "Accept": "application/json"\n}';
            document.getElementById('body').value = '{\n  "title": "Test Post",\n  "body": "This is a test post through the CORS proxy",\n  "userId": 1\n}';
            break;
        case 'put':
            document.getElementById('targetUrl').value = 'https://jsonplaceholder.typicode.com/posts/1';
            document.getElementById('method').value = 'PUT';
            document.getElementById('headers').value = '{\n  "Content-Type": "application/json",\n  "Accept": "application/json"\n}';
            document.getElementById('body').value = '{\n  "id": 1,\n  "title": "Updated Post",\n  "body": "This post was updated through the CORS proxy",\n  "userId": 1\n}';
            break;
        case 'image':
            document.getElementById('targetUrl').value = 'https://picsum.photos/200';
            document.getElementById('method').value = 'GET';
            document.getElementById('headers').value = '{\n  "Accept": "image/jpeg"\n}';
            document.getElementById('body').value = '';
            break;
        case 'weather':
            document.getElementById('targetUrl').value = 'https://api.openweathermap.org/data/2.5/weather?q=London';
            document.getElementById('method').value = 'GET';
            document.getElementById('headers').value = '{\n  "Accept": "application/json"\n}';
            document.getElementById('body').value = '';
            break;
    }
    updateRequestUrl();
}