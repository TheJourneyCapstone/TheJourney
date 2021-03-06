let bookContainer = document.querySelector(".search");
let searchBooks = document.getElementById("search-box");

const debounce = (fn, to = 4) => {
	to ? clearTimeout(to) : (to = setTimeout(showSearchedBooks, 4));
};



searchBooks.addEventListener("keydown", (e) => {
	if (e.keyCode === 13) {
		debounce(showSearchedBooks(), 0);
	}
});

//utilizing fetch callback
const getBooks = async (book) => {
	const response = await fetch(
		`https://www.googleapis.com/books/v1/volumes?q=${book}&printType=books`
	);
	const data = await response.json();
	return data;
};

//shows thumbnail and returns a default thumbnail if a cover is not available for book.
const getThumbnail = ({ imageLinks }) => {
	const journeyThumbnail= "../images/thumbnail-replacement.jpg"; //Need a default thumbnail for books without covers
	if (!imageLinks || !imageLinks.thumbnail) {
		return journeyThumbnail;
	}
	return imageLinks.thumbnail;
};


const showSearchedBooks = async () => {
	if (searchBooks.value != "") {
		bookContainer.style.display = "flex";
		bookContainer.innerHTML =
			`<div class='prompt'><div class="loader"></div></div>`;
		const data = await getBooks(`${searchBooks.value}&maxResults=5`);
		if (data.error) {
			bookContainer.innerHTML = `<div class='prompt'>Network Problem!</div>`;
		} else if (data.totalItems == 0) {
			bookContainer.innerHTML = `<div class='prompt'>Try a different term</div>`;
		} else if (data.totalItems == undefined) {
			bookContainer.innerHTML = `<div class='prompt'>Network problem!</div>`;
		} else {
			bookContainer.innerHTML = data.items.map(({ volumeInfo }) =>
				`<div class='book'>
					<div class="book-result" style="width: 5rem; display: flex; justify-content:flex-start; align-items: center; margin-top: 90px;"></div>
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
						<button type="submit" class="btn">
						<img class='thumbnail searchBarBookImages' src='${getThumbnail(volumeInfo)}' alt='cover'><div class='book-info'><h4 class='book-title' style=" width: 200px; white-space: nowrap;overflow: hidden; text-overflow: ellipsis;"><div class="book-result">${volumeInfo.title}</a></h4>
                <div class='book-authors'style=" width: 200px; white-space: nowrap;overflow: hidden; text-overflow: ellipsis;">${volumeInfo.authors}</div>
						</button>
                    </form>
                </div>
               
                </div>`).join("");
		}
	} else {
		bookContainer.style.display = "none";
	}
};