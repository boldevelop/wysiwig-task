const buttons = document.querySelector('.toolkit').querySelectorAll('button');

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
}
const insertNode = (range, element) => {
    range.deleteContents();
    range.insertNode(element);
}

buttons.forEach((btn) => {

    btn.addEventListener('click', () => {
        if (document.getSelection) {
            const selection = document.getSelection();
            if (isEmptySelection(selection)) {
                return;
            }

            const range = selection.getRangeAt(0);
            const oldContent = range.extractContents();
            const firstChild = oldContent.firstElementChild;
            const customizingClass = getClass(btn.className);

            if (firstChild && firstChild.className === customizingClass) {
                /** not reliable unset styling */
                const elementWithoutStyling = firstChild.innerHTML;
                const template = document.createElement('template');
                template.innerHTML = elementWithoutStyling;
                insertNode(range, template.content.firstChild);
            } else {
                const newElement = document.createElement('span');
                newElement.classList.add(customizingClass);
                newElement.appendChild(oldContent);
                insertNode(range, newElement);
            }
        }
    })
})