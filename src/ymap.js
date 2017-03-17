import Popup from './popup.js'

function initMap() {
    let map = getMap();
    let cluster = getClasterer();
    let options = { map: map, cluster: cluster}

    cluster.events.add('click', startClusterEvent);
    map.geoObjects.add(cluster);
    setMapEvent(options);

    function startClusterEvent(e) {
        let target = e.get('target');
        let coordsClick = e.get('pagePixels');
        let type = target.geometry.getType();
        let arGeoObjects = target.properties.get('geoObjects');
        let data = [];
        let mapContainer = document.querySelector(`#${getMapContainer()}`);

        if (arGeoObjects) { //cluster
            data = parseGeoObjects(arGeoObjects);
            mapContainer.addEventListener('click', clickMap, false);
        } else if (type == 'Point') {
            data = parseGeoObjects([target]);
            e.preventDefault();

            let paramsComment = getParamsComment(data);
            let popup = new Popup('#w_popup');
            let coordsPage = coordsClick;
            let opt = {
                coords: paramsComment.coords,
                cluster: cluster,
                popup: popup,
                address: paramsComment.address
            };

            let options = {
                opt: opt,
                coordsPage: coordsPage,
                data: data
            }

            openPopupComments(options);
        }

        function clickMap (event) {
            if (event.target.classList.contains('link___placemark')) {
                let target = event.target;
                let idComment = getIdPlacemark(target);
                let arPlacemark = getArrPlacemarks(data, idComment);
                let paramsComment = getParamsComment(arPlacemark);
                let popup = new Popup('#w_popup');
                let coordsPage = coordsClick;
                let opt = {
                    coords: paramsComment.coords,
                    cluster: cluster,
                    popup: popup,
                    address: paramsComment.address
                };
                let options = {
                    opt: opt,
                    coordsPage: coordsPage,
                    data: arPlacemark
                }

                openPopupComments(options);
                cluster.balloon.close();

                event.preventDefault();
                this.removeEventListener('click', clickMap, false);
            }
        };
    }
}

function openPopupComments(options) {
    let popup = options.opt.popup;
    let funcAdd = addPlacemark.bind(null, options.opt);
    let funcClear = clearEventBtn.bind(null, popup);

    popup.setCoords(options.coordsPage);
    popup.setTitle(options.opt.address);
    popup.setListComments(options.data);
    popup.open();
    popup.getBtnAdd().addEventListener('click', funcAdd);
    popup.getBtnClose().addEventListener('click', funcClear);
}

function getParamsComment(arPlacemark) {
    let placemark = arPlacemark[0];

    return {
        id: placemark.id,
        name: placemark.name,
        place: placemark.place,
        date: placemark.date,
        coords: placemark.coords,
        address: placemark.address
    }
}

function getArrPlacemarks(data, id) {
    let result = [];

    for (let i = 0; i < data.length; i++) {
        if (data[i].id == id) {
            result.push(data[i]);
        }
    }

    return result;
}

function parseGeoObjects(objects) {
    let obj, objCoords, id, name, place, date, placemark, address, comment, data = [];

    for (let i = 0; i < objects.length; i++) {
        obj = objects[i];
        objCoords = obj.geometry.getCoordinates();
        id = obj.properties.get('id');
        name = obj.properties.get('name');
        place = obj.properties.get('place');
        date = obj.properties.get('date');
        address = obj.properties.get('address');
        comment = obj.properties.get('comment');
        placemark = {
            id: id,
            name: name,
            place: place,
            date: date,
            coords: objCoords,
            address: address,
            comment: comment
        }

        data.push(placemark);
    }

    return data;
}

function setMapEvent(options) {
    let map = options.map;
    let func = serveEventClickMap.bind(this, options);

    map.events.add('click', func);
}

function serveEventClickMap(options, e) {
    let cluster = options.cluster;
    let popup = new Popup('#w_popup');
    let coords = e.get('coords');
    let coordsPage = e.get('pagePixels');

    popup.setCoords(coordsPage);

    getAddress(coords).then(res => {
        let opt = {
            coords: res.coords,
            cluster: cluster,
            popup: popup,
            address: res.address
        };
        let funcAdd = addPlacemark.bind(null, opt);
        let funcClear = clearEventBtn.bind(null, popup);

        popup.setTitle(res.address);
        popup.open();
        popup.getBtnAdd().addEventListener('click', funcAdd);
        popup.getBtnClose().addEventListener('click', funcClear);
    })
}

function addPlacemark(opt) {
    let placemark;
    let valueForm;
    let dataPlacemark;
    let data;

    valueForm = opt.popup.getValueForm();

    if (!valueForm) {
        return;
    }

    valueForm.address = opt.address;
    valueForm.popup = opt.popup;

    dataPlacemark = prepareDataPlacemark(valueForm);
    placemark = getPlacemark({
        coords: opt.coords,
        data: dataPlacemark,
        option: getOptionsPlacemark()
    });
    opt.cluster.add(placemark);
    opt.popup.clearFieldForm();

    data = parseGeoObjects([placemark]);
    opt.popup.addCommentList(data[0]);
}

function clearEventBtn(popup, event) {
    event.preventDefault();
    popup.getBtnAdd().removeEventListener('click', addPlacemark);
    popup.getBtnClose().removeEventListener('click', addPlacemark);
    popup.close();
}

function getAddress(coords) {
    return ymaps.geocode(coords).then(function (res) {
        let address = getNameGObj(res);

        return new Promise((resolve) => {
            resolve({
                address: address,
                coords: coords
            });
        });
    });
}

function getOptionsPlacemark() {
    return {
        preset: 'islands#violetIcon'
    }
}

function prepareDataPlacemark(valueForm) {
    let id = getIdComment(valueForm);
    let link = getLinkPlacemark(id, valueForm.address);
    let content = `${link}<br>${valueForm.comment}<br>`;

    return {
        balloonContentBody: content,
        clusterCaption: valueForm.place,
        place: valueForm.place,
        date: getDate(),
        id: id,
        name: valueForm.name,
        address: valueForm.address,
        comment: valueForm.comment
    }
}

function getLinkPlacemark(id, address) {
    return `<a href='#' id = "id_${id}" class="link___placemark">${address}</a>`
}

function getDate() {
    let date = new Date();
    let year = date.getFullYear();
    let mon = fmtDateNum(date.getMonth());
    let dateM = fmtDateNum(date.getDate());
    let hours = fmtDateNum(date.getHours());
    let min = fmtDateNum(date.getMinutes());
    let sec = fmtDateNum(date.getSeconds());
    let dt = `${year}.${mon}.${dateM}`;
    let tm = `${hours}:${min}:${sec}`;

    return `${dt} ${tm}`;
}

function fmtDateNum(num) {
    return num < 10 ? '0' + num : num;
}

function getIdComment(opt) {
    let inputId = opt.popup.getFieldId();
    let id = + inputId.value;

    if (!id) {
        id = getNewId();
        inputId.value = id;

        return getNewId();
    }

    return id;
}

function getNewId() {
    return (+ new Date());
}

function getPlacemark(options) {
    return new ymaps.Placemark(
        [options.coords[0], options.coords[1]],
        options.data,
        options.option);
}

function getMap() {
    let mapId = getMapContainer();

    return new ymaps.Map(mapId, {
        center: [55.76, 37.64],
        zoom: 12
    });
}

function getMapContainer() {
    return 'map';
}

function getClasterer() {
    return new ymaps.Clusterer({
        preset: 'islands#invertedVioletClusterIcons',
        groupByCoordinates: false,
        clusterDisableClickZoom: true,
        clusterBalloonContentLayout: 'cluster#balloonCarousel',
        clusterBalloonPanelMaxMapArea: 0,
        clusterBalloonPagerSize: 5
    });
}

function getNameGObj(objGeo) {
    let nameRaw = objGeo.geoObjects.get(0).properties.get('text');

    nameRaw = nameRaw.split(',');
    if (nameRaw.length > 3) {
        nameRaw.pop();
    }

    return nameRaw.join(',');
}

function getIdPlacemark(link) {
    let idRaw = link.getAttribute('id');
    let id = idRaw.slice(idRaw.indexOf('_') + 1);

    if (!id) {
        throw new Error('id placemark not found');
    }

    return id;
}

export {
    initMap
}