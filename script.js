const buttons = document.querySelector('.toolkit').querySelectorAll('button');
const editor = document.querySelector('.edit-area');

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
            return 'header1-text'
        case 'head-2':
            return 'header2-text'
        case 'bold':
            return 'bold-text'
        case 'italic':
            return 'italic-text'
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
        case 'header1-text':
            newElement = document.createElement('h1');
            break;
        case 'header2-text':
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
        }
    })
});


/** PASTE COPY CUT EVENT */

/*
* Helvetica cuz MS word identify it
* */
const fontFamily = 'font-family: Helvetica, Arial, sans-serif;'
const header1Style = `font-size: 24px; ${fontFamily}`;
const header2Style = `font-size: 19px; ${fontFamily}`;
const boldStyle = `font-weight: 900; ${fontFamily}`;
const italicStyle = `font-style: italic; ${fontFamily}`;

editor.addEventListener('paste', () => {
    /** delete all styles element in editor */
    setTimeout(() => {
        /** setTimeout for call func of the end call stack */
        const allElementWithStyle = editor.querySelectorAll('[style]');
        allElementWithStyle.forEach((node) => {
            node.removeAttribute('style');
        })
    }, 0);
});

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
    if (
        parentNode === selection.anchorNode.parentNode
        && parentNode.nodeType !== 3
        && parentNode.className
    ) {
        const parentClass = parentNode.className;
        /** todo: add variables with className (header1-text, header2-text, bold-text, italic-text)  */
        if (parentClass === 'header1-text'
            || parentClass === 'header2-text'
            || parentClass === 'bold-text'
            || parentClass === 'italic-text'
        ) {
            classParentNode = parentClass;
        }

    }
    return classParentNode;
}

/**
 * Add style attribute for copied content with class
 *  @param {HTMLElement} rootSpan root node of content
 *  @return {void}
 *  */
const addStyleAttrForInnerSelectionContent = (rootSpan) => {
    const headers1 = rootSpan.querySelectorAll('.header1-text');
    headers1.forEach(node => node.style = header1Style);

    const headers2 = rootSpan.querySelectorAll('.header2-text');
    headers2.forEach(node => node.style = header2Style);

    const bold = rootSpan.querySelectorAll('.bold-text');
    bold.forEach(node => node.style = boldStyle);

    const italic = rootSpan.querySelectorAll('.italic-text');
    italic.forEach(node => node.style = italicStyle);
};

/**
 * Add style attribute for root node
 *  @param {HTMLElement} rootSpan root node of content
 *  @return {void}
 *  */
const addStyleAttrForRoot = (rootSpan) => {
    switch (rootSpan.className) {
        case 'header1-text':
            rootSpan.style = header1Style;
            break;
        case 'header2-text':
            rootSpan.style = header2Style;
            break;
        case 'bold-text':
            rootSpan.style = boldStyle;
            break;
        case 'italic-text':
            rootSpan.style = italicStyle;
            break;
        default:
            rootSpan.style = fontFamily;
            break;
    }
}

editor.addEventListener('cut', (event) => {
    const clipboardData = (event.clipboardData || window.clipboardData);
    const selection = document.getSelection();

    const classParentNode = identifyParentClass(selection);

    const range = selection.getRangeAt(0);
    const oldContent = range.extractContents();

    const rootSpan = createElement(classParentNode);
    rootSpan.appendChild( oldContent.cloneNode(true) );

    addStyleAttrForInnerSelectionContent(rootSpan);
    addStyleAttrForRoot(rootSpan);

    clipboardData.setData('text/html', rootSpan.outerHTML + "");
    event.preventDefault();
    sanitizeEditorGarbageTags();
});

// repeated code...
editor.addEventListener('copy', (event) => {
    const clipboardData = (event.clipboardData || window.clipboardData);
    const selection = document.getSelection();

    const classParentNode = identifyParentClass(selection);

    const range = selection.getRangeAt(0);
    const oldContent = range.cloneContents();

    const rootSpan = createElement(classParentNode);
    rootSpan.appendChild( oldContent.cloneNode(true) );

    addStyleAttrForInnerSelectionContent(rootSpan);
    addStyleAttrForRoot(rootSpan);

    clipboardData.setData('text/html', rootSpan.outerHTML + "");
    event.preventDefault();
    sanitizeEditorGarbageTags();
});
