const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

let outOfOfficeCounter = 0;
let selectedDates2023 = [];
let selectedDates2024 = [];


document.addEventListener('DOMContentLoaded', function() {
    // Populate city dropdown and initialize calendar based on its value
    
    
    populateCityDropdown();
    initializeCounter();

    
});

function populateCityDropdown() {
    const cityDropdown = document.getElementById('citySelector');
    for (const city in months) {
        const option = document.createElement('option');
        option.value = city;
        option.innerText = city;
        cityDropdown.appendChild(option);
    }

    // Set dropdown value based on localStorage (if available)
    const savedCity = localStorage.getItem("selectedCity");
    if (savedCity) {
        cityDropdown.value = savedCity;
    } else {
        // Default to London if no city is saved in localStorage
        cityDropdown.value = "London";
    }

    cityDropdown.addEventListener('change', function() {
        // When city is changed, reinitialize the calendar
        initializeCalendar(cityDropdown.value, "2023");

        // Save the selected city to localStorage
        localStorage.setItem("selectedCity", cityDropdown.value);
    });

    // Initialize the calendar based on the dropdown value
    initializeCalendar(cityDropdown.value, "2023");
}

// New function to initialize the global counter
function initializeCounter() {
    outOfOfficeCounter = 0;
    for (let city in months) {
        for (let year in months[city]) {
            const CITY_YEAR_KEY = city + "_" + year;
            let citySelectedDates = JSON.parse(localStorage.getItem(CITY_YEAR_KEY) || "[]");
            for (let dateString of citySelectedDates) {
                let dateObj = new Date(dateString);
                if (dateObj.getDay() !== 0 && dateObj.getDay() !== 6 && !isHoliday(dateObj, months[city][year])) {
                    outOfOfficeCounter++;
                }
            }
        }
    }
    document.getElementById('counter').innerText = outOfOfficeCounter;
}

function isHoliday(dateObj, monthHolidays) {
    const month = monthNames[dateObj.getMonth()];
    const day = dateObj.getDate();
    if (monthHolidays[month] && monthHolidays[month].some(holiday => holiday[0] === day)) {
        return true;
    }
    return false;
}

function togglePanel(collapsibleBtn) {
    const contentDiv = collapsibleBtn.nextElementSibling;
    const chevron = collapsibleBtn.querySelector('.chevron');
    if (contentDiv.style.display === "block") {
        contentDiv.style.display = "none";
        chevron.textContent = '▶'; // Right pointing chevron (closed state)
    } else {
        contentDiv.style.display = "block";
        chevron.textContent = '▼'; // Down pointing chevron (open state)
    }
}


function initializeCalendar(city, year) {
    const CITY_YEAR_KEY_2023 = city + "_2023";
    const CITY_YEAR_KEY_2024 = city + "_2024";

    selectedDates2023 = JSON.parse(localStorage.getItem(CITY_YEAR_KEY_2023) || "[]");
    selectedDates2024 = JSON.parse(localStorage.getItem(CITY_YEAR_KEY_2024) || "[]");
    
    populateCalendar(months[city]["2023"], "calendar2023", CITY_YEAR_KEY_2023, 2023, selectedDates2023);
    populateCalendar(months[city]["2024"], "calendar2024", CITY_YEAR_KEY_2024, 2024, selectedDates2024);
}


function populateCalendar(yearData, calendarDivId, CITY_YEAR_KEY, year, selectedDatesForYear) {
    const calendarDiv = document.getElementById(calendarDivId);
    
    // Clear existing calendar content
    calendarDiv.innerHTML = '';

    monthNames.forEach((month, monthIndex) => {
        const monthDiv = document.createElement('div');
        monthDiv.className = 'month';

        // Add month name
        const monthName = document.createElement('div');
        monthName.innerText = monthNames[monthIndex];
        monthName.className = 'month-name';
        monthDiv.appendChild(monthName);

        // Add day names
        days.forEach(day => {
            const dayName = document.createElement('div');
            dayName.innerText = day;
            dayName.className = 'day-name';
            monthDiv.appendChild(dayName);
        });

        // Get the number of days in the month
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        const startDay = new Date(year, monthIndex, 1).getDay();

        // Add preceding empty days
        for (let i = 1; i < (startDay === 0 ? 7 : startDay); i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'day empty';
            monthDiv.appendChild(emptyDay);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(2023, monthIndex, day);
            const dateString = date.toISOString().split('T')[0];
            const dayDiv = document.createElement('div');
            dayDiv.className = 'day';
            dayDiv.innerText = day;

            
            // Check if the date was previously selected
            if (selectedDatesForYear.includes(dateString)) {
                dayDiv.classList.add('selected');
            }

            // Check if it's a holiday
            const monthHolidays = yearData[monthNames[monthIndex]] || [];
            const holiday = monthHolidays.find(h => h[0] === day);
            if (holiday) {
                dayDiv.classList.add('holiday');
                dayDiv.setAttribute('title', "Bank Holiday for " + holiday[1]);  // Set tooltip
            }

            // Set as weekend if Saturday or Sunday
            if (date.getDay() === 0 || date.getDay() === 6) {
                dayDiv.classList.add('weekend');
            }

            dayDiv.addEventListener('click', function() {
                handleDayClick(dayDiv, date, CITY_YEAR_KEY, selectedDatesForYear);
            });

            monthDiv.appendChild(dayDiv);
        }

        calendarDiv.appendChild(monthDiv);
    });
}

function handleDayClick(dayDiv, date, CITY_YEAR_KEY, selectedDatesForYear) {
    const dateString = date.toISOString().split('T')[0];

    if (dayDiv.classList.contains('selected')) {
        dayDiv.classList.remove('selected');
        selectedDatesForYear = selectedDatesForYear.filter(d => d !== dateString); // Modified this line
        if (!dayDiv.classList.contains('holiday') && date.getDay() !== 0 && date.getDay() !== 6) {
            outOfOfficeCounter--;
        }
    } else {
        dayDiv.classList.add('selected');
        selectedDatesForYear.push(dateString); // Modified this line
        if (!dayDiv.classList.contains('holiday') && date.getDay() !== 0 && date.getDay() !== 6) {
            outOfOfficeCounter++;
        }
    }

    // Save the updated selected dates to localStorage
    localStorage.setItem(CITY_YEAR_KEY, JSON.stringify(selectedDatesForYear)); // Modified this line
    document.getElementById('counter').innerText = outOfOfficeCounter;

    console.log(`[Debug] ${CITY_YEAR_KEY}:`, selectedDatesForYear); // Modified this line
}


function updateCounter() {
    selectedDates.forEach(dateString => {
        const date = new Date(dateString);
        if (date.getDay() !== 0 && date.getDay() !== 6 && !months["London"]["2023"][monthNames[date.getMonth()]].some(h => h[0] === date.getDate())) {
            outOfOfficeCounter++;
        }
    });
    document.getElementById('counter').innerText = outOfOfficeCounter;
}
