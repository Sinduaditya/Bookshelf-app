const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';
const searchInput = document.getElementById("searchBookTitle");
const refreshButtonDiv = document.getElementById("refreshButtonDiv");
const refreshButton = document.getElementById("refreshButton");
const incompletedBOOKList = document.getElementById('incompleteBookshelfList');
const completeBookshelfList = document.getElementById('completeBookshelfList');

searchInput.addEventListener("keyup", () => {
    const searchInputValue = searchInput.value.trim();
    if (searchInputValue === "") {
        refreshButtonDiv.style.display = "block";
        loadDataFromStorage();
    } else {
        refreshButtonDiv.style.display = "none";
        const searchResults = searchBooks(searchInputValue);
        renderSearchResults(searchResults);
    }
});

refreshButton.addEventListener("click", () => {
    location.reload();
});

function isStorageExist(){
    if(typeof (Storage) === undefined){
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function loadDataFromStorage(){
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        books.length = 0;
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener(SAVED_EVENT, function (){
    console.log(localStorage.getItem(STORAGE_KEY));
});

document.addEventListener(RENDER_EVENT, function () {
    console.log(books);

    incompletedBOOKList.innerHTML = '';
    completeBookshelfList.innerHTML = '';

    for(const bookItem of books){
        const bookElement = makeBook(bookItem)
        if (bookItem.isComplete){
            completeBookshelfList.appendChild(bookElement);
        } else  {
            incompletedBOOKList.appendChild(bookElement);
        }
    }

});

document.addEventListener('DOMContentLoaded', function () {
    if (isStorageExist()) {
        loadDataFromStorage();
    }

    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    const searchForm = document.getElementById('searchBook');
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const searchInput = document.getElementById('searchBookTitle').value;
        if (searchInput.trim() === '') {
            loadDataFromStorage();
        } else {
            const searchResults = searchBooks(searchInput);
            renderSearchResults(searchResults);
        }
    });
});



function searchBooks(keyword) {
    let searchResults = books.filter(book => {
        const titleMatch = book.title.toLowerCase().includes(keyword.toLowerCase());
        const authorMatch = book.author.toLowerCase().includes(keyword.toLowerCase());
        const yearMatch = book.year.toString().includes(keyword);
        return titleMatch || authorMatch || yearMatch;
    });
    return searchResults;
}

function renderSearchResults(results) {
    const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
    const completeBookshelfList = document.getElementById('completeBookshelfList');

    incompleteBookshelfList.innerHTML = '';
    completeBookshelfList.innerHTML = '';

    results.forEach(result => {
        const bookElement = makeBook(result);
        if (result.isComplete) {
            completeBookshelfList.appendChild(bookElement);
        } else {
            incompleteBookshelfList.appendChild(bookElement);
        }
    });
}



const bookStatusCheckbox = document.getElementById('inputBookIsComplete');
bookStatusCheckbox.addEventListener('change', function() {
    const spanElement = document.querySelector('#bookSubmit span');
    spanElement.textContent = bookStatusCheckbox.checked ? 'Sudah selesai dibaca' : 'Belum selesai dibaca';
});

function addBook() {
    const bookTitle = document.getElementById('inputBookTitle').value;
    const bookAuthor = document.getElementById('inputBookAuthor').value;
    const bookYear = document.getElementById('inputBookYear').value;
    const bookStatusCheckbox = document.getElementById('inputBookIsComplete');
    const bookStatus = bookStatusCheckbox.checked;

    const generateID = generateId();
    const bookObject = generateBookObject(generateID, bookTitle, bookAuthor, bookYear, bookStatus);

    const bookElement = makeBook(bookObject);

    if (bookStatus){
        const completedBookshelfList = document.getElementById('completeBookshelfList');
        completedBookshelfList.appendChild(bookElement);
    } else {
        const incompletedBookList = document.getElementById('incompleteBookshelfList');
        incompletedBookList.appendChild(bookElement);
    }

    books.push(bookObject);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}



function  generateId(){
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    const yearInt = parseInt(year);
    return {
        id,
        title,
        author,
        year: yearInt,
        isComplete
    }
}

function makeBook(bookObject) {
    const container = document.createElement('article');
    container.classList.add('book_item');

    const titleElement = document.createElement('h3');
    titleElement.innerText = bookObject.title;

    const authorElement = document.createElement('p');
    authorElement.innerText = `Penulis: ${bookObject.author}`;

    const yearElement = document.createElement('p');
    yearElement.innerText = `Tahun: ${bookObject.year}`;

    const actionContainer = document.createElement('div');
    actionContainer.classList.add('action');



    const markButton = document.createElement('button');
    markButton.classList.add('buttonStatus');
    markButton.innerText = bookObject.isComplete ? 'Selesai dibaca' : 'Belum selesai dibaca';

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('buttonDelete');
    deleteButton.innerText = 'Hapus buku';

    deleteButton.addEventListener('click', function (){
        const modal = document.getElementById("myModal");
        modal.style.display = "block";

        const span = document.getElementsByClassName("close")[0];

        span.onclick = function() {
            modal.style.display = "none";
        }

        const confirmButton = document.getElementById("confirmDelete");
        const cancelButton = document.getElementById("cancelDelete");

        confirmButton.onclick = function() {
            removeBook(bookObject.id);
            modal.style.display = "none";
            const header = document.querySelector('header');
            const alertDiv = document.createElement('div');
            alertDiv.classList.add('alert');
            alertDiv.innerHTML = `
        <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
        Berhasil Menghapus Data Buku ${bookObject.title}
        `;
            document.body.insertBefore(alertDiv, header.nextSibling);
        }

        cancelButton.onclick = function() {
            modal.style.display = "none";
        }
    });

    const addCompleted = document.createElement('button');
    addCompleted.classList.add('buttonCompleted');
    addCompleted.innerText = bookObject.isComplete ? 'Undo' : 'Pindah Ke Selesai';

    addCompleted.addEventListener('click', function (){
        if (bookObject.isComplete) {
            undoBookFromCompleted(bookObject.id);
        } else {
            addBookToCompleted(bookObject.id);
        }
    });


    actionContainer.appendChild(addCompleted);
    actionContainer.appendChild(markButton);
    actionContainer.appendChild(deleteButton);

    container.appendChild(titleElement);
    container.appendChild(authorElement);
    container.appendChild(yearElement);
    container.appendChild(actionContainer);

    return container;
}

function  findBookIndex(bookId){
    for (const index in books){
        if (books[index].id === bookId){
            return index;
        }
    }

    return -1;
}

function  removeBook(bookId){
    const bookTarget = findBookIndex(bookId);

    if(bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function saveData(){
    if (isStorageExist()){
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        console.log('Data disimpan ke localStorage:', parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function addBookToCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books[bookTarget].isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoBookFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books[bookTarget].isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}


incompletedBOOKList.addEventListener('click', function(e) {
    if (e.target.classList.contains('buttonStatus')) {
        const bookId = e.target.parentElement.parentElement.dataset.id;
        addBookToCompleted(bookId);
    }
});


completeBookshelfList.addEventListener('click', function(e) {
    if (e.target.classList.contains('buttonStatus')) {
        const bookId = e.target.parentElement.parentElement.dataset.id;
        undoBookFromCompleted(bookId);
    }
});