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

// GET /slots: show open times as buttons
async function loadSlots() {
    slotList.innerHTML = "";
    try {
        const response = await fetch(`${API_URL}/slots`);
        const data = await response.json();
        if (!data.openSlots || data.openSlots.length === 0) {
            slotList.innerHTML = '<p class="text-muted">No open times right now. Please check back soon or request another time below.</p>';
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
        slotList.innerHTML = '<p class="text-muted">Couldn\'t load times right now. Please request a time below or call (949) 630-7148.</p>';
    }
}

// Patient taps a time: highlight it and show the form
function pickSlot(slotId, button) {
    chosenSlot = slotId;
    slotList.querySelectorAll("button").forEach(b => b.classList.replace("btn-primary", "btn-outline-primary"));
    button.classList.replace("btn-outline-primary", "btn-primary");
    selectedSlotText.textContent = prettyTime(slotId);
    bookForm.classList.remove("d-none");
    bookMessage.innerHTML = "";
}

// POST /book: send their info and the chosen slot
bookForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!chosenSlot) return;
    bookButton.disabled = true;
    bookButton.textContent = "Sending...";

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
        bookMessage.innerHTML = '<p class="text-danger">Couldn\'t reach the system. Please try again or call (949) 630-7148.</p>';
    }

    bookButton.disabled = false;
    bookButton.textContent = "Request this time";
});

// Warm message after a time is requested
function showConfirmation(slotId) {
    bookMessage.innerHTML = `
        <div class="p-4 border rounded bg-white">
            <h3 class="h4 mb-3">Request received! We can't wait to see you.</h3>
            <p class="mb-2"><strong>When:</strong> <span id="confirmTime"></span></p>
            <p class="mb-2"><strong>Where:</strong> Concorde Career College, 12951 Euclid St #101, Garden Grove, CA 92840</p>
            <p class="mb-3"><a href="https://www.google.com/maps/search/?api=1&query=12951+Euclid+St+%23101+Garden+Grove+CA+92840" target="_blank" rel="noopener">Get directions</a></p>
            <p class="text-muted mb-0">Jay-An will call to confirm your visit. Please wait for her confirmation before coming in. Questions? Call or text (949) 630-7148.</p>
        </div>`;
    document.getElementById("confirmTime").textContent = prettyTime(slotId);
}

loadSlots();

// POST /request: patients who want a different time
const contactForm = document.getElementById("contactForm");
const submitButton = document.getElementById("submitButton");

contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    try {
        const response = await fetch(`${API_URL}/request`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: document.getElementById("name").value,
                email: document.getElementById("email").value,
                phone: document.getElementById("phone").value,
                preferredTime: document.getElementById("message").value
            })
        });

        if (response.ok) {
            contactForm.innerHTML = '<p class="connection-note">Thank you! We got your request. We can\'t wait to see you. Jay-An will reach out within 1–2 business days to find a time that works for you.</p>';
            return;
        }
        alert("Something went wrong. Please try again or call (949) 630-7148.");
    } catch (err) {
        alert("Couldn't reach the system. Please try again or call (949) 630-7148.");
    }

    submitButton.disabled = false;
    submitButton.textContent = "Request my free cleaning";
});
