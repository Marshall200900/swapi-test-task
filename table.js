class TableController {
    currentPage = 'planets';
    currentData = null;

    constructor(tableView, tableModel) {
        this.tableView = tableView;
        this.tableModel = tableModel;
    }
    addTable = async (data) => {
        if (this.currentData !== null) {
            this.clearTable();
        }

        const titles = this.getTitles();
        this.tableView.renderHeader(titles);

        this.currentData = data;
        localStorage.setItem('currentData', JSON.stringify(this.currentData));
        this.currentData = [...this.currentData, ...this.currentData];
        this.tableView.renderBody(this.currentData);
        
        this.tableView.setLoading('loaded');
    }
    sortBy = (id) => {
        this.tableView.clearTableBody();
        this.currentData = this.currentData.sort((a, b) => {
            if(parseInt(a[id]) && parseInt(b[id])) {
                return parseInt(a[id]) - parseInt(b[id]);
            }
            else {
                if(a[id] < b[id]) { return -1; }
                if(a[id] > b[id]) { return 1; }
                return 0;
            }
        });
        
        this.tableView.renderBody(this.currentData);
    }
    clearTable = () => {
        this.tableView.setLoading('notloaded');
        this.tableView.clearTableView();
        localStorage.setItem('currentData', '');
    }
    getTitles = () => {
        switch(this.currentPage) {
            case 'people': return this.tableModel.peopleTitles;
            case 'planets': return this.tableModel.planetsTitles;
            case 'starships': return this.tableModel.starshipsTitles;
            default: return this.tableModel.peopleTitles;
        }
    }
    getAttrs = () => {
        switch(this.currentPage) {
            case 'people': return this.tableModel.peopleAttrs;
            case 'planets': return this.tableModel.planetsAttrs;
            case 'starships': return this.tableModel.starshipsAttrs;
            default: return this.tableModel.peopleAttrs;
        }
    }
    getData = async () => {
        switch(this.currentPage) {
            case 'people': return this.getPeopleData();
            case 'planets': return this.getPlanetsData();
            case 'starships': return this.getStarshipsData();
            default: return this.getPeopleData();
        }
    }
    getPeopleData = async () => {
        const attrs = this.getAttrs();
        const data = await this.tableModel.getPeople();
        const preparedData = data.map((el) => {
            const newEl = [];
            attrs.forEach((attr) => {
                newEl.push(el[attr]);
            });
            return newEl;
        });
        for(let el of preparedData) {
            el[4] = (await this.tableModel.getPlanet(el[4])).name;
        }
        return preparedData;
    }
    getPlanetsData = async () => {
        const attrs = this.getAttrs();
        const data = await this.tableModel.getPlanets();
        const preparedData = data.map((el) => {
            const newEl = [];
            attrs.forEach((attr) => {
                newEl.push(el[attr]);
            });
            return newEl;
        });
        return preparedData;
    }
    getStarshipsData = async () => {
        const attrs = this.getAttrs();
        const data = await this.tableModel.getStarships();
        const preparedData = data.map((el) => {
            const newEl = [];
            attrs.forEach((attr) => {
                newEl.push(el[attr]);
            });
            return newEl;
        });
        return preparedData;

    }
    switchPage = (e) => {
        this.tableView.clearTable();
        this.tableView.setLoading('notloaded');

        if (e.target.innerText !== this.currentPage) {
            localStorage.setItem('currentData', '');
            this.currentPage = e.target.innerText;
            localStorage.setItem('currentPage', this.currentPage);
            this.tableView.renderTitle(this.currentPage);
        }
        
        
    }
    setPage = (page) => {
        if (page !== this.currentPage) {
            this.currentPage = page;
            localStorage.setItem('currentPage', this.currentPage);
            this.tableView.renderTitle(this.currentPage);
        }
    }
    init = async () => {
        this.tableView.switchPage = this.switchPage;

        this.tableView.addTable = () => {
            this.tableView.setLoading('loading');
            this.getData().then((val) => this.addTable(val))
        };
        this.tableView.clearTable = this.clearTable;
        this.tableView.sortBy = this.sortBy;
        this.tableView.addListeners();

        if (localStorage.getItem('currentPage')) {
            this.setPage(localStorage.getItem('currentPage'));
        }
        if (localStorage.getItem('currentData')) {
            const res = JSON.parse(localStorage.getItem('currentData'));
            this.addTable(res);
        }

    }
}
class TableView {
    constructor() {
        this.table = document.getElementById('sw-data');
        this.noData = document.getElementById('no-data');
    }
    draggableNode = null;
    prevNode = null;
    mouseDownHandler = (e) => {
        
        this.prevNode = e.target.parentNode;
        
        this.draggableNode = e.target.parentNode.cloneNode(true);




        this.draggableNode.style.position = 'absolute';
        this.draggableNode.onmousedown = this.mouseDownHandler;
        const body = document.getElementsByTagName('body')[0];
        body.appendChild(this.draggableNode);
        
        document.addEventListener('mousemove', this.mouseMoveHandler);
        document.addEventListener('mouseup', this.mouseUpHandler);
    }
    mouseMoveHandler = (e) => {        
        this.draggableNode.style.position = 'absolute';
        this.draggableNode.style.left = `${e.clientX + window.pageXOffset}px`;
        this.draggableNode.style.top = `${e.clientY + window.pageYOffset}px`;        
    }
    mouseUpHandler = (e) => {
        const body = document.getElementsByTagName('body')[0];
        body.removeChild(this.draggableNode);
        const elements = document.elementsFromPoint(e.clientX, e.clientY);

        console.log(elements[0].parentNode.tagName);
        if(elements[0].parentNode.tagName === 'TR') {
            const row = elements[0].parentNode;
            this.draggableNode.style.position = 'unset';
            this.draggableNode.style.width = 'auto';
            row.parentNode.insertBefore(this.draggableNode, row.nextSibling);
            this.prevNode.parentNode.removeChild(this.prevNode);
        }


        document.removeEventListener('mousemove', this.mouseMoveHandler);
        document.removeEventListener('mouseup', this.mouseUpHandler);
    }
    clearTableView = () => {
        this.table.innerHTML = '';
    }

    clearTableBody = () => {
        const tbody = document.getElementsByTagName('tbody')[0];
        tbody.parentNode.removeChild(tbody);
    }
    addListeners = () => {
        const btnGetData = document.getElementById('get-data');
        btnGetData.onclick = this.addTable;

        const btnClearData = document.getElementById('clear-data');
        btnClearData.onclick = this.clearTable;

        const btnSetPlanets = document.getElementById('btn-set-planets');
        const btnSetPeople = document.getElementById('btn-set-people');
        const btnSetStarships = document.getElementById('btn-set-starships');

        btnSetPlanets.onclick = this.switchPage;
        btnSetPeople.onclick = this.switchPage;
        btnSetStarships.onclick = this.switchPage;

    }
    renderTitle = (title) => {
        const tableName = document.getElementById('table-name');
        tableName.innerHTML = title + ' table';
    }
    setLoading = (loadingStatus) => {
        const noData = document.getElementById('no-data');
        const loader = document.getElementById('loader');

        switch(loadingStatus) {
            case 'notloaded': {
                noData.setAttribute('class', '');
                loader.setAttribute('class', 'hide');
                break;
            }
            case 'loading': {
                noData.setAttribute('class', 'hide');
                loader.setAttribute('class', '');
                break;
            }
            case 'loaded': {
                noData.setAttribute('class', 'hide');
                loader.setAttribute('class', 'hide');
                break;
            }
        }
    }
    renderHeader = (titles) => {
        const header = document.createElement('thead');
        this.table.appendChild(header);
        const row = header.insertRow(-1);
        titles.forEach((el, id) => {
            const th = document.createElement('th');
            th.innerText = el + '▼';
            th.onclick = () => this.sortBy(id);
            row.appendChild(th);
        });
    }
    renderBody = (data) => {
        const tbody = document.createElement('tbody');
        this.table.appendChild(tbody);
    
        data.forEach((el) => {
            const body = this.table.getElementsByTagName('tbody')[0];
            const row = body.insertRow(-1);
            for(let c of el) {
                const cell = row.insertCell(-1);
                cell.onmousedown = this.mouseDownHandler;
                cell.innerHTML = c;
            };
        });
    }

}
class TableModel {

    planetsAttrs = ['name', 'rotation_period', 'orbital_period', 'diameter', 'climate'];
    peopleAttrs = ['name', 'height', 'birth_year', 'gender', 'homeworld'];
    starshipsAttrs = ['name', 'model', 'manufacturer', 'cost_in_credits', 'length'];

    planetsTitles = ['Name', 'Rotation period', 'Orbital peroid', 'Diameter', 'Climate'];
    peopleTitles = ['Name', 'Height', 'Birth year', 'Gender', 'Planet'];
    starshipsTitles = ['Name', 'Model', 'Manufacturer', 'Cost in credits', 'Length'];

    getPeople = async () => {
        const response = await fetch('https://swapi.dev/api/people');
        const { results } = await response.json();
        return results;
    }
    getPlanets = async () => {
        const response = await fetch('https://swapi.dev/api/planets');
        const { results } = await response.json();
        return results;
    }
    getStarships = async () => {
        const response = await fetch('https://swapi.dev/api/starships');
        const { results } = await response.json();
        return results;
    }
    getPlanet = async (url) => {
        const response = await fetch(url);
        return await response.json();
    }
}

const tableController = new TableController(new TableView(), new TableModel());
tableController.init();