const API_URL = "https://498pqb5lq4.execute-api.us-east-1.amazonaws.com";

const slotList = document.getElementById("slotList");
const bookForm = document.getElementById("bookForm");
const selectedSlotText = document.getElementById("selectedSlot");
const bookButton = document.getElementById("bookButton");
const bookMessage = document.getElementById("bookMessage");
let chosenSlot = null;

// Turn "2026-11-05T10:00" into "Thu, Nov 5 at 10:00 AM"
function prettyTime(slotId) {
    const [datePart, timePart] = slotId.split("T");
    const [y, m, d] = datePart.split("-").map(Number);
    let [hour, minute] = timePart.split(":").map(Number);
    const date = new Date(y, m - 1, d);
    const day = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${day} at ${hour}:${String(minute).padStart(2, "0")} ${ampm}`;
}

// Step 2 of the flow: ask GET /slots for the open times and show them as buttons
async function loadSlots() {
    slotList.innerHTML = "";
    try {
        const response = await fetch(`${API_URL}/slots`);
        const data = await response.json();
        if (!data.openSlots || data.openSlots.length === 0) {
            slotList.innerHTML = '<p class="text-muted">No open times right now. Please check back soon or use the form below.</p>';
            return;
        }
        data.openSlots.forEach(slotId => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "btn btn-outline-primary";
            button.textContent = prettyTime(slotId);
            button.addEventListener("click", () => pickSlot(slotId, button));
            slotList.appendChild(button);
        });
    } catch (err) {
        slotList.innerHTML = '<p class="text-muted">Couldn\'t load times right now. Please use the form below.</p>';
    }
}

// When a patient taps a time, highlight it and show the form
function pickSlot(slotId, button) {
    chosenSlot = slotId;
    slotList.querySelectorAll("button").forEach(b => b.classList.replace("btn-primary", "btn-outline-primary"));
    button.classList.replace("btn-outline-primary", "btn-primary");
    selectedSlotText.textContent = prettyTime(slotId);
    bookForm.classList.remove("d-none");
    bookMessage.innerHTML = "";
}

// Step 3 of the flow: POST /book with their info and chosen slot
bookForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!chosenSlot) return;
    bookButton.disabled = true;
    bookButton.textContent = "Booking...";

    try {
        const response = await fetch(`${API_URL}/book`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                slotId: chosenSlot,
                name: document.getElementById("bookName").value,
                email: document.getElementById("bookEmail").value,
                phone: document.getElementById("bookPhone").value
            })
        });
        const data = await response.json();

        if (response.ok) {
            showConfirmation(chosenSlot);
            bookForm.reset();
            bookForm.classList.add("d-none");
            loadSlots();
        } else {
            bookMessage.innerHTML = "";
            const p = document.createElement("p");
            p.className = "text-danger";
            p.textContent = data.error || "Something went wrong. Please try again.";
            bookMessage.appendChild(p);
            if (response.status === 409) loadSlots();
        }
    } catch (err) {
        bookMessage.innerHTML = '<p class="text-danger">Couldn\'t reach the booking system. Please try again or use the form below.</p>';
    }

    bookButton.disabled = false;
    bookButton.textContent = "Book This Time";
});

// The warm welcome message after a successful booking
function showConfirmation(slotId) {
    bookMessage.innerHTML = `
        <div class="p-4 border rounded bg-white">
            <h3 class="h4 mb-3">You're booked! We can't wait to see you.</h3>
            <p class="mb-2"><strong>When:</strong> <span id="confirmTime"></span></p>
            <p class="mb-2"><strong>Where:</strong> Concorde Career College, Garden Grove</p>
            <p class="mb-3"><a href="https://www.google.com/maps/search/?api=1&query=Concorde+Career+College+Garden+Grove" target="_blank" rel="noopener">Get directions</a></p>
            <p class="text-muted mb-0">Jay-An will reach out to confirm. Questions? Call or text +1 (949) 630-7148.</p>
        </div>`;
    document.getElementById("confirmTime").textContent = prettyTime(slotId);
}

loadSlots();