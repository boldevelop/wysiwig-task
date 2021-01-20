const buttons = document.querySelector('.toolkit').querySelectorAll('button');
const editor = document.querySelector('.edit-area');

const styleProperties = ['fontSize', 'lineHeight', 'fontWeight', 'color', 'fontFamily', 'fontStyle'];
const header1Class = 'header1-text';
const header2Class = 'header2-text';
const boldClass = 'bold-text';
const italicClass = 'italic-text';

/** Detect empty selection.
 * @param selection {Selection}
 * @return {boolean}
 * */
const isEmptySelection = (selection) => !Boolean(selection.toString());

/** Return applying class for element.
 * @param {string} btnClass - class pressed button
 * @return {string}
 * */
const getClass = (btnClass) => {
    switch (btnClass) {
        case 'head-1':
            return header1Class
        case 'head-2':
            return header2Class
        case 'bold':
            return boldClass
        case 'italic':
            return italicClass
    }
};

/** Return applying class for element.
 * @param {Range} range - class pressed button
 * @param {HTMLElement} element - class pressed button
 * */
const insertNode = (range, element) => {
    range.deleteContents();
    range.insertNode(element);
};

/** Create root element by applying class.
 * @param {string} className - class pressed button
 * @return {HTMLElement}
 * */
const createElement = (className) => {
    let newElement;
    switch (className) {
        case header1Class:
            newElement = document.createElement('h1');
            break;
        case header2Class:
            newElement = document.createElement('h2');
            break;
        default:
            newElement = document.createElement('span');
            break;
    }
    newElement.className = className;
    return newElement;
};

/**
 * @param {NodeList} nodeListWithSameClass
 * */
const sanitizeNodesWithSameClass = (nodeListWithSameClass) => {
    nodeListWithSameClass.forEach( (node) => {
        node.className = '';
    });
};

/**
 * @param {HTMLElement} newElement
 * */
const sanitizeGarbageTags = (newElement) => {
    const spanNodeList = newElement.querySelectorAll('*');
    /** replace tags without styling class to plain/text */
    spanNodeList.forEach( (node) => {
        if (node.className === '') {
            const parent = node.parentNode;
            while( node.firstChild ) {
                parent.insertBefore(  node.firstChild, node );
            }
            parent.removeChild( node );
        }
    });
};

/**
 * Remove empty tags from editor
 * */
const sanitizeEditorGarbageTags = () => {
    const allTags = editor.querySelectorAll('*');
    allTags.forEach((node) => {
        if (node.nodeType !== 3 && node.innerHTML === '') {
            node.remove();
        }
    });
    editor.normalize();
};

/** Detect is edited text at editor
 * @param {HTMLElement || ParentNode || Node} parent
 * @return {boolean}
 * */
const isSelectionAtEditArea = (parent) => {
    if (parent && parent.nodeType !== 3 && parent.className === 'edit-area') {
        return true;
    }
    if (parent && parent.className === 'editor') {
        return false;
    }
    return parent && isSelectionAtEditArea(parent.parentNode);
}

/**
 * create inline Styles on elements
 * */
createInlineStyles = () => {
    const nodeList = editor.querySelectorAll(`*`);
    nodeList.forEach( (node) => {
        const nodeStyle = getComputedStyle(node);
        const nodeClass = node.className;
        styleProperties.forEach( (prop) => {
            if (prop === 'fontStyle' && nodeClass !== italicClass) {
                return;
            }
            if (prop === 'fontWeight'
                && nodeClass !== boldClass
                && nodeClass !== header1Class
                && nodeClass !== header2Class
            ) {
                return;
            }
            node.style[prop] = nodeStyle[prop];
        });
    })
}

buttons.forEach((btn) => {

    btn.addEventListener('click', () => {
        if (document.getSelection) {
            const selection = document.getSelection();

            if (isEmptySelection(selection)) {
                return;
            }

            const range = selection.getRangeAt(0);

            if (!isSelectionAtEditArea(range.commonAncestorContainer)) {
                return;
            }

            const oldContent = range.extractContents();

            const customizingClass = getClass(btn.className);
            const rootSpan = document.createElement('span');
            rootSpan.appendChild( oldContent.cloneNode(true) );

            sanitizeNodesWithSameClass(rootSpan.querySelectorAll(`.${customizingClass}`));

            const newElement = createElement(customizingClass);
            newElement.appendChild(rootSpan);

            sanitizeGarbageTags(newElement);

            insertNode(range, newElement);
            sanitizeEditorGarbageTags();
            createInlineStyles();
        }
    })
});


/** PASTE COPY CUT EVENT */

/**
 * Identify parent class for case:
 *  <span class="bold">so|me te|xt</span>
 *                       ^-----^
 *  @param selection {Selection}
 *  @return {string}
 *  */
const identifyParentClass = (selection) => {
    const parentNode = selection.focusNode.parentNode;
    let classParentNode = '';
    if (parentNode === selection.anchorNode.parentNode && parentNode.nodeType !== 3 && parentNode.className) {
        const parentClass = parentNode.className;
        if (parentClass === header1Class
            || parentClass === header2Class
            || parentClass === boldClass
            || parentClass === italicClass
        ) {
            classParentNode = parentClass;
        }

    }
    return classParentNode;
}

/**
* @param event {Event}
* @param isCut {boolean}
* */
const cutCopyListener = (event, isCut = false) => {
    const clipboardData = (event.clipboardData || window.clipboardData);
    const selection = document.getSelection();

    const classParentNode = identifyParentClass(selection);

    const range = selection.getRangeAt(0);
    const oldContent = isCut ? range.extractContents() : range.cloneContents();

    const rootSpan = createElement(classParentNode);
    rootSpan.appendChild( oldContent.cloneNode(true) );

    clipboardData.setData('text/html', rootSpan.outerHTML + "");
    event.preventDefault();
    sanitizeEditorGarbageTags();
}

editor.addEventListener('cut', (event) => {
    cutCopyListener(event, true);
});

editor.addEventListener('copy', (event) => {
    cutCopyListener(event);
});
