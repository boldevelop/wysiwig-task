const buttons = document.querySelector('.toolkit').querySelectorAll('button');

const isEmptySelection = (selection) => !Boolean(selection.toString());
const setClass = (btnClass) => {
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

buttons.forEach((btn) => {

    btn.addEventListener('click', (e) => {
        if (document.getSelection) {
            const selection = document.getSelection();

            if (isEmptySelection(selection)) {
                return;
            }

            const range = selection.getRangeAt(0);
            const oldContent = document.createTextNode(range.toString());
            const newElement = document.createElement('span');
            newElement.classList.add(setClass(btn.className));
            newElement.appendChild(oldContent);
            range.deleteContents();
            range.insertNode(newElement);
        }
    })
})