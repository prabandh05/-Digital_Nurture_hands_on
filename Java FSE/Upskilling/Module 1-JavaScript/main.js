console.log("Welcome to the Community Portal");

const defaultEventName = "Community Music Night";
const defaultEventDate = "2026-07-12";
let defaultSeats = 5;
const defaultEventInfo = `${defaultEventName} is scheduled on ${defaultEventDate}. Seats available: ${defaultSeats}`;
console.log(defaultEventInfo);

function PortalEvent(id, name, date, category, location, seats) {
    this.id = id;
    this.name = name;
    this.date = date;
    this.category = category;
    this.location = location;
    this.seats = seats;
}

PortalEvent.prototype.checkAvailability = function () {
    return new Date(this.date) >= new Date() && this.seats > 0;
};

let events = [
    new PortalEvent(1, "Community Music Night", "2026-07-12", "Music", "Central Park", 5),
    new PortalEvent(2, "Baking Workshop", "2026-07-18", "Workshop", "Community Hall", 8),
    new PortalEvent(3, "Sports Meet", "2026-07-25", "Sports", "City Stadium", 0),
    new PortalEvent(4, "Clean City Volunteer Drive", "2026-08-02", "Volunteer", "Ward Office", 12),
    new PortalEvent(5, "Past Art Fair", "2025-05-03", "Workshop", "Community Hall", 10)
];

const registrationsByCategory = {};
const dom = {};

function createCategoryRegistrationTracker(category) {
    let total = 0;
    return function () {
        total++;
        registrationsByCategory[category] = total;
        return total;
    };
}

const categoryTrackers = {};

function getTracker(category = "General") {
    if (!categoryTrackers[category]) {
        categoryTrackers[category] = createCategoryRegistrationTracker(category);
    }

    return categoryTrackers[category];
}

function addEvent(eventDetails) {
    const nextId = Math.max(...events.map(({ id }) => id), 0) + 1;
    const newEvent = new PortalEvent(nextId, ...eventDetails);
    events.push(newEvent);
    return newEvent;
}

function filterEventsByCategory(category = "all", callback = event => event) {
    const clonedEvents = [...events];
    const filteredEvents = category === "all"
        ? clonedEvents
        : clonedEvents.filter(event => event.category === category);

    return filteredEvents.map(callback);
}

function getVisibleEvents() {
    const category = dom.categoryFilter.value;
    const location = dom.locationFilter.value;
    const searchText = dom.searchInput.value.trim().toLowerCase();

    return filterEventsByCategory(category)
        .filter(event => location === "all" || event.location === location)
        .filter(event => event.name.toLowerCase().includes(searchText))
        .filter(event => {
            if (event.checkAvailability()) {
                return true;
            }

            console.log(`Hidden invalid event: ${event.name}`);
            return false;
        });
}

function renderEvents(eventList = getVisibleEvents()) {
    dom.eventsContainer.innerHTML = "";
    dom.filterSummary.textContent = `${eventList.length} upcoming event(s) with seats available.`;

    if (eventList.length === 0) {
        dom.eventsContainer.innerHTML = "<p>No available events match your filters.</p>";
        return;
    }

    eventList.forEach(event => {
        const { id, name, date, category, location, seats } = event;
        const card = document.createElement("article");
        card.className = `event-card${seats === 0 ? " full" : ""}`;
        card.dataset.eventId = id;

        const title = document.createElement("h3");
        title.textContent = name;

        const details = document.createElement("p");
        details.textContent = `${name} happens on ${date} at ${location}.`;

        const meta = document.createElement("div");
        meta.className = "event-meta";
        meta.innerHTML = `
            <span class="pill">${category}</span>
            <span class="pill">${location}</span>
            <span class="pill">${seats} seats</span>
        `;

        const registerButton = document.createElement("button");
        registerButton.type = "button";
        registerButton.textContent = "Register";
        registerButton.onclick = () => {
            registerUser(id);
        };

        const cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.className = "secondary";
        cancelButton.textContent = "Cancel Seat";
        cancelButton.onclick = () => {
            cancelRegistration(id);
        };

        card.append(title, details, meta, registerButton, cancelButton);
        dom.eventsContainer.appendChild(card);
    });

    if (window.jQuery) {
        $(".event-card").hide().fadeIn(250);
    }
}

function populateEventSelect() {
    dom.eventSelect.innerHTML = '<option value="">Choose an event</option>';
    getVisibleEvents().forEach(({ id, name }) => {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = name;
        dom.eventSelect.appendChild(option);
    });
}

function renderObjectEntries() {
    const musicEvents = events.filter(event => event.category === "Music");
    const formattedCards = events.map(event => `${event.category} on ${event.name}`);
    const firstEventEntries = Object.entries(events[0]);

    dom.objectOutput.textContent = JSON.stringify({
        firstEventEntries,
        musicEvents: musicEvents.map(({ name }) => name),
        formattedCards,
        registrationsByCategory
    }, null, 2);
}

function refreshUI() {
    const visibleEvents = getVisibleEvents();
    renderEvents(visibleEvents);
    populateEventSelect();
    renderObjectEntries();
}

function registerUser(eventId) {
    try {
        const selectedEvent = events.find(event => event.id === Number(eventId));

        if (!selectedEvent) {
            throw new Error("Selected event was not found.");
        }

        if (!selectedEvent.checkAvailability()) {
            throw new Error(`${selectedEvent.name} is full or no longer upcoming.`);
        }

        selectedEvent.seats--;
        defaultSeats--;
        const totalForCategory = getTracker(selectedEvent.category)();
        console.log(`Registered for ${selectedEvent.name}. ${selectedEvent.seats} seat(s) left.`);
        console.log(`${selectedEvent.category} registrations tracked by closure: ${totalForCategory}`);
        dom.formMessage.textContent = `Registered for ${selectedEvent.name}.`;
        dom.formMessage.style.color = "#0b6b5f";
        refreshUI();
    } catch (error) {
        console.error("Registration failed:", error);
        dom.formMessage.textContent = error.message;
        dom.formMessage.style.color = "#c92a2a";
    }
}

function cancelRegistration(eventId) {
    const selectedEvent = events.find(event => event.id === Number(eventId));

    if (!selectedEvent) {
        return;
    }

    selectedEvent.seats++;
    console.log(`Cancelled one seat for ${selectedEvent.name}.`);
    dom.formMessage.textContent = `Cancelled one seat for ${selectedEvent.name}.`;
    dom.formMessage.style.color = "#52606d";
    refreshUI();
}

function validateRegistrationForm(form) {
    const formData = {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        eventId: form.elements.eventId.value
    };
    const errors = {};

    if (!formData.name) {
        errors.name = "Name is required.";
    }

    if (!formData.email || !formData.email.includes("@")) {
        errors.email = "A valid email is required.";
    }

    if (!formData.eventId) {
        errors.eventId = "Please choose an event.";
    }

    document.querySelectorAll("[data-error-for]").forEach(errorElement => {
        const fieldName = errorElement.dataset.errorFor;
        errorElement.textContent = errors[fieldName] || "";
    });

    return { isValid: Object.keys(errors).length === 0, formData };
}

function mockPostRegistration(payload) {
    console.log("Fetch request payload:", payload);

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (payload.email.endsWith("@fail.com")) {
                reject(new Error("Mock API rejected this email address."));
                return;
            }

            resolve({
                ok: true,
                json: () => Promise.resolve({ status: "success", registration: payload })
            });
        }, 900);
    });
}

function submitRegistrationToServer(payload) {
    return fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Server returned an error.");
            }

            return response.json();
        })
        .catch(error => {
            console.warn("Remote POST failed, using delayed mock response:", error.message);
            return mockPostRegistration(payload).then(response => response.json());
        });
}

function handleFormSubmit(event) {
    event.preventDefault();
    console.log("Form submission started.");
    const { isValid, formData } = validateRegistrationForm(event.currentTarget);

    if (!isValid) {
        console.warn("Form validation failed.", formData);
        dom.formMessage.textContent = "Please fix the highlighted errors.";
        dom.formMessage.style.color = "#c92a2a";
        return;
    }

    registerUser(formData.eventId);
    submitRegistrationToServer(formData)
        .then(result => {
            console.log("Registration saved:", result);
            dom.formMessage.textContent = "Registration submitted successfully.";
            dom.formMessage.style.color = "#0b6b5f";
        })
        .catch(error => {
            console.error("Registration submission failed:", error);
            dom.formMessage.textContent = "Registration could not be submitted.";
            dom.formMessage.style.color = "#c92a2a";
        });
}

function fetchEventsWithThen() {
    return fetch("data/events.json")
        .then(response => {
            if (!response.ok) {
                throw new Error("Could not load mock event data.");
            }

            return response.json();
        })
        .then(remoteEvents => {
            console.log("Mock API events loaded with .then():", remoteEvents);
            return remoteEvents;
        })
        .catch(error => {
            console.error("Mock API fetch failed:", error);
            return [];
        });
}

async function loadEventsAsync() {
    dom.spinner.classList.remove("hidden");

    try {
        const response = await fetch("data/events.json");

        if (!response.ok) {
            throw new Error("Could not load events with async/await.");
        }

        const remoteEvents = await response.json();
        events = remoteEvents.map(({ id, name, date, category, location, seats }) => (
            new PortalEvent(id, name, date, category, location, seats)
        ));
        addEvent(["Neighborhood Coding Meetup", "2026-08-10", "Workshop", "Community Hall", 15]);
        console.log("Mock API events loaded with async/await.");
        refreshUI();
    } catch (error) {
        console.error(error);
        dom.formMessage.textContent = "Unable to load mock API events. Open through a local server if using file paths.";
        dom.formMessage.style.color = "#c92a2a";
    } finally {
        dom.spinner.classList.add("hidden");
    }
}

function handleCategoryChange() {
    refreshUI();
}

function handleQuickSearch(event) {
    if (event.key === "Enter" || event.key.length === 1 || event.key === "Backspace") {
        setTimeout(refreshUI, 0);
    }
}

function cacheDomElements() {
    dom.eventsContainer = document.querySelector("#eventsContainer");
    dom.categoryFilter = document.querySelector("#categoryFilter");
    dom.locationFilter = document.querySelector("#locationFilter");
    dom.searchInput = document.querySelector("#searchInput");
    dom.eventSelect = document.querySelector("#eventSelect");
    dom.registrationForm = document.querySelector("#registrationForm");
    dom.formMessage = document.querySelector("#formMessage");
    dom.objectOutput = document.querySelector("#objectOutput");
    dom.filterSummary = document.querySelector("#filterSummary");
    dom.spinner = document.querySelector("#spinner");
    dom.loadAsyncBtn = document.querySelector("#loadAsyncBtn");
}

document.addEventListener("DOMContentLoaded", () => {
    cacheDomElements();
    alert("The Community Portal page has fully loaded.");
    fetchEventsWithThen();
    refreshUI();

    dom.locationFilter.onchange = refreshUI;
    dom.searchInput.addEventListener("keydown", handleQuickSearch);
    dom.registrationForm.addEventListener("submit", handleFormSubmit);
    dom.loadAsyncBtn.addEventListener("click", loadEventsAsync);

    if (window.jQuery) {
        $("#registerBtn").click(() => {
            console.log("jQuery click handler triggered for #registerBtn");
            $(".event-card").fadeOut(100).fadeIn(180);
        });
    }
});
