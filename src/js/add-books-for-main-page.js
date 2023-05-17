import axios from 'axios';
import changeLastWordColor from './helpers/last-word-color';
import { addLoader, removeLoader } from './helpers/loader';
import * as basicLightbox from 'basiclightbox';
import '../../node_modules/basiclightbox/dist/basicLightbox.min.css';

const URL = 'https://books-backend.p.goit.global/books/category?category=';
const FOR_BOOK_URL = 'https://books-backend.p.goit.global/books/';

const booksList = document.querySelector('.js-books-list');
const categoriesContainer = document.querySelector('.categories-list-js');

categoriesContainer.addEventListener('click', onCtegoryLinkClick);

async function getBooksByCategory(choisedCategory) {
  const response = await axios(`${URL}${choisedCategory}`);
  return response.data;
}

function onCtegoryLinkClick(e) {
  removeLoader();
  addLoader();
  if (e.target.nodeName !== 'A') {
    return;
  }

  const selectedCategoryLink = document.querySelector(
    '.categories-list__item.is-active'
  );

  if (selectedCategoryLink) {
    selectedCategoryLink.classList.remove('is-active');
  }

  const parent = e.target.closest('.categories-list__item');
  parent.classList.add('is-active');

  const choisedCategory = e.target.textContent;
  getBooksByCategory(choisedCategory)
    .then(arr => {
      if (arr.length === 0) {
        removeLoader();
        return;
      }
      const categoryTitleText = arr[0].list_name;
      const categoryTitle = document.querySelector('.js-category-title');
      categoryTitle.textContent = categoryTitleText;

      changeLastWordColor(categoryTitle);
      const markup = createMarkupForBooksByCategory(arr);
      booksList.innerHTML = markup;
    })
    .catch(error => console.log(error))
    .finally(() => removeLoader());
}

function createMarkupForBooksByCategory(arr) {
  return arr
    .map(
      ({ book_image, title, list_name, author, _id }) => `
        <li class="book-list__item js-book-card" data-id="${_id}" >
            <a>
                <div class="book-thumb" >
                    <img
                    class="book-img js-open-modal-click"
                    src="${book_image}"
                    width="335"
                    alt=""
                    />
                    <div class="book-overlay js-open-modal-click">quick view</div>
                </div>
                <h3 class="book-tittle">${title}</h3>
                <p class="book-author">${author}</p>
            </a>
        </li>`
    )
    .join('');
}

booksList.addEventListener('click', onBookListClick);

function onBookListClick(e) {
  if (e.target.classList.contains('js-open-modal-click')) {
    const { id } = e.target.closest('.js-book-card').dataset;

    findBook(id)
      .then(book => {
        const findedBook = book.data;
        const amazon = findedBook.buy_links[0].url;
        const appleBook = findedBook.buy_links[1].url;
        const bookShop = findedBook.buy_links[4].url;
        const instance = basicLightbox.create(
          `
	    <div class="new-modal">
        <div class="new-modal-container">
          <div class="new-modal-book-flex">
            <img class="new-modal-img" src="${findedBook.book_image}" alt="" width="287" />
            <div class="new-book-modal-info">
              <h3 class="new-modal-book-title">${findedBook.title}</h3>
              <p class = "new-modal-book-author">${findedBook.author}</p>
              <p class="new-modal-book-description">${findedBook.description}</p>
              <ul class="new-modal-buy-link">
              <li>
                <a href="${amazon}" target="blank"
                  ><img src="../img/icon-book-store/amazon.png" alt="amazon"
                /></a>
              </li>
              <li>
                <a href="${appleBook}" target="blank"><img src="../img/icon-book-store/apple-store.png" alt="" /></a>
              </li>
              <li>
                <a href="${bookShop}" target="blank"><img src="../img/icon-book-store/book-shop.png" alt="" /></a>
              </li>
            </ul>
            </div>
          </div>
          <button class="new-book-modal-btn">add to shopping list</button>
        </div>
</div>

`,
          {
            onShow: () => document.addEventListener('keydown', onKeyPress),
            onClose: () => document.removeEventListener('keydown', onKeyPress),
          }
        );
        instance.show();
        function onKeyPress(evt) {
          if (evt.code === 'Escape') {
            instance.close();
          }
        }
      })
      .catch(err => console.log(err));
  }
}

async function findBook(bookId) {
  const response = axios(`${FOR_BOOK_URL}${bookId}`);
  return response;
}
