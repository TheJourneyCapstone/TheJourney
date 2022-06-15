let bookContainer = document.querySelector(".search");
let searchBooks = document.getElementById("search-box");


searchBooks.addEventListener("input", () => debounce(showSearchedBooks(), 1000));


const getBooks = async (book) => {
	const response = await fetch(
		`https://www.googleapis.com/books/v1/volumes?q=${book}`
	);
	const data = await response.json();
	return data;
};

//shows thumbnail and returns a default thumbnail if a cover is not available for book.
const getThumbnail = ({ imageLinks }) => {
	const journeyThumbnail= "book/icon.svg"; //Need a default thumbnail for books without covers
	if (!imageLinks || !imageLinks.thumbnail) {
		return journeyThumbnail;
	}
	return imageLinks.thumbnail;
};

const showCatalogBooks = async (subject, startIndex = 0) => {
	let bookContainer = document.querySelector(`.${subject}`);
	bookContainer.innerHTML = `<div class='prompt'><div class="loader"></div></div>`;
	const data = await getBooks(
		`subject:${subject}&startIndex=${startIndex}&maxResults=6`
	);
	if (data.error) {
		bookContainer.innerHTML = `<div class='prompt'>Limit exceeded! Try after some time</div>`;
	} else if (data.totalItems == 0) {
		bookContainer.innerHTML = `<div class='prompt'>No results, try a different term!</div>`;
	} else if (data.totalItems == undefined) {
		bookContainer.innerHTML = `<div class='prompt'>Network problem!</div>`;
	} else if (!data.items || data.items.length == 0) {
		bookContainer.innerHTML = `<div class='prompt'>There is no more result!</div>`;
	} else {
		bookContainer.innerHTML = data.items;
		bookContainer.innerHTML = data.items
			.map(
				({ volumeInfo }) =>
					`<div class='book'><a class="book-result" href="/reviews"><img class='thumbnail' src='` +
					getThumbnailThumbnail(volumeInfo) + `' alt='cover'></a>
		<div class='book-info'><h3 class='book-title'><a class="book-result">${volumeInfo.title}</a></h3><div class='book-authors'>${volumeInfo.authors}</div><div class='info'>` +
					(volumeInfo.categories === undefined
						? "Others"
						: volumeInfo.categories) +
					`</div></div></div>`
			)
			.join("");
	}
};
const showSearchedBooks = async () => {
	if (searchBooks.value != "") {
		bookContainer.style.display = "flex";
		bookContainer.innerHTML = `<div class='prompt'><div class="loader"></div></div>`;
		const data = await getBooks(`${searchBooks.value}&maxResults=6`);
		if (data.error) {
			bookContainer.innerHTML = `<div class='prompt'>Limit exceeded! Try after some time</div>`;
		} else if (data.totalItems == 0) {
			bookContainer.innerHTML = `<div class='prompt'>No results, try a different term!</div>`;
		} else if (data.totalItems == undefined) {
			bookContainer.innerHTML = `<div class='prompt'>Network problem!</div>`;
		} else {
			bookContainer.innerHTML = data.items.map(({ volumeInfo }) =>
				`<div class='book'><div class="book-result"></div><img class='thumbnail' src='${getThumbnail(volumeInfo)}' alt='cover'></div>
                <div class='book-info'><h3 class='book-title'><div class="book-result">${volumeInfo.title}</a></h3>
                <div class='book-authors'>${volumeInfo.authors}</div>
                <div class='info'>` +
				(volumeInfo.categories === undefined
					? "Others"
					: volumeInfo.categories) +
				`</div>

                <form method="post" action="api/books">
                <input type="hidden" name="_csrf" value="${$("#csrf").val()}"/>
                <input type="hidden" name="title" value="${volumeInfo.title}">
                <input type="hidden" name="isbn" value="${volumeInfo.industryIdentifiers[0].identifier}">
                <input type="hidden" name="author" value="${volumeInfo.authors}">
                <input type="hidden" name="bookImage" value="${getThumbnail(volumeInfo)}">
                <input type="hidden" name="description" value="${volumeInfo.description}">
                <input type="hidden" name="genre" value="${volumeInfo.categories}">
                <input type="hidden" name="pageCount" value="${volumeInfo.pageCount}">
                <input type="hidden" name="publishedDate" value="${volumeInfo.publishedDate}">
                <button type="submit" class="btn btn-primary">View Details</button>
                </form>
                </div>



                </div>`
			)
				.join("");
		}
	} else {
		bookContainer.style.display = "none";
	}
};

const debounce = (fn, time, to = 0) => {
	to ? clearTimeout(to) : (to = setTimeout(showSearchedBooks, time));
};


let startIndex = 0;
const next = (subject) => {
	startIndex += 6;
	if (startIndex >= 0) {
		document.getElementById(`${subject}-prev`).style.display = "inline-flex";
		showCatalogBooks(subject, startIndex);
	} else {
		document.getElementById(`${subject}-prev`).style.display = "none";
	}
};
const prev = (subject) => {
	startIndex -= 6;
	if (startIndex <= 0) {
		startIndex = 0;
		showCatalogBooks(subject, startIndex);
		document.getElementById(`${subject}-prev`).style.display = "none";
	} else {
		document.getElementById(`${subject}-prev`).style.display = "inline-flex";
		showCatalogBooks(subject, startIndex);
	}
};