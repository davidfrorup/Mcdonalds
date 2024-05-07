// Variabler til at holde styr på bestilling og omsætning
let bestillingsnummer = localStorage.getItem('bestillingsnummer') ? parseInt(localStorage.getItem('bestillingsnummer')) : 1;
let omsætning = localStorage.getItem('omsætning') ? parseFloat(localStorage.getItem('omsætning')) : 0;
let currentOrder = [];
let dailySales = localStorage.getItem('dailySales') ? parseFloat(localStorage.getItem('dailySales')) : 0;

// Funktion til at skjule alle menuer undtagen den med det angivne id
function showMenu(menuId) {
    document.querySelectorAll('.menu').forEach(menu => {
        if (menu.id === menuId) {
            menu.style.display = 'block';
        } else {
            menu.style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Tilføj eventlistener til nulstilknapknappen
    document.getElementById('reset-button').addEventListener('click', resetAll);

    // Anden relevant kode kan også placeres her, for at sikre at den kun kører når DOM'en er indlæst.
});

// Funktion til at tilføje en vare til kurven
function addToCart(item) {
    const cartItems = document.getElementById('kurv-elementer');
    const total = document.getElementById('total-pris');

    const newItem = document.createElement('li');
    newItem.textContent = item.textContent + ' (' + item.dataset.pris + ' kr.)';
    cartItems.appendChild(newItem);

    // Opdater totalprisen
    let currentTotal = parseFloat(total.textContent) || 0;
    let itemPrice = parseFloat(item.dataset.pris) || 0;
    total.textContent = currentTotal + itemPrice + ' kr.';

    // Tilføj til den aktuelle ordre
    currentOrder.push({ item: item.textContent, price: itemPrice });

    // Tilføj en eventlistener til sletknappen for det nye element
    const removeButton = document.createElement('span');
    removeButton.textContent = 'x';
    removeButton.className = 'remove-item';
    newItem.appendChild(removeButton);
    removeButton.addEventListener('click', () => {
        removeFromCart(newItem);
    });
}

// Funktion til at fjerne en vare fra kurven
function removeFromCart(item) {
    const cartItems = document.getElementById('kurv-elementer');
    const total = document.getElementById('total-pris');

    cartItems.removeChild(item);

    // Opdater totalprisen
    let currentTotal = parseFloat(total.textContent);
    let itemPrice = parseFloat(item.textContent.match(/\d+/)[0]); // Få prisen fra teksten i listeelementet
    total.textContent = currentTotal - itemPrice + ' kr.';

    // Fjern fra den aktuelle ordre
    let index = currentOrder.findIndex(orderItem => orderItem.item === item.textContent);
    if (index !== -1) {
        currentOrder.splice(index, 1);
    }
}

// Funktion til at afslutte en bestilling
function completeOrder() {
    // Tjek om kurven er tom
    const cartItems = document.getElementById('kurv-elementer');
    if (cartItems.children.length === 0) {
        alert('Kurven er tom. Tilføj varer før du bestiller.');
        return;
    }

    // Hent kurvens indhold og saml totalpris
    let orderItems = currentOrder.map(orderItem => orderItem.item);
    let orderTotal = currentOrder.reduce((acc, orderItem) => acc + orderItem.price, 0);

    // Opdater omsætning
    omsætning += orderTotal;
    document.getElementById('omsætning-beløb').textContent = omsætning + ' kr.';

    // Vis bestillingsseddel
    document.getElementById('bestillingsseddel').style.display = 'block';
    document.getElementById('seddel-bestillingsnummer').textContent = bestillingsnummer;
    document.getElementById('seddel-total-pris').textContent = orderTotal + ' kr.';

    // Tilføj den aktuelle bestilling til ordrelisten
    addToOrderList(bestillingsnummer, orderItems, orderTotal);

    // Nulstil kurv og klargør til ny bestilling
    cartItems.innerHTML = '';
    document.getElementById('total-pris').textContent = '0 kr.';

    // Nulstil currentOrder-arrayet for den næste ordre
    currentOrder = [];

    // Opdater bestillingsnummer
    bestillingsnummer++;
    document.getElementById('bestillingsnummer').textContent = bestillingsnummer;

    // Gem bestillingsnummer, omsætning og daglige salg i localStorage
    localStorage.setItem('bestillingsnummer', bestillingsnummer);
    localStorage.setItem('omsætning', omsætning);
    localStorage.setItem('dailySales', dailySales);
}

// Funktion til at annullere en bestilling
function cancelOrder() {
    // Nulstil kurv og klargør til ny bestilling
    const cartItems = document.getElementById('kurv-elementer');
    cartItems.innerHTML = '';
    document.getElementById('total-pris').textContent = '0 kr.';
}

// Funktion til at lukke bestillingsseddel
function closeOrderReceipt() {
    document.getElementById('bestillingsseddel').style.display = 'none';
}

function addToOrderList(orderNumber, orderItems, orderTotal) {
    const orderList = document.getElementById('ordre-elementer');

    // Opret et nyt listeelement til ordrenummeret
    const orderNumberItem = document.createElement('li');
    orderNumberItem.textContent = 'Ordre #' + orderNumber;
    orderList.appendChild(orderNumberItem);

    // Tilføj line break efter ordrenummeret
    orderList.appendChild(document.createElement('br'));

    // Opret et nyt listeelement til hver vare med prisen
    orderItems.forEach(item => {
        const itemElement = document.createElement('li');
        const itemName = item.name || item; // Håndterer både objekter og strengnavne
        const itemPrice = item.price || 0; // Håndterer objekter med pris og strengnavne uden pris
       /*  itemElement.textContent = itemName + ' - ' + itemPrice + ' kr.'; // Tilføjer prisen ud for hver vare */
        orderList.appendChild(itemElement);
    });

    currentOrder.forEach(orderItem => {
        const itemElement = document.createElement('li');
        itemElement.textContent = orderItem.item + ' - ' + orderItem.price + ' kr.';
        orderList.appendChild(itemElement);
    });

    // Tilføj line break efter varerne
    orderList.appendChild(document.createElement('br'));

    // Opret et nyt listeelement til totalprisen
    const totalPriceItem = document.createElement('li');
    totalPriceItem.textContent = 'Total: ' + orderTotal + ' kr.';
    totalPriceItem.classList.add('totalpris'); // Tilføj klassen 'totalpris' til totalprisen
    orderList.appendChild(totalPriceItem);

    // Tilføj line break efter totalprisen
    orderList.appendChild(document.createElement('br'));

    // Gem ordrelisten i localStorage
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push({ orderNumber, orderItems, orderTotal });
    localStorage.setItem('orders', JSON.stringify(orders));
}

// Funktion til at nulstille omsætning, bestillingsnummer og ordreliste
function resetAll() {
    // Nulstil omsætning og gem i localStorage
    omsætning = 0;
    document.getElementById('omsætning-beløb').textContent = '0 kr.';
    localStorage.setItem('omsætning', omsætning);

    // Nulstil bestillingsnummer
    bestillingsnummer = 1;
    document.getElementById('bestillingsnummer').textContent = bestillingsnummer;

    // Nulstil ordrelisten
    const orderList = document.getElementById('ordre-elementer');
    orderList.innerHTML = '';

    // Gem ændringer i localStorage
    localStorage.setItem('bestillingsnummer', bestillingsnummer);
    localStorage.setItem('orders', JSON.stringify([]));

    // Skjul bestillingsseddel
    document.getElementById('bestillingsseddel').style.display = 'none';
}

// Funktion til at indlæse ordrelisten fra localStorage ved siden af indlæsning
window.onload = () => {
    document.getElementById('bestillingsnummer').textContent = bestillingsnummer;
    document.getElementById('omsætning-beløb').textContent = omsætning + ' kr.';

    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const orderList = document.getElementById('ordre-elementer');

    orders.forEach(order => {
        const newOrder = document.createElement('li');
        newOrder.textContent = 'Ordre #' + order.orderNumber + ': ' + order.orderItems.join(', ') + ' - Total: ' + (order.orderTotal || 0) + ' kr.';
        orderList.appendChild(newOrder);
    });

    // Tilføj eventlistener til knapper
    document.querySelectorAll('.menu-button').forEach(button => {
        button.addEventListener('click', () => {
            const menuId = button.getAttribute('data-menu');
            showMenu(menuId);
        });
    });

    document.querySelectorAll('.menu li').forEach(item => {
        item.addEventListener('click', (event) => {
            if (event.ctrlKey) {
                removeFromCart(item);
            } else {
                addToCart(item);
            }
        });
    });

    document.getElementById('bestil').addEventListener('click', completeOrder);
    document.getElementById('annuller').addEventListener('click', cancelOrder);
    document.getElementById('luk-seddel').addEventListener('click', closeOrderReceipt);
    document.getElementById('reset-button').addEventListener('click', resetAll);

    // Tilføj eventlistener til sletknapperne
    document.querySelectorAll('.remove-item').forEach(item => {
        item.addEventListener('click', () => {
            removeFromCart(item.parentElement);
        });
    });
};
