document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const canvas = document.getElementById('canvas');
    const elements = document.querySelectorAll('.element');
    const propertiesForm = document.getElementById('properties-form');
    const formContent = document.getElementById('form-content');
    const previewBtn = document.getElementById('preview-btn');
    const previewModal = document.getElementById('preview-modal');
    const closeBtn = document.querySelector('.close-btn');
    const previewContent = document.getElementById('preview-content');
    
    let selectedElement = null;
    let offsetX, offsetY;
    let isDragging = false;
    
    // Make elements draggable
    elements.forEach(element => {
        element.addEventListener('dragstart', dragStart);
        element.addEventListener('touchstart', touchStart, { passive: false });
    });
    
    // Canvas drag and drop events
    canvas.addEventListener('dragover', dragOver);
    canvas.addEventListener('dragenter', dragEnter);
    canvas.addEventListener('dragleave', dragLeave);
    canvas.addEventListener('drop', drop);
    canvas.addEventListener('touchmove', touchMove, { passive: false });
    canvas.addEventListener('touchend', touchEnd);
    
    // Preview modal
    previewBtn.addEventListener('click', showPreview);
    closeBtn.addEventListener('click', () => {
        previewModal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === previewModal) {
            previewModal.style.display = 'none';
        }
    });
    
    // Functions
    function dragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.type);
    }
    
    function touchStart(e) {
        const element = e.target.closest('.element');
        if (element) {
            e.preventDefault();
            e.dataTransfer = { getData: () => element.dataset.type };
            dragStart(e);
        }
    }
    
    function dragOver(e) {
        e.preventDefault();
        canvas.style.borderColor = '#3498db';
    }
    
    function dragEnter(e) {
        e.preventDefault();
    }
    
    function dragLeave() {
        if (!isDragging) {
            canvas.style.borderColor = '#bdc3c7';
        }
    }
    
    function drop(e) {
        e.preventDefault();
        canvas.style.borderColor = '#bdc3c7';
        isDragging = false;
        
        let type;
        let clientX, clientY;
        
        if (e.type === 'touchend') {
            type = e.dataTransfer.getData();
            const touch = e.changedTouches[0];
            clientX = touch.clientX;
            clientY = touch.clientY;
        } else {
            type = e.dataTransfer.getData('text/plain');
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        createElement(type, x, y);
    }
    
    function touchMove(e) {
        e.preventDefault();
        isDragging = true;
        canvas.style.borderColor = '#3498db';
    }
    
    function touchEnd(e) {
        if (isDragging) {
            drop(e);
        }
    }
    
    function createElement(type, x, y) {
        const element = document.createElement('div');
        element.className = `canvas-element ${type}-element`;
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.dataset.type = type;
        
        switch(type) {
            case 'text':
                element.textContent = 'Double click to edit';
                element.contentEditable = true;
                element.style.color = '#000000';
                element.style.fontSize = '16px';
                break;
            case 'image':
                element.innerHTML = '<img src="https://via.placeholder.com/150" alt="Image">';
                element.querySelector('img').style.maxWidth = '100%';
                break;
            case 'button':
                element.textContent = 'Click Me';
                element.style.backgroundColor = '#3498db';
                element.style.color = '#ffffff';
                element.style.padding = '0.5rem 1rem';
                element.style.borderRadius = '4px';
                element.style.textAlign = 'center';
                break;
        }
        
        element.addEventListener('mousedown', startDrag);
        element.addEventListener('touchstart', startDrag);
        element.addEventListener('click', selectElement);
        
        canvas.appendChild(element);
        selectElement({ currentTarget: element });
        
        // For mobile, ensure the element is placed properly
        adjustElementPosition(element);
    }
    
    function adjustElementPosition(element) {
        const canvasRect = canvas.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        
        let x = parseInt(element.style.left);
        let y = parseInt(element.style.top);
        
        // Ensure element stays within canvas bounds
        x = Math.max(0, Math.min(x, canvasRect.width - elementRect.width));
        y = Math.max(0, Math.min(y, canvasRect.height - elementRect.height));
        
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
    }
    
    function startDrag(e) {
        if (e.target !== e.currentTarget && !e.target.classList.contains('canvas-element')) return;
        
        selectedElement = e.currentTarget;
        const rect = selectedElement.getBoundingClientRect();
        
        if (e.type === 'mousedown') {
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
        } else if (e.type === 'touchstart') {
            const touch = e.touches[0];
            offsetX = touch.clientX - rect.left;
            offsetY = touch.clientY - rect.top;
        }
        
        document.addEventListener('mousemove', dragElement);
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchmove', dragElement);
        document.addEventListener('touchend', stopDrag);
    }
    
    function dragElement(e) {
        if (!selectedElement) return;
        
        let clientX, clientY;
        
        if (e.type === 'mousemove') {
            clientX = e.clientX;
            clientY = e.clientY;
        } else if (e.type === 'touchmove') {
            const touch = e.touches[0];
            clientX = touch.clientX;
            clientY = touch.clientY;
            e.preventDefault();
        }
        
        const canvasRect = canvas.getBoundingClientRect();
        let x = clientX - canvasRect.left - offsetX;
        let y = clientY - canvasRect.top - offsetY;
        
        // Boundary checks
        x = Math.max(0, Math.min(x, canvasRect.width - selectedElement.offsetWidth));
        y = Math.max(0, Math.min(y, canvasRect.height - selectedElement.offsetHeight));
        
        selectedElement.style.left = `${x}px`;
        selectedElement.style.top = `${y}px`;
    }
    
    function stopDrag() {
        document.removeEventListener('mousemove', dragElement);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchmove', dragElement);
        document.removeEventListener('touchend', stopDrag);
    }
    
    function selectElement(e) {
        // Prevent selection when dragging
        if (isDragging) return;
        
        // Deselect all elements
        document.querySelectorAll('.canvas-element').forEach(el => {
            el.classList.remove('selected');
        });
        
        selectedElement = e.currentTarget;
        selectedElement.classList.add('selected');
        showProperties(selectedElement);
    }
    
    function showProperties(element) {
        const type = element.dataset.type;
        
        let formHTML = '';
        
        switch(type) {
            case 'text':
                formHTML = `
                    <div class="form-group">
                        <label for="text-content">Text</label>
                        <textarea id="text-content">${element.textContent}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="text-color">Color</label>
                        <input type="color" id="text-color" value="${element.style.color || '#000000'}">
                    </div>
                    <div class="form-group">
                        <label for="text-size">Font Size (px)</label>
                        <input type="number" id="text-size" value="${parseInt(element.style.fontSize) || 16}">
                    </div>
                    <div class="form-actions">
                        <button type="button" id="apply-properties">Apply</button>
                        <button type="button" id="delete-element">Delete</button>
                    </div>
                `;
                break;
            case 'image':
                formHTML = `
                    <div class="form-group">
                        <label for="image-src">Image URL</label>
                        <input type="url" id="image-src" value="${element.querySelector('img').src}">
                    </div>
                    <div class="form-group">
                        <label for="image-width">Width (px)</label>
                        <input type="number" id="image-width" value="${element.querySelector('img').width || 150}">
                    </div>
                    <div class="form-group">
                        <label for="image-alt">Alt Text</label>
                        <input type="text" id="image-alt" value="${element.querySelector('img').alt || ''}">
                    </div>
                    <div class="form-actions">
                        <button type="button" id="apply-properties">Apply</button>
                        <button type="button" id="delete-element">Delete</button>
                    </div>
                `;
                break;
            case 'button':
                formHTML = `
                    <div class="form-group">
                        <label for="button-text">Text</label>
                        <input type="text" id="button-text" value="${element.textContent}">
                    </div>
                    <div class="form-group">
                        <label for="button-color">Background Color</label>
                        <input type="color" id="button-color" value="${element.style.backgroundColor || '#3498db'}">
                    </div>
                    <div class="form-group">
                        <label for="button-text-color">Text Color</label>
                        <input type="color" id="button-text-color" value="${element.style.color || '#ffffff'}">
                    </div>
                    <div class="form-group">
                        <label for="button-link">Link URL (optional)</label>
                        <input type="url" id="button-link" value="${element.dataset.link || ''}">
                    </div>
                    <div class="form-actions">
                        <button type="button" id="apply-properties">Apply</button>
                        <button type="button" id="delete-element">Delete</button>
                    </div>
                `;
                break;
        }
        
        formContent.innerHTML = formHTML;
        
        // Add event listeners to form buttons
        const applyBtn = document.getElementById('apply-properties');
        const deleteBtn = document.getElementById('delete-element');
        
        if (applyBtn) applyBtn.addEventListener('click', applyProperties);
        if (deleteBtn) deleteBtn.addEventListener('click', deleteElement);
    }
    
    function applyProperties() {
        if (!selectedElement) return;
        
        const type = selectedElement.dataset.type;
        
        try {
            switch(type) {
                case 'text':
                    selectedElement.textContent = document.getElementById('text-content').value;
                    selectedElement.style.color = document.getElementById('text-color').value;
                    selectedElement.style.fontSize = `${document.getElementById('text-size').value}px`;
                    break;
                case 'image':
                    const img = selectedElement.querySelector('img');
                    const newSrc = document.getElementById('image-src').value;
                    
                    // Verify image URL
                    const testImg = new Image();
                    testImg.onload = function() {
                        img.src = newSrc;
                        img.width = document.getElementById('image-width').value;
                        img.alt = document.getElementById('image-alt').value;
                    };
                    testImg.onerror = function() {
                        alert('Invalid image URL. Using placeholder instead.');
                        img.src = 'https://via.placeholder.com/150';
                    };
                    testImg.src = newSrc;
                    break;
                case 'button':
                    selectedElement.textContent = document.getElementById('button-text').value;
                    selectedElement.style.backgroundColor = document.getElementById('button-color').value;
                    selectedElement.style.color = document.getElementById('button-text-color').value;
                    
                    const link = document.getElementById('button-link').value;
                    if (link) {
                        selectedElement.dataset.link = link;
                        selectedElement.onclick = function() {
                            window.open(link, '_blank');
                        };
                    }
                    break;
            }
        } catch (error) {
            console.error('Error applying properties:', error);
            alert('Error applying properties. Please check your inputs.');
        }
    }
    
    function deleteElement() {
        if (selectedElement) {
            selectedElement.remove();
            selectedElement = null;
            formContent.innerHTML = '<p>Select an element to edit</p>';
        }
    }
    
    function showPreview() {
        previewContent.innerHTML = canvas.innerHTML;
        
        // Remove canvas-specific classes and styles
        previewContent.querySelectorAll('.canvas-element').forEach(el => {
            el.classList.remove('canvas-element', 'selected');
            el.style.position = 'relative';
            el.style.left = '';
            el.style.top = '';
            el.style.margin = '0 auto 1rem';
            el.style.cursor = 'default';
            
            if (el.dataset.type === 'image') {
                el.style.display = 'block';
                el.style.textAlign = 'center';
            }
            
            // Make buttons functional
            if (el.dataset.type === 'button' && el.dataset.link) {
                el.onclick = function() {
                    window.open(el.dataset.link, '_blank');
                };
            }
        });
        
        previewModal.style.display = 'block';
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (selectedElement) {
            adjustElementPosition(selectedElement);
        }
    });
});