// stores suitably-lengthed description of each blog card
let cardDetails = [];

// initial window width
let windowWidth = window.innerWidth;


function shorten(text, maxLength) {
	return text.length > maxLength ? 
		text.slice(0, maxLength) + '...': 
		text;
}


// if page width is greater than 
// a specified pixel, do f1, else do f2
function ifWidthGreaterThan(width, f1, f2, arg) {
	window.innerWidth >= width ? f1(arg) : f2(arg);
}


function createCard(title, image, description, url, date) {
	return `<div class="card">
		<a href="${url}" title="${title}">
        <img src="${image}">
        <div class="card-content">
		<h4>${title}</h4>
		<p class="description">${description}</p>
		<p class="date">${date}</p>
		</div></a></div>`;
}


// if card description overlaps with the date, hide the date
function isOverlapDateCard() {
	let descriptions = document.querySelectorAll('.description');
	let dates = document.querySelectorAll('.date');

	for (let i = 0; i < descriptions.length; i++) {
		let description = descriptions.item(i);
		let date = dates.item(i);

		if (description.getBoundingClientRect().bottom >
			date.getBoundingClientRect().top) {
			dates.innerHTML = '';
			break;
		}
	}
}


function loadCards() {
	fetch('https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@tirkarp')
	.then((res) => {
		if (res.ok) {
			return res.json();
		} else {
			return Promise.reject(res);
		}
	})
	.then((data) => {
		const posts = data.items.filter(item => item.categories.length > 0);

		// parse JSON's HTML tag-filled description into raw text
		let toText = (node) => {
			let tag = document.createElement('div');
			tag.innerHTML = node;
			node = tag.innerText;
			return node;
		}

		// all the card stuff
		let cards = '';

		posts.forEach((item) => {
			let pubDate = new Date(Date.parse(item.pubDate.replace(/ /g, 'T')));
			let dateString = pubDate.toLocaleDateString(
				'default',
				{ year: 'numeric', month: 'long', day: 'numeric' }
			);
			
			// check for invalid dates
			dateString = dateString ? dateString : '';

			// store card details in global variable
			let details = {
				description: shorten(toText(item.description), 160),
				date: dateString
			};
			cardDetails.push(details);

			let card = createCard(
				shorten(item.title, 50),
				item.thumbnail,
				shorten(details.description, 75),
				item.link,
				dateString
			);
			
			cards += card;
		});

		document.getElementById('scrolling-wrapper').innerHTML = cards;
	})
	.then(refillTextCard)
	.then(isOverlapDateCard)
	.catch((err) => {
		console.log(err);
	});
}


// determine how much description to fill in blog cards
function refillTextCard() {
	let desktopCard = (node) => {
		node.childNodes.forEach((card, index) => {
			card.querySelector('.description').innerHTML = cardDetails[index].description;
			card.querySelector('.date').innerHTML = cardDetails[index].date;
		});
	};

	let mobileCard = (node) => {
		node.childNodes.forEach((card, index) => {
			card.querySelector('.description').innerHTML = shorten(cardDetails[index].description, 50);
			card.querySelector('.date').innerHTML = cardDetails[index].date;
		});
	};

	let cards = document.getElementById('scrolling-wrapper');

	// if resolution is wide enough, fill in a lot of descriptions
	ifWidthGreaterThan(768, desktopCard, mobileCard, cards);
}


function loadCalendar() {
	let calendarSource = '<iframe id="calendar-content" src="https://calendar.google.com/calendar/embed?height=300&wkst=1&ctz=America%2FNew_York&bgcolor=%23ffffff&showTitle=0&title=Public%20Calendar&src=cGR1YW5nc3VAZ21haWwuY29t&src=cTc5dDlwYWpqYmgyNXFmc2wwbzdxMHY4bDQ1NHZqNDdAaW1wb3J0LmNhbGVuZGFyLmdvb2dsZS5jb20&src=YTM4OGxybjJhMXRkN2xqM3B2cXUyNnBvMzFrYjUzcWNAaW1wb3J0LmNhbGVuZGFyLmdvb2dsZS5jb20&src=ZmFtaWx5MTI5ODkyMTk1MDM3NTE0OTg4MzNAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&src=ZW4udXNhI2hvbGlkYXlAZ3JvdXAudi5jYWxlbmRhci5nb29nbGUuY29t&src=Nm02dGIyMjNibW5wcDgybTRsZm8wN3Z1cWNhaTE1ZGRAaW1wb3J0LmNhbGVuZGFyLmdvb2dsZS5jb20&color=%23cca300&color=%23E4C441&color=%23795548&color=%23F4511E&color=%230B8043&color=%23B39DDB&showPrint=0&showCalendars=0&mode=';
	let calendarStyle = '" style="border-width:0" width="" height="300" frameborder="0" scrolling="no"></iframe>'
	
	let desktopCalendar = (node) => {
		node.outerHTML = calendarSource + 'WEEK' + calendarStyle;
	};
	let mobileCalendar = (node) => {
		node.outerHTML = calendarSource + 'AGENDA' + calendarStyle;
	};

	let calendar = document.getElementById('calendar-content');

	// if resolution is wide enough, switch Calendar to Week Mode
	ifWidthGreaterThan(640, desktopCalendar, mobileCalendar, calendar);
}


window.addEventListener('DOMContentLoaded', (event) => {
	loadCards();
	loadCalendar();
});

window.addEventListener('orientationchange', (event) => {
	loadCalendar();
	refillTextCard();
	isOverlapDateCard();
});

window.addEventListener('resize', (event) => {
	// prevent iOS triggering resize on scroll
	if (window.innerWidth != windowWidth) {
		refillTextCard();
		isOverlapDateCard();
		loadCalendar();

		windowWidth = window.innerWidth;
	}
});
