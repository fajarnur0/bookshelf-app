const books = [];
const RENDER_EVENT = "render-book";
const STORAGE_KEY = "DATA_BOOKSHELF";
const SAVED_EVENT = "saved-book";

document.addEventListener("DOMContentLoaded", function () {
  const isCompleteCheckbox = document.getElementById("bookFormIsComplete");
  isCompleteCheckbox.addEventListener("change", function () {
    const buttonShelfChanger = document.querySelector("#bookFormSubmit span");
    if (isCompleteCheckbox.checked) {
      buttonShelfChanger.innerText = "Selesai dibaca";
    } else {
      buttonShelfChanger.innerText = "Belum selesai dibaca";
    }
  });

  const submitBook = document.getElementById("bookForm");
  submitBook.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  function addBook() {
    const title = document.getElementById("bookFormTitle").value;
    const author = document.getElementById("bookFormAuthor").value;
    const year = document.getElementById("bookFormYear").value;
    const isComplete = isCompleteCheckbox.checked;

    const id = generateBookId();
    const bookObject = generateBookObject(id, title, author, year, isComplete);
    bookObject.year = Number(bookObject.year);
    books.push(bookObject);
    console.log(books);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function generateBookId() {
    const id = new Date().getTime();
    return id;
  }

  function generateBookObject(id, title, author, year, isComplete) {
    return {
      id,
      title,
      author,
      year,
      isComplete,
    };
  }

  document.addEventListener(RENDER_EVENT, function () {
    const incompleteBookList = document.getElementById("incompleteBookList");
    incompleteBookList.innerHTML = "";

    const completeBookList = document.getElementById("completeBookList");
    completeBookList.innerHTML = "";

    books.forEach((book) => {
      const bookElement = makeBook(book);
      if (!book.isComplete) {
        incompleteBookList.appendChild(bookElement);
      } else {
        completeBookList.appendChild(bookElement);
      }
    });
  });

  function makeBook(book) {
    // DATA BOOK
    const bookTitle = document.createElement("h3");
    bookTitle.dataset.testid = "bookItemTitle";
    bookTitle.innerHTML = book.title;

    const bookAuthor = document.createElement("p");
    bookAuthor.innerHTML = `<span style="font-weight: 600;">Penulis: </span> ${book.author}`;
    bookAuthor.dataset.testid = "bookItemAuthor";

    const bookYear = document.createElement("p");
    bookYear.dataset.testid = "bookItemYear";
    bookYear.innerHTML = `<span style="font-weight: 600;">Tahun: </span> ${book.year}`;

    const containerBookItem = document.createElement("div");
    containerBookItem.dataset.bookid = book.id;
    containerBookItem.dataset.testid = "bookItem";

    // BUTTON
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("buttonContainer");
    if (book.isComplete) {
      const buttonUndo = document.createElement("button");
      buttonUndo.dataset.testid = "bookItemIsCompleteButton";
      buttonUndo.classList.add("undoButton");
      buttonUndo.innerText = "Belum selesai dibaca";
      buttonContainer.append(buttonUndo);

      buttonUndo.addEventListener("click", function () {
        UndoBookFromCompleted(book.id);
      });
    } else {
      const buttonIsComplete = document.createElement("button");
      buttonIsComplete.dataset.testid = "bookItemIsCompleteButton";
      buttonIsComplete.classList.add("isCompleteButton");
      buttonIsComplete.innerText = "Selesai dibaca";
      buttonContainer.append(buttonIsComplete);

      buttonIsComplete.addEventListener("click", function () {
        addBookToCompleted(book.id);
      });
    }

    const buttonDelete = document.createElement("button");
    buttonDelete.dataset.testid = "bookItemDeleteButton";
    buttonDelete.classList.add("deleteButton");
    buttonDelete.innerText = "Hapus Buku";
    buttonDelete.addEventListener("click", function () {
      const deleteConfirm = window.confirm(
        "Apakah Anda yakin ingin menghapus buku ini?"
      );
      if (deleteConfirm) {
        deleteBook(book.id);
      }
    });

    const buttonEdit = document.createElement("button");
    buttonEdit.dataset.testid = "bookItemEditButton";
    buttonEdit.classList.add("editButton");
    buttonEdit.innerText = "Edit Buku";
    buttonEdit.addEventListener("click", function () {
      editBook(book.id);
    });

    const divider = document.createElement("div");
    divider.classList.add("divider");
    buttonContainer.append(buttonDelete, buttonEdit);
    containerBookItem.append(
      bookTitle,
      bookAuthor,
      bookYear,
      divider,
      buttonContainer
    );

    return containerBookItem;
  }

  function addBookToCompleted(id) {
    const bookTarget = findBook(id);
    if (bookTarget === null) return;
    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function findBook(id) {
    for (const book of books) {
      if (book.id === id) {
        return book;
      }
    }
  }

  function UndoBookFromCompleted(id) {
    const bookTarget = findBook(id);
    if (bookTarget == null) return;
    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function findBookIndex(id) {
    for (const index in books) {
      if (books[index].id === id) {
        return index;
      }
    }
    return -1;
  }

  function deleteBook(id) {
    const bookTarget = findBookIndex(id);
    if (bookTarget === -1) return;
    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function editBook(id) {
    const saveEditButton = document.getElementById("saveEditButton");
    const editBookTitle = document.getElementById("editBookTitle");
    const editBookAuthor = document.getElementById("editBookAuthor");
    const editBookYear = document.getElementById("editBookYear");

    const editBookModal = document.getElementById("editSection");
    editBookModal.style.display = "block";

    editBookModal.addEventListener("click", function (event) {
      event.stopPropagation();
      if (event.target.id === "editSection") {
        editBookModal.style.display = "none";
        const saveMessage = document.getElementById("saveMessage");
        if (saveMessage) {
          saveMessage.remove();
        }
      }
    });

    const tempBook = getDataBook(id);
    const { tempBookTitle, tempBookAuthor, tempBookYear } = tempBook;

    editBookTitle.value = tempBookTitle;
    editBookAuthor.value = tempBookAuthor;
    editBookYear.value = tempBookYear;

    const closeButtonEdit = document.getElementById("closeButtonEdit");
    closeButtonEdit.addEventListener("click", function () {
      editBookModal.style.display = "none";
      const saveMessage = document.getElementById("saveMessage");
      if (saveMessage) {
        saveMessage.remove();
      }
    });

    const bookTarget = findBook(id);
    if (bookTarget === null) return;

    const resetEditButton = document.getElementById("resetEditButton");
    resetEditButton.addEventListener("click", function () {
      editBookTitle.value = "";
      editBookAuthor.value = "";
      editBookYear.value = "";
    });

    saveEditButton.addEventListener("click", function () {
      bookTarget.title = editBookTitle.value;
      bookTarget.author = editBookAuthor.value;
      bookTarget.year = editBookYear.value;

      if (
        editBookTitle.value === tempBookTitle &&
        editBookAuthor.value === tempBookAuthor &&
        editBookYear.value === tempBookYear
      ) {
        return;
      }

      const saveMessage = document.getElementById("saveMessage");
      if (
        editBookTitle.value === "" ||
        editBookAuthor.value === "" ||
        editBookYear.value === ""
      ) {
        function failMessage() {
          const saveMessage = document.createElement("p");
          saveMessage.setAttribute("id", "saveMessage");
          saveMessage.style.color = "red";
          saveMessage.innerText = "Form tidak boleh kosong";
          editBookYear.parentNode.insertBefore(
            saveMessage,
            editBookYear.nextSibling
          );
        }
        if (!saveMessage) {
          failMessage();
          return;
        } else {
          saveMessage.remove();
          failMessage();
          return;
        }
      } else {
        if (saveMessage) {
          saveMessage.remove();
        }
        document.dispatchEvent(new Event(RENDER_EVENT));
        const successMessage = document.createElement("p");
        successMessage.setAttribute("id", "successMessage");
        successMessage.style.color = "green";
        successMessage.style.position = "absolute";
        successMessage.innerText = "Data buku berhasil diperbarui";
        editBookYear.parentNode.insertBefore(
          successMessage,
          editBookYear.nextSibling
        );
        setTimeout(() => {
          successMessage.remove();
        }, 2000);
        saveEdit();
        return;
      }
    });
    return;
  }

  function saveData() {
    if (isStorageExist()) {
      const parsed = JSON.stringify(books);
      localStorage.setItem(STORAGE_KEY, parsed);
    }
  }

  function saveEdit() {
    saveData();
    return;
  }

  function isStorageExist() {
    if (typeof Storage === undefined) {
      alert("Browser anda tidak mendukung local storage");
      return false;
    }
    return true;
  }

  function loadDataFromStorage() {
    const getBooks = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(getBooks);
    if (data !== null) {
      for (const book of data) {
        book.year = Number(book.year);
        books.push(book);
      }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
  }

  if (isStorageExist()) {
    loadDataFromStorage();
  }

  const searchBook = document.getElementById("searchBook");
  searchBook.addEventListener("submit", function (event) {
    event.preventDefault();
    const searchBookTitle = document
      .getElementById("searchBookTitle")
      .value.toLowerCase();

    searchBookByTitle(searchBookTitle);
  });

  const searchBookTitle = document.getElementById("searchBookTitle");
  searchBookTitle.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      searchBook.requestSubmit();
    }
  });

  function searchBookByTitle(searchBookTitle) {
    let searchResult = document.getElementById("searchResult");
    if (!searchResult && searchBookTitle !== "") {
      const searchBookSection = document.getElementById("searchBookSection");
      searchResult = document.createElement("div");
      searchResult.setAttribute("id", "searchResult");
      searchBookSection.append(searchResult);
    } else {
      searchResult.innerHTML = "";
    }

    if (searchBookTitle !== "") {
      books.forEach((book) => {
        if (book.title.toLowerCase().includes(searchBookTitle)) {
          const navigateButton = document.createElement("button");
          navigateButton.classList.add("navigateButton");
          navigateButton.innerText = `${book.title}`;

          navigateButton.addEventListener("click", function () {
            const bookItem = document.querySelector(
              `[data-bookid="${book.id}"]`
            );
            if (bookItem) {
              bookItem.scrollIntoView({ behavior: "smooth" });
              const bookTitle = document.querySelector(
                `[data-bookid="${book.id}"] h3`
              );
              bookTitle.setAttribute("style", "color: red;");
              setTimeout(() => {
                bookTitle.removeAttribute("style");
              }, 2000);
            } else {
              alert(`Buku dengan ID "${book.id}" tidak ditemukan.`);
            }
          });

          searchResult.append(navigateButton);
        }
      });
    }

    if (searchResult.innerHTML === "" && searchBookTitle !== "") {
      const searchMessage = document.createElement("p");
      searchMessage.setAttribute("style", "color: red;");
      searchMessage.innerText = "Buku yang anda cari tidak ditemukan";
      searchResult.append(searchMessage);
    }
  }

  function getDataBook(id) {
    const getDataBook = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(getDataBook);

    if (data !== null) {
      for (const book of data) {
        if (book.id === id) {
          return {
            tempBookTitle: book.title,
            tempBookAuthor: book.author,
            tempBookYear: book.year,
          };
        }
      }
    }
    return null;
  }
});
