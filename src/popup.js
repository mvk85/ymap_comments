export default class Popup {

    constructor (node) {
        this.node = node;
        this.popup = this.initPopup(this.node);
        this.titlePopup = this.popup.querySelector('.w_title-name');
        this.contCommentPopup = this.popup.querySelector('.w_body-list ul');
        this.btnAddComment = this.popup.querySelector('#w_form-send');
        this.btnClosePopup = this.popup.querySelector('.w_close');
        this.form = this.popup.querySelector('.w_form');
    }

    initPopup (node) {
        let popup = document.querySelector(node);

        if (!popup) {
            throw new Error('not found popup window!');
        }
        
        this.clearPopup(popup);
        popup.classList.add('w_popup__win');
        popup.innerHTML = require('./popup.hbs')();
        this.popupDragDrop(popup);

        return popup;
    }

    popupDragDrop (popup) {
        let titleWindow = popup.querySelector('.w_title');

        titleWindow.addEventListener('mousedown', this.startDragDrop);
    }

    startDragDrop (event) {
        let target = event.target;
        let body = document.body;     
        let window = target.closest('.w_popup__win');
        let windowBound = window.getBoundingClientRect();
        let clickMouse = { X: event.pageX, Y: event.pageY };
        let shiftCoord = {
            X: clickMouse.X - windowBound.left,
            Y: clickMouse.Y - windowBound.top
        };

        if (target.classList.contains('w_close')) {
            return;
        }

        body.addEventListener('mousemove', dragFriend);
        body.addEventListener('mouseup', dropFriend);

        function dragFriend(event) {
            window.style.left = (event.pageX - shiftCoord.X) + 'px';
            window.style.top = (event.pageY - shiftCoord.Y) + 'px';
        }

        function dropFriend() {
            body.removeEventListener('mousemove', dragFriend);
            body.removeEventListener('mouseup', dropFriend);
        }
    }

    clearPopup (popup) {
        if (popup.innerHTML) {
            popup.innerHTML = "";
        }
    }

    getBtnAdd () {
        return this.btnAddComment;
    }
    
    getBtnClose () {
        return this.btnClosePopup;
    }

    setCoords (coords) {
        let popupBound = this.popup.getBoundingClientRect();
        let widthPopup = popupBound.width;
        let widthWindow = document.documentElement.clientWidth;
        let X = coords[0];
        let Y = coords[1];

        if (X + widthPopup + 50 > widthWindow) {
            X = X - widthPopup - 10;
        }
        this.popup.style.left = X + 10 + 'px';
        this.popup.style.top = Y + 10 + 'px';
    }

    getValueForm () {
        let form = this.getInputForm();
        let name = form.name;
        let place = form.place;
        let comment = form.comment;

        if (this.isEmptyInput(name)
            || this.isEmptyInput(place)
            || this.isEmptyInput(comment)) {
            return false;
        }

        return {
            name: name.value,
            place: place.value,
            comment: comment.value
        }
    }

    isEmptyInput (node) {
        let result = this.isEmpty(node.value);

        if (result) {
            node.classList.add('is__empty');
        } else {
            node.classList.remove('is__empty');
        }
        return result;
    }

    isEmpty (value) {
        return value ? false : true;
    }

    getInputForm () {
        let form = this.form;
        let inputName = form.querySelector('.w_form-name');
        let inputPlace = form.querySelector('.w_form-place');
        let areaComment = form.querySelector('.w_form-com');

        return {
            name: inputName,
            place: inputPlace,
            comment: areaComment
        }
    }

    clearFieldForm () {
        let form = this.getInputForm();
        
        form.name.value = '';
        form.place.value = '';
        form.comment.value = '';
    }

    getFieldId () {
        let inputId = this.form.querySelector('.w_form-id');

        if (!inputId) {
            inputId = document.createElement('input');
            inputId.setAttribute('type', 'hidden');
            inputId.classList.add('w_form-id');
            this.form.insertBefore(inputId, this.form.querySelector('input'));

            return inputId
        }

        return inputId;
    }
    
    setListComments (arComments) {
        let result = '';
        let container = this.contCommentPopup;
        arComments.forEach(comment => {
            result += this.prepareComment(comment);
        })

        container.innerHTML = result;
    }

    prepareComment (comment) {
        let templateComment = require('./comment.hbs');

        return templateComment({comment: comment})
    }

    addCommentList (comment) {
        let container = this.contCommentPopup;
        let commentText = this.prepareComment(comment);
        let ul = document.createElement('ul');
        let li;
        let lis = container.querySelectorAll('li');

        if (lis.length == 1) {
            let bDel = lis[0].dataset.delete;

            if (bDel) {
                container.innerHTML = '';
            }
        }

        ul.innerHTML = commentText;
        li = ul.querySelector('li');
        container.appendChild(li);
    }

    setTitle (name) {
        this.titlePopup.innerText = name;
    }
    
    open () {
        this.popup.style.display = 'block';        
    }

    close () {
        this.popup.style.display = '';
    }
}