const buttons = document.querySelector('.toolkit').querySelectorAll('button');
const editor = document.querySelector('.edit-area');

const header1Style = `font-size: 24px;`;
const header2Style = `font-size: 19px;`;

const isEmptySelection = (selection) => !Boolean(selection.toString());
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
const insertNode = (range, element) => {
    range.deleteContents();
    range.insertNode(element);
};
const createElement = (className) => {
    let newElement;
    switch (className) {
        case 'header1-text':
            newElement = document.createElement('h1');
            newElement.setAttribute("style", header1Style);
            break;
        case 'header2-text':
            newElement = document.createElement('h2');
            newElement.setAttribute("style", header2Style);
            break;
        default:
            newElement = document.createElement('span');
            break;
    }
    newElement.classList.add(className);
    return newElement;
};
const sanitizeNodesWithSameClass = (nodeListWithSameClass) => {
    nodeListWithSameClass.forEach( (node) => {
        node.className = '';
    });
};
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
const sanitizeEditorGarbageTags = () => {
    const allTags = editor.querySelectorAll('*');
    /** remove empty tags */
    allTags.forEach((node) => {
        if (node.nodeType !== 3 && node.innerHTML === '') {
            node.remove();
        }
    });
    editor.normalize();
}

buttons.forEach((btn) => {

    btn.addEventListener('click', () => {
        if (document.getSelection) {
            const selection = document.getSelection();

            if (isEmptySelection(selection)) {
                return;
            }

            const range = selection.getRangeAt(0);
            /** oldContent - #document-fragment */
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
