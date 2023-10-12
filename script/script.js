const books = [];
const unreadBooks = [];
const readBooks = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_DATA = "BOOK_APPS";

document.addEventListener("DOMContentLoaded", function () {
  const submitButton = document.getElementById("inputBook");
  submitButton.addEventListener("submit", function (e) {
    e.preventDefault();
    addBook();
  });
  const searchButton = document.getElementById("searchSubmit");
  searchButton.addEventListener("click", searchBook);

  const checkBox = document.getElementById("inputBookIsComplete");
  const spanText = document.getElementById("buku-dibaca");

  checkBox.addEventListener("change", function () {
    spanText.innerText = checkBox.checked
      ? "Complete Bookshelf"
      : "Incomplete Bookshelf";
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});
document.addEventListener(RENDER_EVENT, function () {
  console.log(books);
  const unreadBOOKList = document.getElementById("incompleteBookshelfList");
  unreadBOOKList.innerHTML = "";

  const readBOOKList = document.getElementById("completeBookshelfList");
  readBOOKList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isComplete) {
      unreadBOOKList.append(bookElement);
    } else readBOOKList.append(bookElement);
  }
});
document.addEventListener(SAVED_EVENT, function () {
  const storedData = localStorage.getItem(STORAGE_DATA);
});

const addBook = () => {
  const bookTitle = document.getElementById("inputBookTitle").value;
  const bookAuthor = document.getElementById("inputBookAuthor").value;
  const bookYear = document.getElementById("inputBookYear").value;

  if (isDuplicateBook(bookTitle, bookAuthor, bookYear)) {
    alert("Book Already Exist, Please Check Bookshelf!");
    return;
  }

  const imageUrl = document.getElementById("inputBookImage").value;
  const isComplete = document.getElementById("inputBookIsComplete").checked;
  const generateID = generateId();
  const bookObject = generateBookObject(
    generateID,
    bookTitle,
    bookAuthor,
    bookYear,
    imageUrl,
    isComplete
  );

  if (isComplete) {
    readBooks.push(bookObject);
  } else {
    unreadBooks.push(bookObject);
  }

  books.push(bookObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  renderBook();
  saveData();
  document.getElementById("inputBook").reset();
  alert("Book Added Successfully!");
};
const isDuplicateBook = (title, author, year, idToExclude) => {
  return books.some((book) => {
    return (
      book.id !== idToExclude &&
      book.title.toLowerCase() === title.toLowerCase() &&
      book.author.toLowerCase() === author.toLowerCase() &&
      book.year.toString() === year.toString()
    );
  });
};
const makeBook = (bookObject) => {
  const bookTitle = document.createElement("h3");
  bookTitle.innerText = bookObject.title;

  const bookAuthor = document.createElement("p");
  bookAuthor.innerText = bookObject.author;

  const bookYear = document.createElement("p");
  bookYear.innerText = bookObject.year;

  const bookImage = document.createElement("img");
  bookImage.src = bookObject.imageUrl;

  const newBookContainer = document.createElement("div");
  newBookContainer.classList.add("book_item");
  newBookContainer.append(bookTitle, bookAuthor, bookYear, bookImage);

  const actionContainer = document.createElement("div");
  actionContainer.classList.add("action");

  const button = document.createElement("button");
  const trashButton = document.createElement("button");
  const editButton = document.createElement("button");

  if (bookObject.isComplete) {
    button.classList.add("yellow");
    button.innerText = "Incomplete";
    button.addEventListener("click", () => {
      undoBookFromRead(bookObject.id);
    });

    trashButton.classList.add("red");
    trashButton.innerText = "Delete";
    trashButton.addEventListener("click", () => {
      const confirmDelete = window.confirm("Are You Sure?");
      if (confirmDelete) {
        removeBookFromRead(bookObject.id);
      }
    });

    editButton.classList.add("blue");
    editButton.innerText = "Edit";
    editButton.addEventListener("click", function () {
      editBook(bookObject.id);
    });
  } else {
    button.classList.add("green");
    button.innerText = "Complete";
    button.addEventListener("click", () => {
      addBookToRead(bookObject.id);
    });

    trashButton.classList.add("red");
    trashButton.innerText = "Delete";
    trashButton.addEventListener("click", () => {
      const confirmDelete = window.confirm("Are You Sure?");
      if (confirmDelete) {
        removeBookFromRead(bookObject.id);
      }
    });
    editButton.classList.add("blue");
    editButton.innerText = "Edit";
    editButton.addEventListener("click", function () {
      editBook(bookObject.id);
    });
  }

  actionContainer.append(button, trashButton, editButton);
  newBookContainer.append(actionContainer);

  saveData();
  return newBookContainer;
};

const editBook = (id) => {
  const bookToEdit = findBook(id);

  if (bookToEdit == null) return;

  const editedTitle = prompt("Enter edited title:", bookToEdit.title);
  const editedAuthor = prompt("Enter edited author:", bookToEdit.author);
  const editedYear = prompt("Enter edited year:", bookToEdit.year);
  const editedImageUrl = prompt("Enter edited image url", bookToEdit.imageUrl);

  if (isDuplicateBook(editedTitle, editedAuthor, editedYear, id)) {
    alert("Book Already Exist, Please Check Bookshelf!");
    return;
  }
  bookToEdit.title = editedTitle || bookToEdit.title;
  bookToEdit.author = editedAuthor || bookToEdit.author;
  bookToEdit.year = editedYear || bookToEdit.year;
  bookToEdit.imageUrl = editedImageUrl || bookToEdit.imageUrl;

  saveData();
  renderBook();
  alert("Book Edited Successfully!");
};

const findBook = (id) => {
  for (const bookItem of books) {
    if (bookItem.id === id) {
      return bookItem;
    }
  }
  return null;
};
const findBookIndex = (id) => {
  for (const index in books) {
    if (books[index].id === id) {
      return index;
    }
  }
  return -1;
};
const searchBook = (e) => {
  if (e) {
    e.preventDefault();
  }
  const searchInput = document
    .getElementById("searchBookTitle")
    .value.toLowerCase();

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchInput) ||
      book.author.toLowerCase().includes(searchInput) ||
      book.year.toString().includes(searchInput)
  );

  const unreadBookList = document.getElementById("incompleteBookshelfList");
  const readBookList = document.getElementById("completeBookshelfList");
  unreadBookList.innerHTML = "";
  readBookList.innerHTML = "";

  for (const bookItem of filteredBooks) {
    const bookElement = makeBook(bookItem);
    if (bookItem.isComplete) {
      readBookList.appendChild(bookElement);
    } else {
      unreadBookList.appendChild(bookElement);
    }
  }
};
const addBookToRead = (id) => {
  const bookTarget = findBook(id);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};
const undoBookFromRead = (id) => {
  const bookTarget = findBook(id);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};
const removeBookFromRead = (id) => {
  const bookTarget = findBookIndex(id);

  if (bookTarget === -1) return;
  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};
const isStorageExist = () => {
  if (typeof Storage === undefined) {
    alert("Your Browser Not Compatible Local Storage!");
    return false;
  }
  return true;
};
const saveData = () => {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_DATA, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
};
const generateId = () => {
  return +new Date();
};
const generateBookObject = (id, title, author, year, imageUrl, isComplete) => {
  return {
    id: id,
    title: title,
    author: author,
    year: year,
    imageUrl: imageUrl,
    isComplete: isComplete,
  };
};
const renderBook = () => {
  const unreadBook = document.getElementById("incompleteBookshelfList");
  const readBook = document.getElementById("completeBookshelfList");

  readBook.innerHTML = "";
  unreadBook.innerHTML = "";
  const checkBox = document.getElementById("inputBookIsComplete");

  const displayBooks = checkBox.checked ? readBooks : unreadBooks;

  for (const bookItem of displayBooks) {
    const bookElement = document.getElementById(`book-${bookItem.id}`);

    if (
      bookElement &&
      window.getComputedStyle(bookElement).display !== "none"
    ) {
      if (bookItem.isComplete) {
        readBook.append(bookElement);
      } else {
        unreadBook.append(bookElement);
      }
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};
const loadDataFromStorage = () => {
  const serializedData = localStorage.getItem(STORAGE_DATA);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
};
